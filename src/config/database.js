const pathConst = require("path");
require("dotenv").config({ path: pathConst.resolve(process.cwd(), ".env") });

const DB_TYPE = process.env.DIALECT;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASSWORD || null;
// Use a different storage type. Default: sequelize
const migrationStorage = "sequelize";
// Use a different table name. Default: SequelizeMeta
const migrationStorageTableName = "SequelizeMeta";
// Use a different storage. Default: none

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: DB_TYPE,
    timezone: "+05:30",
    migrationStorage,
    migrationStorageTableName
  },
  test: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: DB_TYPE,
    timezone: "+05:30",
    migrationStorage,
    migrationStorageTableName
  },
  production: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: DB_TYPE,
    timezone: "+05:30",
    migrationStorage,
    migrationStorageTableName
  }
};