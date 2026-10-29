-- ====================================================
-- CAMERA STORE / E-COMMERCE FULL DATABASE (POSTGRESQL)
-- ====================================================

-- 1. Hàm tự động cập nhật thời gian updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Khai báo các ENUM phục vụ đơn hàng & thanh toán
DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cod', 'bank', 'momo', 'vnpay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'shipping', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ====================================================
-- PHẦN 1: USER, AUTH (GOOGLE OAUTH) & PASSWORD RESET
-- ====================================================

-- 1.1 Bảng Người dùng (Hỗ trợ Login thường + Google OAuth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) DEFAULT NULL,            -- NULL nếu đăng nhập bằng Google
    google_id VARCHAR(100) UNIQUE DEFAULT NULL,   -- ID định danh từ Google API
    auth_provider VARCHAR(30) DEFAULT 'local',    -- 'local', 'google', 'facebook'
    avatar VARCHAR(255) DEFAULT NULL,             -- URL avatar lấy từ Google profile
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    role VARCHAR(20) DEFAULT 'customer',          -- 'customer' hoặc 'admin'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_google_id ON users(google_id);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 1.2 Bảng Quên mật khẩu (Password Reset Tokens / OTP)
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,          -- Chuỗi hash token hoặc mã OTP 6 số
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Hết hạn (ví dụ sau 15 phút)
    is_used BOOLEAN DEFAULT FALSE,               -- Đã dùng để đổi mật khẩu chưa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user ON password_resets(user_id, is_used);


-- ====================================================
-- PHẦN 2: CHAT REAL-TIME (SOCKET.IO)
-- ====================================================

-- 2.1 Bảng Phòng Chat (Mỗi khách 1 room đang active với CSKH)
CREATE TABLE chat_rooms (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_admin_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL, -- Admin nhận hỗ trợ
    status VARCHAR(20) DEFAULT 'open', -- 'open' (đang chat), 'closed' (kết thúc hỗ trợ)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_rooms_customer ON chat_rooms(customer_id);
CREATE INDEX idx_chat_rooms_status ON chat_rooms(status);

CREATE TRIGGER trg_chat_rooms_updated_at
BEFORE UPDATE ON chat_rooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2.2 Bảng Chi tiết Tin nhắn
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file'
    media_url VARCHAR(255) DEFAULT NULL,     -- Lưu URL ảnh chụp nếu khách gửi ảnh lỗi
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id, created_at ASC);
CREATE INDEX idx_chat_messages_unread ON chat_messages(room_id, is_read);


-- ====================================================
-- PHẦN 3: BANNER & DANH MỤC (CATEGORIES / BRANDS)
-- ====================================================

-- 3.1 Bảng Slide / Banner trang chủ
CREATE TABLE slides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) DEFAULT NULL,
    link_url VARCHAR(255) DEFAULT NULL,
    image VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Bảng Danh mục & Thương hiệu
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'brand',     -- 'brand' hoặc 'category'
    thumbnail VARCHAR(255) DEFAULT NULL,
    description TEXT,
    parent_id INT DEFAULT NULL REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category_type ON categories(type);
CREATE INDEX idx_parent_id ON categories(parent_id);
CREATE INDEX idx_category_slug ON categories(slug);


-- ====================================================
-- PHẦN 4: SẢN PHẨM & CÁC TAB CHI TIẾT SẢN PHẨM
-- ====================================================

-- 4.1 Bảng Sản phẩm chính
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(15, 2) DEFAULT NULL CHECK (sale_price >= 0),
    quantity INT DEFAULT 0 CHECK (quantity >= 0),
    thumbnail VARCHAR(255) NOT NULL,
    description TEXT,                    -- Tab "Mô tả sản phẩm" (HTML)
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,   -- Sản phẩm nổi bật
    total_sold INT DEFAULT 0,            -- Đếm lượt bán
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_featured ON products(is_featured);
CREATE INDEX idx_product_sold ON products(total_sold DESC);
CREATE INDEX idx_product_price ON products(price);
CREATE INDEX idx_product_slug ON products(slug);

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Bảng Ảnh phụ của sản phẩm (Gallery)
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

CREATE INDEX idx_product_images ON product_images(product_id, sort_order);

-- 4.3 Bảng Thông số kỹ thuật (Tab "Thông số")
CREATE TABLE product_specs (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    sensor VARCHAR(255),               -- Cảm biến
    image_processor VARCHAR(255),      -- Bộ xử lý hình ảnh
    video_capability VARCHAR(255),     -- Khả năng quay video
    ibis VARCHAR(255),                 -- Chống rung (IBIS)
    iso_range VARCHAR(255),            -- Dải ISO
    lens_mount VARCHAR(255),           -- Ngàm ống kính
    screen VARCHAR(255),               -- Màn hình
    weight VARCHAR(100),               -- Trọng lượng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.4 Bảng Chính sách (Tab "Chính sách & Bảo hành")
CREATE TABLE product_policies (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    policy_type VARCHAR(100) NOT NULL,  -- VD: 'Bảo hành', 'Đổi trả'
    policy_content TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE INDEX idx_product_policies ON product_policies(product_id, sort_order);


-- ====================================================
-- PHẦN 5: ĐÁNH GIÁ (REVIEWS) & YÊU THÍCH (WISHLIST)
-- ====================================================

-- 5.1 Bảng Đánh giá sản phẩm
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON reviews(product_id, created_at DESC);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- 5.2 Bảng Danh sách Yêu thích
CREATE TABLE wishlists (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_wishlist_item UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlists(user_id);


-- ====================================================
-- PHẦN 6: GIỎ HÀNG, KHUYẾN MÃI & ĐƠN HÀNG
-- ====================================================

-- 6.1 Bảng Giỏ hàng
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cart_item UNIQUE (user_id, product_id)
);

CREATE INDEX idx_cart_user ON carts(user_id);

-- 6.2 Bảng Mã giảm giá / Voucher
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' hoặc 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(15, 2) DEFAULT 0,
    max_discount_amount NUMERIC(15, 2) DEFAULT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotion_code ON promotions(code);
CREATE INDEX idx_promotion_active ON promotions(is_active, start_date, end_date);

-- 6.3 Bảng Đơn hàng
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
    promotion_id INT DEFAULT NULL REFERENCES promotions(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    shipping_fee NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    final_amount NUMERIC(12, 2) NOT NULL,
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum DEFAULT 'unpaid',
    status order_status_enum DEFAULT 'pending',
    note TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_status ON orders(status);

-- 6.4 Bảng Chi tiết Đơn hàng (Lưu vết giá & tên sản phẩm lúc mua)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL, -- Lưu cứng tên phòng khi sau này shop đổi tên
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_order_items_updated_at
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();