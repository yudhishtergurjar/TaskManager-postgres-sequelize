import {DataTypes} from "sequelize";
import sequelize from "../postgres/sequelizeDB.js";
import User from "./user.model.js";

const Project = sequelize.define("Project",{
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
    }
});
Project.belongsTo(User, {foreignKey:"ownerId", as:"owner"});

User.hasMany(Project, {foreignKey:"ownerId", as: "projects"});

export default Project;
