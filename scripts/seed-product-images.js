import sequelize from '../config/db.js';
import { Product, ProductImage } from '../models/index.js';

// Danh sách ảnh chụp máy ảnh & ống kính từ internet (Unsplash photography gear thật 100%, không lấy ảnh local trong DB)
const BRAND_GALLERY_POOLS = {
  Canon: [
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80', // Canon DSLR body
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80', // Camera lens and body
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80', // Lens mount detail
    'https://images.unsplash.com/photo-1576092609932-2b3abade2479?w=800&auto=format&fit=crop&q=80', // Camera side angle
  ],
  Sony: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', // Sony Alpha mirrorless body
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&auto=format&fit=crop&q=80', // Mirrorless body perspective
    'https://images.unsplash.com/photo-1588117260148-b47818741c74?w=800&auto=format&fit=crop&q=80', // Full-frame sensor & mount
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80', // Back display & control layout
  ],
  Fujifilm: [
    'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?w=800&auto=format&fit=crop&q=80', // Retro rangefinder camera
    'https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=800&auto=format&fit=crop&q=80', // Top dial dials & controls
    'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&auto=format&fit=crop&q=80', // Classic camera with strap
    'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?w=800&auto=format&fit=crop&q=80', // Top-down camera view
  ],
  Nikon: [
    'https://images.unsplash.com/photo-1599549907178-338ac73175a4?w=800&auto=format&fit=crop&q=80', // Pro camera body
    'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80', // Deep grip & body ergonomic
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80', // Camera angle view
    'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=800&auto=format&fit=crop&q=80', // Camera body detail
  ],
  Sigma: [
    'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=80', // Telephoto zoom lens
    'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?w=800&auto=format&fit=crop&q=80', // Fast prime lens
    'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&auto=format&fit=crop&q=80', // Lens front element & multi-coating
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80', // Aperture blades & ring
  ],
  Default: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800&auto=format&fit=crop&q=80',
  ],
};

async function seedProductImages() {
  try {
    await sequelize.authenticate();
    console.log('✅ Đã kết nối cơ sở dữ liệu để thêm ảnh phụ từ internet.');

    const products = await Product.findAll();
    console.log(`Tìm thấy ${products.length} sản phẩm cần cập nhật ảnh...`);

    let totalImagesCreated = 0;

    for (const prod of products) {
      const nameLower = prod.name.toLowerCase();
      let brandKey = 'Default';
      if (/ống kính|lens/i.test(nameLower) || nameLower.includes('sigma')) brandKey = 'Sigma';
      else if (nameLower.includes('canon')) brandKey = 'Canon';
      else if (nameLower.includes('sony')) brandKey = 'Sony';
      else if (nameLower.includes('fujifilm') || nameLower.includes('fuji')) brandKey = 'Fujifilm';
      else if (nameLower.includes('nikon')) brandKey = 'Nikon';

      const pool = BRAND_GALLERY_POOLS[brandKey] || BRAND_GALLERY_POOLS.Default;

      // Xóa các ảnh cũ của sản phẩm này trong bảng product_images
      await ProductImage.destroy({ where: { productId: prod.id } });

      // Ảnh 1 luôn là thumbnail chính của sản phẩm
      if (prod.thumbnail) {
        await ProductImage.create({
          productId: prod.id,
          imageUrl: prod.thumbnail,
          isPrimary: true,
          sortOrder: 1,
        });
        totalImagesCreated++;
      }

      // Lấy 3 ảnh phụ hoàn toàn từ internet theo hãng
      const subImages = pool.filter((url) => url !== prod.thumbnail).slice(0, 3);
      for (let i = 0; i < subImages.length; i++) {
        await ProductImage.create({
          productId: prod.id,
          imageUrl: subImages[i],
          isPrimary: false,
          sortOrder: i + 2,
        });
        totalImagesCreated++;
      }
    }

    console.log(`🎉 Thành công! Đã tạo tổng cộng ${totalImagesCreated} ảnh (bao gồm thumbnail và ảnh phụ internet) cho ${products.length} sản phẩm.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi thêm ảnh con cho sản phẩm:', err);
    process.exit(1);
  }
}

seedProductImages();
