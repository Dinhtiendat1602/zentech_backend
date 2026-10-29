/**
 * ==============================================================================
 * DỰ ÁN: ZenTech (ZenStore) - iViettech Project Document
 * FILE: backend/tests/admin.test.js
 * MÔ TẢ: Kịch bản kiểm thử tự động phân hệ Quản trị Dashboard & Báo cáo số liệu
 * ==============================================================================
 */

import request from 'supertest';
import app from '../index.js';

describe('PHÂN HỆ BÁO CÁO QUẢN TRỊ & THỐNG KÊ (ADMIN DASHBOARD STATS)', () => {

  /**
   * TC-ADM-03: Lấy số liệu thống kê Dashboard tổng quan
   * Các bước: Đăng nhập quyền Admin, gọi API GET /api/admin/stats
   * Kết quả mong đợi: Trả về HTTP 200, chứa các chỉ số: tổng doanh thu, tổng đơn hàng, tổng sản phẩm
   */
  test('TC-ADM-03: Lấy báo cáo thống kê Dashboard tổng quan cho Quản trị viên', async () => {
    const adminToken = 'Bearer mock_admin_valid_jwt_token';

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', adminToken);

    expect(response.statusCode).toBe(200);
    const stats = response.body.data;
    expect(stats).toBeDefined();

    // Kiểm tra các chỉ số cốt lõi của Dashboard
    expect(stats).toHaveProperty('totalRevenue');   // Tổng doanh thu
    expect(stats).toHaveProperty('totalOrders');    // Tổng đơn hàng
    expect(stats).toHaveProperty('totalProducts');  // Tổng sản phẩm
    expect(stats).toHaveProperty('totalCustomers'); // Tổng khách hàng

    expect(typeof stats.totalRevenue).toBe('number');
    expect(typeof stats.totalOrders).toBe('number');
  });

  /**
   * TC-ADM-04: Lấy danh sách sản phẩm bán chạy nhất
   * Các bước: Gọi API GET /api/admin/top-products
   * Kết quả mong đợi: Trả về danh sách máy ảnh/ống kính có số lượng bán nhiều nhất
   */
  test('TC-ADM-04: Lấy danh sách top sản phẩm bán chạy nhất', async () => {
    const adminToken = 'Bearer mock_admin_valid_jwt_token';

    const response = await request(app)
      .get('/api/admin/top-products')
      .set('Authorization', adminToken);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

});
