

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Đọc cấu hình từ file .env
dotenv.config();

// Khởi tạo instance kết nối PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    // In câu lệnh SQL ra terminal khi ở chế độ dev để dễ debug
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      freezeTableName: true, // Giữ nguyên tên bảng, không tự đổi thành số nhiều tiếng Anh
      timestamps: false      // Tắt timestamps tự sinh vì DB đã quản lý bằng trigger riêng
    },
    pool: {
      max: 10,        // Tối đa 10 kết nối cùng lúc
      min: 0,         // Tối thiểu 0 kết nối
      acquire: 30000, // Chờ tối đa 30s để lấy kết nối
      idle: 10000     // 10s không dùng sẽ giải phóng kết nối
    }
  }
);

// Hàm kiểm tra trạng thái kết nối
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query(`
      DO $sequence_sync$
      DECLARE
        table_name TEXT;
        table_names TEXT[] := ARRAY[
        'users', 'products', 'categories', 'orders', 'order_items', 'promotions',
        'reviews', 'wishlists', 'carts', 'slides', 'chat_rooms', 'chat_messages',
        'password_resets', 'product_images', 'product_specs', 'product_policies'
      ];
      BEGIN
        FOREACH table_name IN ARRAY table_names LOOP
          EXECUTE format(
            'SELECT setval(pg_get_serial_sequence(%L, %L), COALESCE(MAX(id), 1), COUNT(*) > 0) FROM %I.%I',
            'public.' || table_name,
            'id',
            'public',
            table_name
          );
        END LOOP;
      END;
      $sequence_sync$;
    `);
    console.log('✅ Kết nối PostgreSQL thành công qua Sequelize!');
  } catch (error) {
    console.error('❌ Kết nối PostgreSQL thất bại:', error.message);
    process.exit(1); // Thoát tiến trình nếu không kết nối được DB
  }
};

export default sequelize;