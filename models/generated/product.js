import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Product extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      field: 'category_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
      unique: "products_slug_key"
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    salePrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      field: 'sale_price'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'view_count'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'is_featured'
    },
    totalSold: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'total_sold'
    }
  }, {
    sequelize,
    tableName: 'products',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_product_category",
        fields: [
          { name: "category_id" },
        ]
      },
      {
        name: "idx_product_featured",
        fields: [
          { name: "is_featured" },
        ]
      },
      {
        name: "idx_product_price",
        fields: [
          { name: "price" },
        ]
      },
      {
        name: "idx_product_slug",
        fields: [
          { name: "slug" },
        ]
      },
      {
        name: "idx_product_sold",
        fields: [
          { name: "total_sold", order: "DESC" },
        ]
      },
      {
        name: "products_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "products_slug_key",
        unique: true,
        fields: [
          { name: "slug" },
        ]
      },
    ]
  });
  }
}
