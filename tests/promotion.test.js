/**
 * ==============================================================================
 * DỰ ÁN: ZenTech (ZenStore) - iViettech Project Document
 * FILE: backend/tests/promotion.test.js
 * MÔ TẢ: Kịch bản kiểm thử tự động phân hệ Mã giảm giá & Khuyến mãi (Promotions)
 * ==============================================================================
 */

import request from 'supertest';
import app from '../index.js';

describe('PHÂN HỆ KHUYẾN MÃI & MÃ GIẢM GIÁ (PROMOTION & VOUCHER)', () => {

  /**
   * TC-PROMO-01: Áp dụng mã giảm giá hợp lệ
   * Các bước: Nhập mã "ZENTECH10" (giảm 10%, tối đa 500.000₫ cho đơn từ 2.000.000₫)
   * Kết quả mong đợi: Trả về HTTP 200, tính đúng số tiền được chiết khấu
   */
  test('TC-PROMO-01: Áp dụng mã giảm giá hợp lệ -> Tính đúng số tiền chiết khấu', async () => {
    const payload = {
      code: 'ZENTECH10',
      orderAmount: 5000000, // Đơn 5.000.000₫
    };

    const response = await request(app)
      .post('/api/promotions/apply')
      .send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('discountAmount');
    // Giảm 10% của 5 triệu là 500k (bằng trần maxDiscountAmount)
    expect(response.body.data.discountAmount).toBe(500000);
  });

  /**
   * TC-PROMO-02: Áp dụng mã khi đơn hàng chưa đạt giá trị tối thiểu
   * Các bước: Nhập mã giảm giá với đơn hàng chỉ 500.000₫ (yêu cầu tối thiểu 2.000.000₫)
   * Kết quả mong đợi: Trả về HTTP 400 kèm thông báo chưa đủ điều kiện áp dụng
   */
  test('TC-PROMO-02: Đơn hàng chưa đạt giá trị tối thiểu -> Báo lỗi HTTP 400', async () => {
    const payload = {
      code: 'ZENTECH10',
      orderAmount: 500000,
    };

    const response = await request(app)
      .post('/api/promotions/apply')
      .send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/giá trị đơn hàng tối thiểu/i);
  });

  /**
   * TC-PROMO-03: Áp dụng mã giảm giá đã hết hạn sử dụng
   * Các bước: Nhập mã voucher đã qua ngày endDate
   * Kết quả mong đợi: Trả về HTTP 400, thông báo mã khuyến mãi đã hết hạn
   */
  test('TC-PROMO-03: Nhập mã giảm giá đã hết hạn -> Báo lỗi HTTP 400', async () => {
    const payload = {
      code: 'EXPIRED2025',
      orderAmount: 10000000,
    };

    const response = await request(app)
      .post('/api/promotions/apply')
      .send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/hết hạn|không tồn tại|không còn hiệu lực/i);
  });

});
