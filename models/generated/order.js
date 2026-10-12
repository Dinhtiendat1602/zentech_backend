import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Order extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    orderCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "orders_order_code_key",
      field: 'order_code'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    promotionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'promotions',
        key: 'id'
      },
      field: 'promotion_id'
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'customer_name'
    },
    customerEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'customer_email'
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'customer_phone'
    },
    customerAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'customer_address'
    },
    totalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      field: 'total_amount'
    },
    shippingFee: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
      field: 'shipping_fee'
    },
    discountAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
      field: 'discount_amount'
    },
    finalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      field: 'final_amount'
    },
    paymentMethod: {
      type: DataTypes.ENUM("cod","bank","momo","vnpay"),
      allowNull: false,
      field: 'payment_method'
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid","paid","failed"),
      allowNull: true,
      defaultValue: "unpaid",
      field: 'payment_status'
    },
    status: {
      type: DataTypes.ENUM("pending","confirmed","shipping","completed","cancelled"),
      allowNull: true,
      defaultValue: "pending"
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'orders',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "idx_orders_code",
        fields: [
          { name: "order_code" },
        ]
      },
      {
        name: "idx_orders_status",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "idx_orders_user",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "orders_order_code_key",
        unique: true,
        fields: [
          { name: "order_code" },
        ]
      },
      {
        name: "orders_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
