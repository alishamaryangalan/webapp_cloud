require('dotenv').config()
const Sequelize = require("sequelize")
console.log("IN MODELS/INDEX.JS");
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_ENDPOINT,
    port: 5432,
    dialect: 'postgres',
})
// Test the connection to the database

const db = {}
db.Sequelize = Sequelize;
db.sequelize = sequelize;

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });


db.users = require("./user.model.js")(sequelize, Sequelize)
console.log("db.user");
console.log(db.users);
db.products = require("./product.model.js")(sequelize, Sequelize)
db.image = require("./image.model.js")(sequelize, Sequelize)

db.sequelize.sync()
console.log("Logging db");
console.log(db);
module.exports = db;