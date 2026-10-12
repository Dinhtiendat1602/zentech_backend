import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PasswordReset extends Model {
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
    email: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "password_resets_token_key"
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'is_used'
    }
  }, {
    sequelize,
    tableName: 'password_resets',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_password_resets_token",
        fields: [
          { name: "token" },
        ]
      },
      {
        name: "idx_password_resets_user",
        fields: [
          { name: "user_id" },
          { name: "is_used" },
        ]
      },
      {
        name: "password_resets_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "password_resets_token_key",
        unique: true,
        fields: [
          { name: "token" },
        ]
      },
    ]
  });
  }
}
