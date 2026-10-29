import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ProductImage extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      field: 'product_id'
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'image_url'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'is_primary'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'sort_order'
    }
  }, {
    sequelize,
    tableName: 'product_images',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_product_images",
        fields: [
          { name: "product_id" },
          { name: "sort_order" },
        ]
      },
      {
        name: "product_images_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
