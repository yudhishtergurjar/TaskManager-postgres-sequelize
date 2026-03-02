'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {

  class ProjectMember extends Model {

    static associate(models) {

      ProjectMember.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project"
      });

      ProjectMember.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user"
      });

    }
  }

  ProjectMember.init({

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "projectId",
      references: {
        model: "Projects",
        key: "id"
      }
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "userId",
      references: {
        model: "Users",
        key: "id"
      }
    },

    role: {
      type: DataTypes.ENUM("owner", "member"),
      defaultValue: "member"
    },

    status: {
      type: DataTypes.ENUM("active", "blocked"),
      defaultValue: "active"
    }

  }, {
    sequelize,
    modelName: 'ProjectMember',
  });

  return ProjectMember;
};