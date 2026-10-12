import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { Review, Product, User } from '../models/index.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

export const getAllService = async (query = {}) => {
  let productId = query.productId ? Number(query.productId) : null;
  if (!productId && query.slug) {
    const product = await Product.findOne({ where: { slug: query.slug }, attributes: ['id'] });
    if (product) productId = product.id;
  }

  const reviews = await sequelize.query(
    `SELECT r.id, r.user_id AS "userId", r.product_id AS "productId",
            r.rating, r.comment, r.created_at AS "createdAt",
            COALESCE(u.full_name, 'Khách hàng') AS "userName",
            u.avatar AS "userAvatar"
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE (:productId::int IS NULL OR r.product_id = :productId::int)
     ORDER BY r.created_at DESC`,
    { replacements: { productId }, type: QueryTypes.SELECT },
  );

  return reviews;
};

export const getByIdService = async (id) => {
  const review = await Review.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'avatar'] }],
  });
  if (!review) throw fail('Không tìm thấy đánh giá.', 404);
  return review;
};

export const createService = async (data = {}, userId) => {
  if (!userId) throw fail('Vui lòng đăng nhập để đánh giá.', 401);

  let productId = Number(data.productId);
  if (!productId && (data.productSlug || data.slug)) {
    const product = await Product.findOne({
      where: { slug: String(data.productSlug || data.slug) },
      attributes: ['id'],
    });
    if (product) productId = product.id;
  }

  if (!productId) throw fail('Vui lòng chọn sản phẩm cần đánh giá.', 400);

  const product = await Product.findByPk(productId);
  if (!product) throw fail('Sản phẩm không tồn tại.', 404);

  const rating = Math.round(Number(data.rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw fail('Số sao đánh giá phải từ 1 đến 5 sao.', 400);
  }

  const comment = data.comment ? String(data.comment).trim() : null;

  // CHỈ MUA HÀNG XONG (đơn hàng trạng thái completed) MỚI CÓ QUYỀN ĐÁNH GIÁ
  const [purchased] = await sequelize.query(
    `SELECT 1
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = :userId
       AND oi.product_id = :productId
       AND o.status = 'completed'
     LIMIT 1`,
    { replacements: { userId, productId }, type: QueryTypes.SELECT },
  );

  if (!purchased) {
    throw fail('Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng và đơn hàng đã hoàn tất giao hàng.', 403);
  }

  // Nếu người dùng đã từng đánh giá sản phẩm này thì cập nhật
  let review = await Review.findOne({ where: { userId, productId } });
  if (review) {
    await review.update({ rating, comment, createdAt: new Date() });
  } else {
    review = await Review.create({ userId, productId, rating, comment, createdAt: new Date() });
  }

  return review;
};

export const updateService = async (id, data = {}, userId) => {
  const review = await Review.findByPk(id);
  if (!review) throw fail('Không tìm thấy đánh giá.', 404);
  if (review.userId !== userId) throw fail('Bạn không có quyền sửa đánh giá này.', 403);

  const updates = {};
  if (data.rating !== undefined) {
    const rating = Math.round(Number(data.rating));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw fail('Số sao phải từ 1 đến 5.', 400);
    updates.rating = rating;
  }
  if (data.comment !== undefined) {
    updates.comment = data.comment ? String(data.comment).trim() : null;
  }

  await review.update(updates);
  return review;
};

export const removeService = async (id, userId, role) => {
  const review = await Review.findByPk(id);
  if (!review) throw fail('Không tìm thấy đánh giá.', 404);
  if (role !== 'admin' && review.userId !== userId) throw fail('Bạn không có quyền xóa đánh giá này.', 403);
  await review.destroy();
  return true;
};
