import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Wishlist extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "unique_wishlist_item",
      field: 'user_id'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      unique: "unique_wishlist_item",
      field: 'product_id'
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'added_at'
    }
  }, {
    sequelize,
    tableName: 'wishlists',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_wishlist_user",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "unique_wishlist_item",
        unique: true,
        fields: [
          { name: "user_id" },
          { name: "product_id" },
        ]
      },
      {
        name: "wishlists_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
