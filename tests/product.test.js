/**
 * ==============================================================================
 * DỰ ÁN: ZenTech (ZenStore) - iViettech Project Document
 * FILE: backend/tests/product.test.js
 * MÔ TẢ: Kịch bản kiểm thử tự động phân hệ Sản phẩm & Kho hàng (Product & Inventory)
 * ==============================================================================
 */

import request from 'supertest';
import app from '../index.js';

describe('PHÂN HỆ SẢN PHẨM & TÌM KIẾM (PRODUCTS & SEARCH)', () => {

  /**
   * TC-PROD-01: Tìm kiếm live sản phẩm
   * Các bước: Nhập từ khóa "Sony" vào ô tìm kiếm ở Header
   * Kết quả mong đợi: Trả về danh sách sản phẩm khớp với từ khóa "Sony"
   */
  test('TC-PROD-01: Tìm kiếm sản phẩm theo từ khóa "Sony" -> Trả về danh sách sản phẩm liên quan', async () => {
    const keyword = 'Sony';
    const response = await request(app)
      .get(`/api/products?q=${encodeURIComponent(keyword)}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

    // Mọi sản phẩm trả về phải chứa chữ 'sony' trong tên hoặc thương hiệu
    const allMatch = response.body.data.every(
      (item) => item.name.toLowerCase().includes('sony') || item.brand.toLowerCase().includes('sony')
    );
    expect(allMatch).toBe(true);
  });

  /**
   * TC-PROD-02: Lấy chi tiết sản phẩm kèm danh sách ảnh phụ từ internet
   * Các bước: Truy cập API chi tiết theo slug máy ảnh
   * Kết quả mong đợi: Trả về thông tin sản phẩm, gồm ảnh thumbnail chính và danh sách subImages từ mạng
   */
  test('TC-PROD-02: Lấy chi tiết sản phẩm -> Có ảnh đại diện và mảng ảnh phụ internet', async () => {
    const slug = 'nikon-z8';
    const response = await request(app)
      .get(`/api/products/${slug}`);

    expect(response.statusCode).toBe(200);
    const prod = response.body.data;
    expect(prod).toBeDefined();
    expect(prod.slug).toBe(slug);

    // Kiểm tra cấu trúc hình ảnh
    expect(prod).toHaveProperty('image');
    expect(prod).toHaveProperty('images');
    expect(prod).toHaveProperty('subImages');

    // Ảnh phụ phải là mảng và không rỗng
    expect(Array.isArray(prod.subImages)).toBe(true);
    expect(prod.images.length).toBeGreaterThanOrEqual(1);
  });

  /**
   * TC-PROD-03: Cập nhật ảnh phụ độc lập với ảnh thumbnail (Dành cho Admin)
   * Các bước: Gửi payload cập nhật danh sách ảnh phụ mới từ mạng
   * Kết quả mong đợi: Bảng product_images được đồng bộ đúng các URL mới
   */
  test('TC-PROD-03: Cập nhật danh sách ảnh phụ -> Đồng bộ chuẩn xác vào cơ sở dữ liệu', async () => {
    const adminToken = 'Bearer mock_admin_valid_jwt_token';
    const productId = 27; // Nikon Z8
    const newSubImages = [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80',
    ];

    const response = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', adminToken)
      .send({
        subImages: newSubImages,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.subImages).toEqual(expect.arrayContaining(newSubImages));
  });

});
