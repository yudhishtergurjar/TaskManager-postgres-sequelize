'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Associations go here
      User.hasMany(models.Project, { foreignKey: "ownerId", as: "projects" });
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    hashedPassword: {
      type: DataTypes.STRING
    },
    refreshToken: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};