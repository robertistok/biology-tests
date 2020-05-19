require("dotenv").config({});

console.log(process.env.DATABASE_URL);

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
};
