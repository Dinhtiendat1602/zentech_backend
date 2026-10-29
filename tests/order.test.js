/**
 * ==============================================================================
 * DỰ ÁN: ZenTech (ZenStore) - iViettech Project Document
 * FILE: backend/tests/order.test.js
 * MÔ TẢ: Kịch bản kiểm thử tự động phân hệ Đơn hàng & Quản trị đơn hàng (Orders)
 * ==============================================================================
 */

import request from 'supertest';
import app from '../index.js';

describe('PHÂN HỆ ĐẶT HÀNG & QUẢN TRỊ ĐƠN HÀNG (ORDERS & CHECKOUT)', () => {

  /**
   * TC-ORD-01: Đặt hàng thanh toán chuyển khoản VietQR
   * Các bước: Nhập họ tên, địa chỉ, chọn Bank Transfer -> Xác nhận
   * Kết quả mong đợi: Đơn lưu vào DB với status "pending", trả về mã đơn hàng và số tiền cần chuyển
   */
  test('TC-ORD-01: Tạo đơn hàng thành công qua Chuyển khoản -> Status "pending", có tổng tiền', async () => {
    const customerToken = 'Bearer mock_customer_valid_jwt_token';
    const orderPayload = {
      fullName: 'Nguyễn Văn A',
      phone: '0905123456',
      address: '123 Hải Phòng, Hải Châu, Đà Nẵng',
      paymentMethod: 'bank_transfer',
      items: [
        {
          productId: 1, // Máy ảnh Sony A7 IV
          quantity: 1,
          price: 45000000,
        },
      ],
    };

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken)
      .send(orderPayload);

    expect(response.statusCode).toBe(201);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.status).toBe('pending');
    expect(response.body.data.totalAmount).toBe(45000000);
    expect(response.body.data.orderCode).toMatch(/^ZT-/); // Mã đơn ZenTech
  });

  /**
   * TC-ORD-02: Kích hoạt gửi email hóa đơn đơn hàng
   * Các bước: Hoàn tất một đơn đặt hàng bất kỳ
   * Kết quả mong đợi: Hệ thống gọi mail.service.js gửi email hóa đơn chi tiết
   */
  test('TC-ORD-02: Gửi email hóa đơn sau khi đặt hàng thành công', async () => {
    const orderId = 101;
    const response = await request(app)
      .post(`/api/orders/${orderId}/send-invoice-email`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatch(/đã gửi email hóa đơn|thành công/i);
  });

  /**
   * TC-ADM-02: Admin cập nhật trạng thái đơn hàng
   * Các bước: Admin chọn đơn hàng và đổi trạng thái sang "shipping"
   * Kết quả mong đợi: DB cập nhật trường status của đơn hàng sang "shipping", giao diện hiển thị badge mới
   */
  test('TC-ADM-02: Admin cập nhật trạng thái đơn sang "shipping" -> Trả về HTTP 200 kèm status mới', async () => {
    const adminToken = 'Bearer mock_admin_valid_jwt_token';
    const orderId = 101;

    const response = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', adminToken)
      .send({
        status: 'shipping',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.status).toBe('shipping');
  });

});
