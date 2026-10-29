/**
 * ==============================================================================
 * DỰ ÁN: ZenTech (ZenStore) - iViettech Project Document
 * FILE: backend/tests/user.test.js
 * MÔ TẢ: Kịch bản kiểm thử tự động phân hệ Hồ sơ người dùng & Yêu thích (User & Wishlist)
 * ==============================================================================
 */

import request from 'supertest';
import app from '../index.js';

describe('PHÂN HỆ NGƯỜI DÙNG & DANH SÁCH YÊU THÍCH (USER PROFILE & WISHLIST)', () => {

  /**
   * TC-USER-01: Lấy thông tin cá nhân của tài khoản đăng nhập
   * Các bước: Gửi token hợp lệ tới GET /api/users/me
   * Kết quả mong đợi: Trả về HTTP 200, thông tin email, họ tên, số điện thoại, avatar
   */
  test('TC-USER-01: Lấy thông tin cá nhân hợp lệ -> Trả về HTTP 200 kèm Profile', async () => {
    const customerToken = 'Bearer mock_customer_valid_jwt_token';

    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', customerToken);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('email');
    expect(response.body.data).toHaveProperty('fullName');
  });

  /**
   * TC-USER-02: Cập nhật thông tin cá nhân
   * Các bước: Gửi họ tên mới và số điện thoại mới tới PUT /api/users/me
   * Kết quả mong đợi: Trả về HTTP 200, dữ liệu hồ sơ được cập nhật trong DB
   */
  test('TC-USER-02: Cập nhật họ tên và số điện thoại thành công', async () => {
    const customerToken = 'Bearer mock_customer_valid_jwt_token';
    const updatePayload = {
      fullName: 'Nguyễn Văn ZenTech',
      phone: '0905999888',
    };

    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', customerToken)
      .send(updatePayload);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.fullName).toBe(updatePayload.fullName);
    expect(response.body.data.phone).toBe(updatePayload.phone);
  });

  /**
   * TC-USER-03: Thêm sản phẩm vào danh sách yêu thích (Wishlist)
   * Các bước: Bấm biểu tượng trái tim yêu thích sản phẩm Nikon Z8
   * Kết quả mong đợi: Sản phẩm được lưu vào bảng wishlist của tài khoản
   */
  test('TC-USER-03: Thêm máy ảnh vào danh sách yêu thích -> Lưu vào Wishlist', async () => {
    const customerToken = 'Bearer mock_customer_valid_jwt_token';
    const productId = 27;

    const response = await request(app)
      .post('/api/users/me/wishlist')
      .set('Authorization', customerToken)
      .send({ productId });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

});
