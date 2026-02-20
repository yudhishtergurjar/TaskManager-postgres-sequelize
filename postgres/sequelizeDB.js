import "dotenv/config";
import { Sequelize } from "sequelize";
const db_user = process.env.DB_USER;
const db_name = process.env.DB_NAME;
const db_password = process.env.DB_PASSWORD;

const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: 'localhost',
  dialect: 'postgres'
});

export default sequelize;