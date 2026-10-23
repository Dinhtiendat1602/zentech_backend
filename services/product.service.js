import { Op } from 'sequelize';
import { Product, Category, ProductImage, Review, ProductSpec } from '../models/index.js';

const cameraBrands = ['Canon', 'Sony', 'Nikon', 'Fujifilm', 'Panasonic', 'Sigma'];

export const SPEC_DEFINITIONS = [
  { field: 'sensor', label: 'Cảm biến', placeholder: 'VD: 33.0 MP Full-frame Exmor R BSI CMOS' },
  { field: 'imageProcessor', label: 'Bộ xử lý hình ảnh', placeholder: 'VD: BIONZ XR, DIGIC X...' },
  { field: 'videoCapability', label: 'Khả năng quay video', placeholder: 'VD: 4K 60p 10-bit 4:2:2, S-Cinetone' },
  { field: 'ibis', label: 'Chống rung (IBIS)', placeholder: 'VD: 5 trục, bù 5.5 stops' },
  { field: 'isoRange', label: 'Dải ISO', placeholder: 'VD: 100 - 51,200 (mở rộng 50 - 204,800)' },
  { field: 'lensMount', label: 'Ngàm ống kính', placeholder: 'VD: Sony E-mount, Canon RF...' },
  { field: 'screen', label: 'Màn hình', placeholder: 'VD: LCD cảm ứng xoay lật đa góc 3.0 inch' },
  { field: 'weight', label: 'Trọng lượng', placeholder: 'VD: Khoảng 658g (kèm pin & thẻ)' },
];

export function specRecordToList(specRecord) {
  if (!specRecord) return [];
  const list = [];
  SPEC_DEFINITIONS.forEach((def, index) => {
    const val = specRecord[def.field];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      list.push({
        id: def.field,
        specName: def.label,
        specValue: String(val).trim(),
        field: def.field,
        sortOrder: index + 1,
      });
    }
  });
  return list;
}

function toStoreProduct(product) {
  const categoryName = product.category?.name ?? '';
  const type = /ống kính|lens/i.test(categoryName) ? 'Ống kính' : (/máy ảnh|camera/i.test(categoryName) ? 'Máy ảnh' : (categoryName || 'Máy ảnh'));
  const brand = cameraBrands.find((name) => product.name.toLowerCase().includes(name.toLowerCase()))
    ?? (product.category?.type === 'brand' ? product.category?.name : 'Khác');
  const price = Number(product.salePrice ?? product.price);
  const regularPrice = Number(product.price);

  const specRecord = product.productSpec || product.productSpecs;
  const specs = specRecordToList(specRecord);

  const reviewList = product.reviews || [];
  const reviewsCount = reviewList.length;
  const rating = reviewsCount > 0
    ? Number((reviewList.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviewsCount).toFixed(1))
    : 5.0;

  return {
    id: product.slug,
    databaseId: product.id,
    name: product.name,
    brand,
    type,
    sku: product.slug,
    price,
    oldPrice: product.salePrice ? regularPrice : null,
    quantity: product.quantity,
    rating,
    reviews: reviewsCount,
    image: product.thumbnail,
    badge: product.isFeatured ? 'NỔI BẬT' : null,
    description: product.description,
    specs,
  };
}

/**
 * Lấy danh sách sản phẩm với các bộ lọc & sắp xếp từ query string.
 * @param {object} query - req.query
 *   - type: loại sản phẩm ("Máy ảnh", "Ống kính", ...)
 *   - brand: hãng
 *   - q: từ khóa tìm kiếm (căn cứ vào name, brand, sku)
 *   - sort: featured | price-asc | price-desc
 */
export const getAllService = async (query = {}) => {
  const where = {};
  if (query.categoryId) where.categoryId = Number(query.categoryId);

  const products = await Product.findAll({
    include: [
      { model: Category, as: 'category', required: false },
      { model: Review, as: 'reviews', attributes: ['rating'], required: false },
    ],
    where,
    order: [['id', 'DESC']],
  });

  let storeProducts = products.map(toStoreProduct);
  if (query.type && query.type !== 'Tất cả') storeProducts = storeProducts.filter((product) => product.type === query.type);
  if (query.brand && query.brand !== 'Tất cả hãng') storeProducts = storeProducts.filter((product) => product.brand === query.brand);
  if (query.q) {
    const keyword = query.q.toLocaleLowerCase().trim();
    storeProducts = storeProducts.filter((product) =>
      `${product.name} ${product.brand} ${product.sku} ${product.description || ''} ${product.type || ''}`.toLocaleLowerCase().includes(keyword)
    );
  }
  if (query.sort === 'price-asc') storeProducts.sort((first, second) => first.price - second.price);
  if (query.sort === 'price-desc') storeProducts.sort((first, second) => second.price - first.price);
  return storeProducts;
};

export const getByIdService = async (id) => {
  const product = await Product.findOne({
    where: { [Op.or]: [{ slug: String(id) }, ...(Number.isInteger(Number(id)) ? [{ id: Number(id) }] : [])] },
    include: [
      { model: Category, as: 'category', required: false },
      { model: ProductSpec, as: 'productSpec', required: false },
      { model: Review, as: 'reviews', attributes: ['rating'], required: false },
    ],
  });
  if (!product) throw Object.assign(new Error('Không tìm thấy sản phẩm.'), { statusCode: 404 });
  return toStoreProduct(product);
};

export const getAdminProductsService = async ({ q = '', categoryId = '' } = {}) => {
  const where = {};
  if (categoryId) where.categoryId = Number(categoryId);
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { slug: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const products = await Product.findAll({
    where,
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'type'] },
      { model: ProductSpec, as: 'productSpec', required: false },
    ],
    order: [['id', 'DESC']],
  });
  return products.map((product) => {
    const specRecord = product.productSpec || product.productSpecs;
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryId: product.categoryId,
      category: product.category?.name ?? '',
      categoryType: product.category?.type ?? '',
      brand: cameraBrands.find((brand) => product.name.toLowerCase().includes(brand.toLowerCase())) ?? 'Khác',
      type: /ống kính|lens/i.test(product.category?.name ?? '') ? 'Ống kính' : 'Máy ảnh',
      price: Number(product.price),
      salePrice: product.salePrice === null ? null : Number(product.salePrice),
      stock: product.quantity,
      image: product.thumbnail,
      description: product.description,
      isFeatured: product.isFeatured,
      totalSold: product.totalSold,
      specs: specRecordToList(specRecord),
    };
  });
};

export const getCategoriesService = async () => Category.findAll({ order: [['type', 'ASC'], ['name', 'ASC']] });

function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function productValues(data) {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const categoryId = Number(data.categoryId ?? data.category_id);
  const price = Number(data.price);
  const quantity = Number(data.stock ?? data.quantity ?? 0);
  const thumbnail = String(data.thumbnail || data.image || '').trim();

  if (!name || name.length > 255) throw Object.assign(new Error('Tên sản phẩm không hợp lệ (1-255 ký tự).'), { statusCode: 400 });
  if (!Number.isInteger(categoryId) || categoryId < 1) throw Object.assign(new Error('Vui lòng chọn danh mục cho sản phẩm.'), { statusCode: 400 });
  if (!Number.isFinite(price) || price < 0) throw Object.assign(new Error('Giá sản phẩm không hợp lệ.'), { statusCode: 400 });
  if (!Number.isInteger(quantity) || quantity < 0) throw Object.assign(new Error('Số lượng tồn kho phải là số nguyên không âm.'), { statusCode: 400 });
  if (!thumbnail) throw Object.assign(new Error('Vui lòng tải lên ảnh sản phẩm.'), { statusCode: 400 });

  const salePrice = data.salePrice === '' || data.salePrice == null ? null : Number(data.salePrice);
  if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice > price)) {
    throw Object.assign(new Error('Giá khuyến mãi phải từ 0 đến giá gốc.'), { statusCode: 400 });
  }

  const baseSlug = slugify(data.slug?.trim() || name) || `sp-${Date.now()}`;

  return {
    name,
    categoryId,
    slug: baseSlug,
    price,
    salePrice,
    quantity,
    thumbnail,
    description: data.description?.trim() || null,
    isFeatured: data.isFeatured === true || data.isFeatured === 'true',
  };
}

const NAME_TO_COLUMN = {
  'cảm biến': 'sensor',
  'sensor': 'sensor',
  'bộ xử lý hình ảnh': 'imageProcessor',
  'bộ xử lý': 'imageProcessor',
  'image_processor': 'imageProcessor',
  'imageprocessor': 'imageProcessor',
  'khả năng quay video': 'videoCapability',
  'quay video': 'videoCapability',
  'video_capability': 'videoCapability',
  'videocapability': 'videoCapability',
  'chống rung (ibis)': 'ibis',
  'chống rung': 'ibis',
  'ibis': 'ibis',
  'dải iso': 'isoRange',
  'iso': 'isoRange',
  'iso_range': 'isoRange',
  'isorange': 'isoRange',
  'ngàm ống kính': 'lensMount',
  'ngàm': 'lensMount',
  'lens_mount': 'lensMount',
  'lensmount': 'lensMount',
  'màn hình': 'screen',
  'screen': 'screen',
  'trọng lượng': 'weight',
  'weight': 'weight',
};

async function syncProductSpecs(productId, rawSpecs) {
  if (rawSpecs === undefined || rawSpecs === null) return;
  let specs = rawSpecs;
  if (typeof specs === 'string') {
    try {
      specs = JSON.parse(specs);
    } catch {
      return;
    }
  }

  const specData = {
    productId,
    sensor: null,
    imageProcessor: null,
    videoCapability: null,
    ibis: null,
    isoRange: null,
    lensMount: null,
    screen: null,
    weight: null,
  };

  if (Array.isArray(specs)) {
    for (const item of specs) {
      if (!item) continue;
      const rawName = String(item.specName || item.field || item.name || '').trim().toLowerCase();
      const rawVal = item.specValue !== undefined ? item.specValue : item.value;
      const colKey = NAME_TO_COLUMN[rawName];
      if (colKey) {
        specData[colKey] = rawVal !== null && rawVal !== undefined && String(rawVal).trim() !== ''
          ? String(rawVal).trim().slice(0, colKey === 'weight' ? 100 : 255)
          : null;
      }
    }
  } else if (typeof specs === 'object') {
    if (specs.sensor !== undefined) {
      specData.sensor = String(specs.sensor || '').trim().slice(0, 255) || null;
    }
    if (specs.imageProcessor !== undefined || specs.image_processor !== undefined) {
      specData.imageProcessor = String(specs.imageProcessor ?? specs.image_processor ?? '').trim().slice(0, 255) || null;
    }
    if (specs.videoCapability !== undefined || specs.video_capability !== undefined) {
      specData.videoCapability = String(specs.videoCapability ?? specs.video_capability ?? '').trim().slice(0, 255) || null;
    }
    if (specs.ibis !== undefined) {
      specData.ibis = String(specs.ibis || '').trim().slice(0, 255) || null;
    }
    if (specs.isoRange !== undefined || specs.iso_range !== undefined) {
      specData.isoRange = String(specs.isoRange ?? specs.iso_range ?? '').trim().slice(0, 255) || null;
    }
    if (specs.lensMount !== undefined || specs.lens_mount !== undefined) {
      specData.lensMount = String(specs.lensMount ?? specs.lens_mount ?? '').trim().slice(0, 255) || null;
    }
    if (specs.screen !== undefined) {
      specData.screen = String(specs.screen || '').trim().slice(0, 255) || null;
    }
    if (specs.weight !== undefined) {
      specData.weight = String(specs.weight || '').trim().slice(0, 100) || null;
    }
  }

  const hasAnySpec = Object.entries(specData).some(
    ([k, v]) => k !== 'productId' && v !== null && v !== ''
  );

  const existing = await ProductSpec.findOne({ where: { productId } });

  if (!hasAnySpec) {
    if (existing) {
      await existing.destroy();
    }
    return;
  }

  if (existing) {
    await existing.update(specData);
  } else {
    await ProductSpec.create(specData);
  }
}

export const createService = async (data) => {
  const values = productValues(data);
  const category = await Category.findByPk(values.categoryId);
  if (!category) throw Object.assign(new Error('Danh mục không tồn tại.'), { statusCode: 400 });

  // Ensure unique slug
  let uniqueSlug = values.slug;
  let counter = 1;
  while (await Product.findOne({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${values.slug}-${counter}`;
    counter++;
  }
  values.slug = uniqueSlug;

  const product = await Product.create(values);
  if (data.specs !== undefined) {
    await syncProductSpecs(product.id, data.specs);
  }

  return (await getAdminProductsService()).find((item) => item.id === product.id);
};

export const updateService = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) throw Object.assign(new Error('Không tìm thấy sản phẩm.'), { statusCode: 404 });
  const values = productValues({
    name: data.name ?? product.name,
    categoryId: data.categoryId ?? data.category_id ?? product.categoryId,
    slug: data.slug ?? product.slug,
    price: data.price ?? product.price,
    salePrice: data.salePrice === undefined ? product.salePrice : data.salePrice,
    stock: data.stock ?? data.quantity ?? product.quantity,
    thumbnail: data.thumbnail ?? data.image ?? product.thumbnail,
    description: data.description ?? product.description,
    isFeatured: data.isFeatured ?? product.isFeatured,
  });

  if (values.slug !== product.slug) {
    let uniqueSlug = values.slug;
    let counter = 1;
    while (await Product.findOne({ where: { slug: uniqueSlug, id: { [Op.ne]: id } } })) {
      uniqueSlug = `${values.slug}-${counter}`;
      counter++;
    }
    values.slug = uniqueSlug;
  }

  await product.update(values);

  if (data.specs !== undefined) {
    await syncProductSpecs(product.id, data.specs);
  }

  return (await getAdminProductsService()).find((item) => item.id === product.id);
};

export const removeService = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw Object.assign(new Error('Không tìm thấy sản phẩm.'), { statusCode: 404 });
  const dependencies = await Promise.all([
    ProductImage.count({ where: { productId: id } }),
    Review.count({ where: { productId: id } }),
  ]);
  if (dependencies.some(Boolean)) {
    throw Object.assign(new Error('Không thể xóa sản phẩm đã có ảnh hoặc đánh giá.'), { statusCode: 409 });
  }
  await ProductSpec.destroy({ where: { productId: id } });
  const rows = await Product.destroy({ where: { id } });
  return rows > 0;
};

export const getSpecsByProductIdService = async (id) => {
  let productId = Number(id);
  if (!Number.isInteger(productId)) {
    const prod = await Product.findOne({ where: { slug: String(id) }, attributes: ['id'] });
    if (!prod) throw Object.assign(new Error('Không tìm thấy sản phẩm.'), { statusCode: 404 });
    productId = prod.id;
  }
  const specRecord = await ProductSpec.findOne({ where: { productId } });
  return specRecordToList(specRecord);
};
