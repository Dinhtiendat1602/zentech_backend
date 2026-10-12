import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ChatRoom extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'customer_id'
    },
    assignedAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'assigned_admin_id'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "open"
    }
  }, {
    sequelize,
    tableName: 'chat_rooms',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "chat_rooms_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "idx_chat_rooms_customer",
        fields: [
          { name: "customer_id" },
        ]
      },
      {
        name: "idx_chat_rooms_status",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
  }
}
