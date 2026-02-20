import {DataTypes} from "sequelize";
import sequelize from "../postgres/sequelizeDB.js";

const User = sequelize.define("User",{
    id:{
        type : DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        unique:true,
        allowNull:false
    },
    hashedPassword:{
        type: DataTypes.STRING,
    },
    refreshToken:{
        type:DataTypes.TEXT
    }
},
);

export default User;