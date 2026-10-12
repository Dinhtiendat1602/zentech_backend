import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class User extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'full_name'
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: "users_email_key"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    googleId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      unique: "users_google_id_key",
      field: 'google_id'
    },
    authProvider: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: "local",
      field: 'auth_provider'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "customer"
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    sequelize,
    tableName: 'users',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_user_email",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "idx_user_google_id",
        fields: [
          { name: "google_id" },
        ]
      },
      {
        name: "users_email_key",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "users_google_id_key",
        unique: true,
        fields: [
          { name: "google_id" },
        ]
      },
      {
        name: "users_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
