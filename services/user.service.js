import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { User, Product } from '../models/index.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

export const getDashboardService = async (userId) => {
  const user = await User.findOne({
    where: { id: userId, isActive: true },
    attributes: ['id', 'fullName', 'email', 'phone', 'address', 'avatar', 'role'],
  });
  if (!user) throw fail('Không tìm thấy tài khoản.', 404);

  const [orders, wishlist, promotions, createdAtRows] = await Promise.all([
    sequelize.query(
      `SELECT o.id, o.order_code, o.status, o.payment_status, o.payment_method,
              o.final_amount, o.created_at,
              COALESCE(json_agg(json_build_object(
                'id', oi.id,
                'productId', oi.product_id,
                'productSlug', p.slug,
                'productImage', p.thumbnail,
                'name', oi.product_name,
                'quantity', oi.quantity,
                'price', oi.price,
                'total', oi.total,
                'reviewed', (EXISTS(SELECT 1 FROM reviews r WHERE r.user_id = :userId AND r.product_id = oi.product_id)),
                'userRating', (SELECT r.rating FROM reviews r WHERE r.user_id = :userId AND r.product_id = oi.product_id ORDER BY r.id DESC LIMIT 1),
                'userComment', (SELECT r.comment FROM reviews r WHERE r.user_id = :userId AND r.product_id = oi.product_id ORDER BY r.id DESC LIMIT 1)
              )) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = :userId
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      { replacements: { userId }, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT w.id AS wishlist_id, w.added_at, p.id AS product_id, p.slug AS id,
              p.name, p.price, p.sale_price AS "salePrice", p.thumbnail AS image,
              c.name AS category_name
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE w.user_id = :userId
       ORDER BY w.added_at DESC`,
      { replacements: { userId }, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT id, code, name, description, discount_type AS "discountType",
              discount_value AS "discountValue", min_order_amount AS "minOrderAmount",
              max_discount_amount AS "maxDiscountAmount", end_date AS "endDate"
       FROM promotions
       WHERE is_active = TRUE AND start_date <= NOW() AND end_date >= NOW()
         AND (usage_limit IS NULL OR used_count < usage_limit)
       ORDER BY end_date ASC`,
      { type: QueryTypes.SELECT },
    ),
    sequelize.query(
      'SELECT created_at FROM users WHERE id = :userId',
      { replacements: { userId }, type: QueryTypes.SELECT },
    ),
  ]);

  return {
    profile: {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      role: user.role,
      created_at: createdAtRows[0]?.created_at ?? null,
    },
    orders,
    wishlist: wishlist.map((item) => ({
      ...item,
      brand: ['Canon', 'Sony', 'Nikon', 'Fujifilm', 'Panasonic', 'Sigma'].find((brand) => item.name.toLowerCase().includes(brand.toLowerCase())) ?? 'Khác',
      price: Number(item.salePrice ?? item.price),
      oldPrice: item.salePrice ? Number(item.price) : null,
    })),
    promotions,
  };
};

export const updateProfileService = async (userId, data = {}) => {
  const fields = [];
  const replacements = { userId };
  if (Object.hasOwn(data, 'full_name')) {
    if (typeof data.full_name !== 'string' || !data.full_name.trim() || data.full_name.trim().length > 150) {
      throw fail('Họ tên không hợp lệ (tối đa 150 ký tự).', 400);
    }
    fields.push('full_name = :fullName');
    replacements.fullName = data.full_name.trim();
  }
  if (Object.hasOwn(data, 'phone')) {
    if (typeof data.phone !== 'string' || data.phone.trim().length > 20) throw fail('Số điện thoại không hợp lệ.', 400);
    fields.push('phone = :phone');
    replacements.phone = data.phone.trim() || null;
  }
  if (Object.hasOwn(data, 'address')) {
    if (typeof data.address !== 'string' || data.address.trim().length > 500) throw fail('Địa chỉ không hợp lệ.', 400);
    fields.push('address = :address');
    replacements.address = data.address.trim() || null;
  }
  if (!fields.length) throw fail('Không có thông tin nào để cập nhật.', 400);

  const [updated] = await sequelize.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = :userId AND is_active = TRUE
     RETURNING id, full_name, email, phone, address, avatar, role, created_at`,
    { replacements, type: QueryTypes.SELECT },
  );
  if (!updated) throw fail('Không tìm thấy tài khoản.', 404);
  return updated;
};

export const addWishlistService = async (userId, slug) => {
  const product = await Product.findOne({ where: { slug }, attributes: ['id'] });
  if (!product) throw fail('Không tìm thấy sản phẩm.', 404);
  await sequelize.query(
    `INSERT INTO wishlists (user_id, product_id) VALUES (:userId, :productId)
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    { replacements: { userId, productId: product.id } },
  );
  return { added: true };
};

export const removeWishlistService = async (userId, slug) => {
  await sequelize.query(
    `DELETE FROM wishlists w USING products p
     WHERE w.user_id = :userId AND w.product_id = p.id AND p.slug = :slug`,
    { replacements: { userId, slug } },
  );
  return { removed: true };
};

export const getAllService = async ({ q = '', range = 'month', startDate, endDate, allTime } = {}) => {
  const replacements = { q, pattern: `%${q}%` };
  let dateCondition = '';

  if (allTime === 'true' || range === 'all') {
    // Không lọc thời gian -> tải tất cả người dùng từ trước
  } else if (startDate || endDate) {
    if (startDate && endDate) {
      dateCondition = 'AND u.created_at >= :startDate::timestamptz AND u.created_at <= :endDate::timestamptz';
      replacements.startDate = `${startDate} 00:00:00`;
      replacements.endDate = `${endDate} 23:59:59.999`;
    } else if (startDate) {
      dateCondition = 'AND u.created_at >= :startDate::timestamptz';
      replacements.startDate = `${startDate} 00:00:00`;
    } else if (endDate) {
      dateCondition = 'AND u.created_at <= :endDate::timestamptz';
      replacements.endDate = `${endDate} 23:59:59.999`;
    }
  } else {
    // Mặc định: 1 tháng gần nhất
    dateCondition = "AND u.created_at >= CURRENT_DATE - INTERVAL '30 days'";
  }

  const result = await sequelize.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
            COUNT(DISTINCT o.id)::int AS order_count,
            COALESCE(SUM(o.final_amount) FILTER (WHERE o.status <> 'cancelled'), 0) AS total_spent
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     WHERE u.role <> 'admin'
       ${dateCondition}
       AND (:q = '' OR u.full_name ILIKE :pattern OR u.email ILIKE :pattern OR COALESCE(u.phone, '') ILIKE :pattern)
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    { replacements, type: QueryTypes.SELECT },
  );
  return result;
};

export const getByIdService = async (id) => {
  const user = await User.findByPk(id, { attributes: ['id', 'fullName', 'email', 'phone', 'address', 'role', 'isActive'] });
  if (!user) throw fail('Không tìm thấy khách hàng.', 404);
  return user;
};

export const createService = async (data) => data;
export const updateService = async (id, data) => ({ id, ...data });
export const removeService = async () => true;
