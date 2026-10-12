import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ProductPolicy extends Model {
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
    policyType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'policy_type'
    },
    policyContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'policy_content'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'sort_order'
    }
  }, {
    sequelize,
    tableName: 'product_policies',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_product_policies",
        fields: [
          { name: "product_id" },
          { name: "sort_order" },
        ]
      },
      {
        name: "product_policies_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
