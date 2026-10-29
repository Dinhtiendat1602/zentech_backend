import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';

export const getDashboardService = async () => {
  const [summary] = await sequelize.query(
    `SELECT
       (SELECT COALESCE(SUM(final_amount), 0) FROM orders WHERE status <> 'cancelled' AND created_at >= CURRENT_DATE - INTERVAL '30 days') AS revenue_month,
       (SELECT COUNT(*)::int FROM orders WHERE status <> 'cancelled' AND created_at >= CURRENT_DATE - INTERVAL '30 days') AS orders_month,
       (SELECT COALESCE(SUM(final_amount), 0) FROM orders WHERE status <> 'cancelled' AND created_at::date = CURRENT_DATE) AS revenue_today,
       (SELECT COUNT(*)::int FROM orders WHERE created_at::date = CURRENT_DATE) AS orders_today,
       (SELECT COUNT(*)::int FROM orders WHERE status = 'pending') AS pending_orders,
       (SELECT COUNT(*)::int FROM products) AS products_total,
       (SELECT COUNT(*)::int FROM products WHERE quantity > 0) AS products_available,
       (SELECT COUNT(*)::int FROM products WHERE quantity > 0 AND quantity < 10) AS low_stock,
       (SELECT COUNT(*)::int FROM users WHERE role <> 'admin' AND created_at >= CURRENT_DATE - INTERVAL '30 days') AS customers_total,
       (SELECT COUNT(*)::int FROM promotions WHERE is_active = TRUE AND start_date <= NOW() AND end_date >= NOW()) AS promotions_active`,
    { type: QueryTypes.SELECT },
  );
  const recentOrders = await sequelize.query(
    `SELECT id, order_code, customer_name, customer_email, final_amount, status, payment_status, created_at
     FROM orders
     WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
     ORDER BY created_at DESC LIMIT 8`,
    { type: QueryTypes.SELECT },
  );
  const revenue = await sequelize.query(
    `SELECT created_at::date AS date, COALESCE(SUM(final_amount), 0) AS total
     FROM orders
     WHERE created_at >= CURRENT_DATE - INTERVAL '29 days' AND status <> 'cancelled'
     GROUP BY created_at::date ORDER BY date ASC`,
    { type: QueryTypes.SELECT },
  );
  const [reviews] = await sequelize.query('SELECT COUNT(*)::int AS total FROM reviews', { type: QueryTypes.SELECT });
  return { summary, recentOrders, revenue, reviewsTotal: reviews.total };
};