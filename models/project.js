'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      Project.belongsTo(models.User, {foreignKey: "ownerId", as: "owner" });
      
      Project.hasMany(models.Task, { foreignKey: "projectId", as: "tasks" });
    }
  }

  Project.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Project',
  });

  return Project;
};