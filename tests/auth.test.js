/**
 * ==============================================================================
 * DỰ ÁN: ZenTech (ZenStore) - iViettech Project Document
 * FILE: backend/tests/auth.test.js
 * MÔ TẢ: Kịch bản kiểm thử tự động phân hệ Xác thực (Authentication) & Phân quyền
 * CÔNG CỤ MINH HỌA: Jest & Supertest
 * ==============================================================================
 */

import request from 'supertest';
import app from '../index.js';

describe('PHÂN HỆ XÁC THỰC & PHÂN QUYỀN (AUTHENTICATION & AUTHORIZATION)', () => {

  /**
   * TC-AUTH-01: Đăng nhập hợp lệ
   * Các bước: Nhập email và password chính xác, bấm "ĐĂNG NHẬP"
   * Kết quả mong đợi: Trả về HTTP 200, lưu token vào LocalStorage, điều hướng về trang chủ hoặc dashboard
   */
  test('TC-AUTH-01: Đăng nhập tài khoản hợp lệ thành công -> Trả về HTTP 200 kèm JWT Token', async () => {
    const payload = {
      email: 'admin@gmail.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(payload);

    // Kiểm tra mã phản hồi HTTP
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);

    // Kiểm tra cấu trúc dữ liệu trả về
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.email).toBe(payload.email);
    expect(response.body.data.user.role).toBe('admin');
  });

  /**
   * TC-AUTH-02: Đăng nhập sai mật khẩu
   * Các bước: Nhập email đúng, mật khẩu sai, bấm "ĐĂNG NHẬP"
   * Kết quả mong đợi: Hiển thị thông báo lỗi màu đỏ, không tạo token
   */
  test('TC-AUTH-02: Đăng nhập sai mật khẩu -> Trả về HTTP 400 kèm thông báo lỗi', async () => {
    const payload = {
      email: 'admin@gmail.com',
      password: 'mat_khau_khong_dung_123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBeUndefined(); // Không tạo token
    expect(response.body.message).toMatch(/mật khẩu không chính xác|thông tin đăng nhập/i);
  });

  /**
   * TC-AUTH-03: Hết hạn phiên làm việc (Expired Token)
   * Các bước: Gửi request với token giả lập đã hết hạn
   * Kết quả mong đợi: Hệ thống từ chối yêu cầu, logout và yêu cầu đăng nhập lại
   */
  test('TC-AUTH-03: Kiểm tra hết hạn phiên -> Token hết hiệu lực trả về HTTP 401', async () => {
    const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired_payload_demo';

    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', expiredToken);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatch(/hết hạn|vui lòng đăng nhập lại/i);
  });

  /**
   * TC-ADM-01: Chặn quyền truy cập Admin đối với người dùng thông thường
   * Các bước: Dùng tài khoản role "customer" truy cập trực tiếp URL API quản trị /api/admin
   * Kết quả mong đợi: Bị từ chối truy cập, API trả mã 403 Forbidden
   */
  test('TC-ADM-01: Tài khoản Customer truy cập tài nguyên Admin -> Trả về HTTP 403 Forbidden', async () => {
    // Giả lập token của khách hàng thông thường (role: customer)
    const customerToken = 'Bearer mock_customer_valid_jwt_token';

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', customerToken);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/không có quyền truy cập|forbidden/i);
  });

});
