import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ChatMessage extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chat_rooms',
        key: 'id'
      },
      field: 'room_id'
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'sender_id'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    messageType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "text",
      field: 'message_type'
    },
    mediaUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      field: 'media_url'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'is_read'
    }
  }, {
    sequelize,
    tableName: 'chat_messages',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "chat_messages_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "idx_chat_messages_room",
        fields: [
          { name: "room_id" },
          { name: "created_at" },
        ]
      },
      {
        name: "idx_chat_messages_unread",
        fields: [
          { name: "room_id" },
          { name: "is_read" },
        ]
      },
    ]
  });
  }
}
