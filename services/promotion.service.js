import { Op } from 'sequelize';
import { Promotion } from '../models/index.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const DISCOUNT_TYPES = ['percentage', 'fixed'];

function promotionValues(data = {}) {
  const code = String(data.code ?? '').trim().toUpperCase();
  const name = String(data.name ?? '').trim();
  const discountType = data.discountType ?? data.discount_type;
  const discountValue = Number(data.discountValue ?? data.discount_value);
  const minOrderAmount = Number(data.minOrderAmount ?? data.min_order_amount ?? 0);
  const maxValue = data.maxDiscountAmount ?? data.max_discount_amount;
  const maxDiscountAmount = maxValue === '' || maxValue == null ? null : Number(maxValue);
  const startDate = data.startDate ?? data.start_date;
  const endDate = data.endDate ?? data.end_date;
  const usageValue = data.usageLimit ?? data.usage_limit;
  const usageLimit = usageValue === '' || usageValue == null ? null : Number(usageValue);
  if (!/^[A-Z0-9_-]{3,50}$/.test(code)) throw fail('Mã ưu đãi chỉ gồm chữ in hoa, số, gạch ngang hoặc gạch dưới (3–50 ký tự).', 400);
  if (!name || name.length > 100) throw fail('Tên chương trình không hợp lệ.', 400);
  if (!DISCOUNT_TYPES.includes(discountType)) throw fail('Loại giảm giá không hợp lệ.', 400);
  if (!Number.isFinite(discountValue) || discountValue <= 0 || (discountType === 'percentage' && discountValue > 100)) throw fail('Giá trị giảm giá không hợp lệ.', 400);
  if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) throw fail('Giá trị đơn tối thiểu không hợp lệ.', 400);
  if (maxDiscountAmount !== null && (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0)) throw fail('Mức giảm tối đa không hợp lệ.', 400);
  if (!startDate || !endDate || Number.isNaN(Date.parse(startDate)) || Number.isNaN(Date.parse(endDate)) || Date.parse(endDate) <= Date.parse(startDate)) throw fail('Khoảng thời gian mã ưu đãi không hợp lệ.', 400);
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) throw fail('Giới hạn lượt dùng phải là số nguyên dương.', 400);
  return { code, name, description: data.description?.trim() || null, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, isActive: data.isActive ?? data.is_active ?? true };
}

export const getAllService = async (query = {}) => {
  const where = {};
  if (query.q) where[Op.or] = [{ code: { [Op.iLike]: `%${query.q}%` } }, { name: { [Op.iLike]: `%${query.q}%` } }, { description: { [Op.iLike]: `%${query.q}%` } }];
  return Promotion.findAll({ where, order: [['id', 'DESC']] });
};

export const getByIdService = async (id) => {
  const promotion = await Promotion.findByPk(id);
  if (!promotion) throw fail('Không tìm thấy mã ưu đãi.', 404);
  return promotion;
};

export const createService = async (data) => Promotion.create(promotionValues(data));

export const updateService = async (id, data) => {
  const promotion = await getByIdService(id);
  const values = promotionValues({
    code: data.code ?? promotion.code,
    name: data.name ?? promotion.name,
    description: data.description === undefined ? promotion.description : data.description,
    discountType: data.discountType ?? promotion.discountType,
    discountValue: data.discountValue ?? promotion.discountValue,
    minOrderAmount: data.minOrderAmount ?? promotion.minOrderAmount,
    maxDiscountAmount: data.maxDiscountAmount === undefined ? promotion.maxDiscountAmount : data.maxDiscountAmount,
    startDate: data.startDate ?? promotion.startDate,
    endDate: data.endDate ?? promotion.endDate,
    usageLimit: data.usageLimit === undefined ? promotion.usageLimit : data.usageLimit,
    isActive: data.isActive ?? promotion.isActive,
  });
  await promotion.update(values);
  return promotion;
};

export const removeService = async (id) => {
  const promotion = await getByIdService(id);
  await promotion.destroy();
  return true;
};

export const checkPromotionService = async (code, orderAmount = 0) => {
  const cleanCode = String(code ?? '').trim().toUpperCase();
  if (!cleanCode) {
    throw fail('Vui lòng nhập mã giảm giá.', 400);
  }

  // Find promotion by uppercase code
  const promotion = await Promotion.findOne({
    where: {
      [Op.and]: [
        Promotion.sequelize.where(
          Promotion.sequelize.fn('UPPER', Promotion.sequelize.col('code')),
          cleanCode
        ),
      ],
    },
  });

  if (!promotion) {
    throw fail('Mã giảm giá không hợp lệ.', 400);
  }

  if (!promotion.isActive) {
    throw fail('Mã giảm giá không hợp lệ.', 400);
  }

  const now = new Date();
  if (promotion.startDate && new Date(promotion.startDate) > now) {
    throw fail('Mã giảm giá chưa đến ngày áp dụng.', 400);
  }

  if (promotion.endDate && new Date(promotion.endDate) < now) {
    throw fail('Mã giảm giá đã hết hạn sử dụng.', 400);
  }

  const usageLimit = promotion.usageLimit === null || promotion.usageLimit === undefined ? null : Number(promotion.usageLimit);
  const usedCount = Number(promotion.usedCount || 0);

  if (usageLimit !== null && usedCount >= usageLimit) {
    throw fail('Mã giảm giá đã hết lượt sử dụng.', 400);
  }

  const currentAmount = Number(orderAmount || 0);
  const minOrder = Number(promotion.minOrderAmount || 0);
  if (minOrder > 0 && currentAmount < minOrder) {
    const minFormatted = new Intl.NumberFormat('vi-VN').format(minOrder) + 'đ';
    throw fail(`Đơn hàng tối thiểu phải từ ${minFormatted} để áp dụng mã này.`, 400);
  }

  const discountValue = Number(promotion.discountValue);
  let discountAmount = 0;
  if (promotion.discountType === 'percentage') {
    discountAmount = Math.round((currentAmount * discountValue) / 100);
    const maxDiscount = promotion.maxDiscountAmount === null || promotion.maxDiscountAmount === undefined
      ? null
      : Number(promotion.maxDiscountAmount);
    if (maxDiscount !== null && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }
  } else {
    // fixed direct discount
    discountAmount = Math.min(discountValue, currentAmount);
  }

  return {
    id: promotion.id,
    code: promotion.code,
    name: promotion.name,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue,
    discountAmount,
    finalAmount: Math.max(0, currentAmount - discountAmount),
    minOrderAmount: minOrder,
    maxDiscountAmount: promotion.maxDiscountAmount ? Number(promotion.maxDiscountAmount) : null,
  };
};

