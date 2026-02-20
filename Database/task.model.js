import {DataTypes} from "sequelize";
import sequelize from "../postgres/sequelizeDB.js";
import Project from "./project.model.js";

const Task = sequelize.define("Task",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status:{
      type: DataTypes.ENUM("pending", "in-progress", "completed"),
      defaultValue: "pending",
      allowNull: false,
    }
});
Task.belongsTo(Project, {foreignKey:"projectId", as:"project"});

Project.hasMany(Task, {foreignKey:"projectId", as: "tasks"});

export default Task;
