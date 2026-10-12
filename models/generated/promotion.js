import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Promotion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "promotions_code_key"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    discountType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "percentage",
      field: 'discount_type'
    },
    discountValue: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      field: 'discount_value'
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
      field: 'min_order_amount'
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      field: 'max_discount_amount'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'usage_limit'
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'used_count'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    sequelize,
    tableName: 'promotions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_promotion_active",
        fields: [
          { name: "is_active" },
          { name: "start_date" },
          { name: "end_date" },
        ]
      },
      {
        name: "idx_promotion_code",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "promotions_code_key",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "promotions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
