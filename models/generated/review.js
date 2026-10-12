import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Review extends Model {
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
      field: 'user_id'
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
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
      field: 'created_at'
    }
  }, {
    sequelize,
    tableName: 'reviews',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_reviews_product",
        fields: [
          { name: "product_id" },
          { name: "created_at", order: "DESC" },
        ]
      },
      {
        name: "idx_reviews_user",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "reviews_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
