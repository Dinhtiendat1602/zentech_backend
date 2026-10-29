/**
 * ==============================================================================
 * DỰ ÁN: ZenTech (ZenStore) - iViettech Project Document
 * FILE: backend/tests/review.test.js
 * MÔ TẢ: Kịch bản kiểm thử tự động phân hệ Đánh giá sản phẩm (Reviews & Ratings)
 * ==============================================================================
 */

import request from 'supertest';
import app from '../index.js';

describe('PHÂN HỆ ĐÁNH GIÁ SẢN PHẨM (REVIEWS & RATINGS)', () => {

  /**
   * TC-REV-01: Gửi đánh giá sản phẩm hợp lệ
   * Các bước: Khách hàng đăng nhập, gửi điểm 5 sao và nhận xét chi tiết
   * Kết quả mong đợi: Trả về HTTP 201, lưu thành công vào cơ sở dữ liệu
   */
  test('TC-REV-01: Người dùng gửi đánh giá 5 sao hợp lệ -> Lưu thành công vào DB', async () => {
    const customerToken = 'Bearer mock_customer_valid_jwt_token';
    const reviewPayload = {
      productId: 27, // Nikon Z8
      rating: 5,
      comment: 'Máy ảnh chụp nét tuyệt vời, lấy nét tự động siêu nhanh!',
    };

    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', customerToken)
      .send(reviewPayload);

    expect(response.statusCode).toBe(201);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.rating).toBe(5);
    expect(response.body.data.comment).toBe(reviewPayload.comment);
  });

  /**
   * TC-REV-02: Gửi đánh giá với số sao không hợp lệ
   * Các bước: Gửi rating = 6 (ngoài khoảng cho phép 1 - 5 sao)
   * Kết quả mong đợi: Bị chặn, trả về HTTP 400 kèm thông báo lỗi
   */
  test('TC-REV-02: Gửi điểm đánh giá không hợp lệ (6 sao) -> Báo lỗi HTTP 400', async () => {
    const customerToken = 'Bearer mock_customer_valid_jwt_token';
    const invalidPayload = {
      productId: 27,
      rating: 6,
      comment: 'Điểm số không hợp lệ',
    };

    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', customerToken)
      .send(invalidPayload);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/điểm đánh giá|từ 1 đến 5/i);
  });

  /**
   * TC-REV-03: Lấy danh sách đánh giá của sản phẩm
   * Các bước: Gửi GET /api/reviews?slug=nikon-z8
   * Kết quả mong đợi: Trả về HTTP 200, danh sách mảng các đánh giá và thông tin người đánh giá
   */
  test('TC-REV-03: Lấy danh sách đánh giá của sản phẩm theo slug', async () => {
    const response = await request(app)
      .get('/api/reviews?slug=nikon-z8');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

});
