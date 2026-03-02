'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {

  class Message extends Model {

    static associate(models) {

      Message.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project"
      });

      Message.belongsTo(models.User, {
        foreignKey: "senderId",
        as: "sender"
      });

    }
  }

  Message.init({

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Projects",
        key: "id"
      }
    },

    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      }
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    messageType: {
      type: DataTypes.STRING,
      defaultValue: "text"
    },

  }, {
    sequelize,
    modelName: 'Message',
  });

  return Message;
};