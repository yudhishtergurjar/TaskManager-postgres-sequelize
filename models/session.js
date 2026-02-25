'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE"
      });
    }
  }

  Session.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:'Users',
        key:'id'
      }
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiresAt:{
      type:DataTypes.DATE
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }

  }, {
    sequelize,
    modelName: 'Session',
  });

  return Session;
};