import { Op, Sequelize } from 'sequelize';
import { Order, OrderItem, Product, User, Promotion } from '../models/index.js';
import { sendOrderNotificationEmails } from './mail.service.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const orderIncludes = [
  { model: OrderItem, as: 'orderItems', attributes: ['id', 'productName', 'quantity', 'price', 'total'] },
  { model: User, as: 'user', attributes: ['id', 'fullName', 'email'], required: false },
  { model: Promotion, as: 'promotion', attributes: ['id', 'code', 'name', 'discountType', 'discountValue'], required: false },
];

export const getAllService = async (query = {}) => {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.q) {
    where[Op.or] = [
      { orderCode: { [Op.iLike]: `%${query.q}%` } },
      { customerName: { [Op.iLike]: `%${query.q}%` } },
      { customerEmail: { [Op.iLike]: `%${query.q}%` } },
      { customerPhone: { [Op.iLike]: `%${query.q}%` } },
      { customerAddress: { [Op.iLike]: `%${query.q}%` } },
    ];
  }
  return Order.findAll({ where, include: orderIncludes, order: [['id', 'DESC']] });
};

export const getByIdService = async (id) => {
  const order = await Order.findByPk(id, { include: orderIncludes });
  if (!order) throw fail('Không tìm thấy đơn hàng.', 404);
  return order;
};

export const createService = async (data) => {
  const order = await Order.create(data);
  return order;
};

export const checkoutService = async (data, userId = null) => {
  const customerName = String(data.customerName || data.name || '').trim();
  const customerPhone = String(data.customerPhone || data.phone || '').trim();
  const customerEmail = String(data.customerEmail || data.email || '').trim();
  const customerAddress = String(data.customerAddress || data.address || '').trim();
  const totalAmount = Number(data.totalAmount || data.subtotal || 0);
  const shippingFee = Number(data.shippingFee || 0);
  const discountAmount = Number(data.discountAmount || 0);
  const finalAmount = Math.max(0, totalAmount + shippingFee - discountAmount);
  const paymentMethod = ['bank', 'banking_qr', 'qr'].includes(data.paymentMethod) ? 'bank' : (data.paymentMethod || 'cod');
  const note = data.note ? String(data.note).trim() : null;

  if (!customerName) throw fail('Vui lòng nhập họ và tên.', 400);
  if (!customerPhone) throw fail('Vui lòng nhập số điện thoại.', 400);
  if (!customerEmail) throw fail('Vui lòng nhập email.', 400);
  if (!customerAddress) throw fail('Vui lòng nhập địa chỉ nhận hàng.', 400);

  let promotionId = data.promotionId ? Number(data.promotionId) : null;
  if (data.promotionCode && !promotionId) {
    const promo = await Promotion.findOne({
      where: Sequelize.where(
        Sequelize.fn('UPPER', Sequelize.col('code')),
        String(data.promotionCode).trim().toUpperCase()
      ),
    });
    if (promo) promotionId = promo.id;
  }

  // Generate unique order code
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `ORD-${dateStr}-${randNum}`;

  const order = await Order.create({
    orderCode,
    userId: userId || data.userId || null,
    promotionId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    totalAmount,
    shippingFee,
    discountAmount,
    finalAmount,
    paymentMethod,
    paymentStatus: 'unpaid',
    status: 'pending',
    note,
  });

  // If promotion was used, increment usedCount
  if (promotionId) {
    await Promotion.increment('usedCount', { where: { id: promotionId } });
  }

  // If items provided, save order items
  if (Array.isArray(data.items) && data.items.length > 0) {
    const defaultProduct = await Product.findOne({ attributes: ['id'] });
    const fallbackProductId = defaultProduct ? defaultProduct.id : null;

    const orderItems = await Promise.all(data.items.map(async (item) => {
      let productId = Number(item.databaseId || item.id) || null;
      if (!productId && (item.id || item.slug)) {
        const found = await Product.findOne({
          where: { slug: String(item.id || item.slug) },
          attributes: ['id'],
        });
        if (found) productId = found.id;
      }
      if (!productId && item.name) {
        const foundByName = await Product.findOne({
          where: { name: { [Op.iLike]: `%${String(item.name).trim()}%` } },
          attributes: ['id'],
        });
        if (foundByName) productId = foundByName.id;
      }
      if (!productId) {
        productId = fallbackProductId;
      }

      return {
        orderId: order.id,
        productId,
        productName: item.name || 'Sản phẩm',
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        total: (Number(item.price) || 0) * (Number(item.quantity) || 1),
      };
    }));
    await OrderItem.bulkCreate(orderItems);
  }

  const createdOrder = await getByIdService(order.id);

  // Gửi email xác nhận cho Khách hàng & thông báo đơn mới cho Admin (bất đồng bộ)
  sendOrderNotificationEmails(createdOrder).catch((err) => {
    console.error('Lỗi khi gửi email thông báo đơn hàng:', err?.message || err);
  });

  return createdOrder;
};

export const updateService = async (id, data = {}) => {
  const order = await Order.findByPk(id);
  if (!order) throw fail('Không tìm thấy đơn hàng.', 404);
  const allowedStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  const allowedPayments = ['unpaid', 'paid', 'failed'];
  const updates = {};
  if (data.status !== undefined) {
    if (!allowedStatuses.includes(data.status)) throw fail('Trạng thái đơn hàng không hợp lệ.', 400);

    // Một khi đã qua bước chờ xác nhận (đã xác nhận, đang giao, đã giao hoặc đã hủy), không được phép quay lại 'pending'
    if (order.status !== 'pending' && data.status === 'pending') {
      throw fail('Đơn hàng đã được xác nhận xử lý, không thể chuyển lại về trạng thái "Chờ xác nhận".', 400);
    }

    // Đơn hàng đã giao thành công (completed) không cho phép thay đổi trạng thái
    if (order.status === 'completed' && data.status !== 'completed') {
      throw fail('Đơn hàng đã giao thành công, không thể thay đổi trạng thái.', 400);
    }

    updates.status = data.status;
  }
  if (data.paymentStatus !== undefined) {
    if (!allowedPayments.includes(data.paymentStatus)) throw fail('Trạng thái thanh toán không hợp lệ.', 400);
    updates.paymentStatus = data.paymentStatus;
  }
  if (!Object.keys(updates).length) throw fail('Không có thông tin hợp lệ để cập nhật.', 400);
  await order.update(updates);
  return getByIdService(id);
};

export const cancelUserOrderService = async (orderId, userId, reason = '') => {
  const order = await Order.findByPk(orderId);
  if (!order) throw fail('Không tìm thấy đơn hàng.', 404);

  if (Number(order.userId) !== Number(userId)) {
    throw fail('Bạn không có quyền thực hiện thao tác trên đơn hàng này.', 403);
  }

  // Ràng buộc: Khi đã giao hàng rồi (shipping hoặc completed) thì không cho hủy
  if (['shipping', 'completed'].includes(order.status)) {
    throw fail('Đơn hàng đang trong quá trình vận chuyển hoặc đã giao thành công, không thể hủy đơn.', 400);
  }

  if (order.status === 'cancelled') {
    throw fail('Đơn hàng này đã được hủy trước đó.', 400);
  }

  const updates = { status: 'cancelled' };
  if (reason && typeof reason === 'string') {
    const cleanReason = reason.trim();
    if (cleanReason) {
      updates.note = order.note
        ? `${order.note} | Khách hủy: ${cleanReason}`
        : `Khách hủy: ${cleanReason}`;
    }
  }

  await order.update(updates);
  return getByIdService(orderId);
};

export const removeService = async (id) => {
  const order = await Order.findByPk(id);
  if (!order) throw fail('Không tìm thấy đơn hàng.', 404);
  if (!['pending', 'cancelled'].includes(order.status)) throw fail('Chỉ xóa đơn chờ xác nhận hoặc đã hủy.', 409);
  await order.destroy();
  return true;
};

