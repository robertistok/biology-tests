const { DATABASE_URL, NODE_ENV } = require("../config");

// log queries if not in production
let initOptions = ["production", "test"].includes(NODE_ENV)
  ? {}
  : {
      query(e) {
        console.log(`QUERY: ${e.query}`);
      },
    };

const pgp = require("pg-promise")(initOptions);
// 1114 is OID for timestamp in Postgres

// do not use SSL if connecting to local Postgres database
let useSSL = !DATABASE_URL.includes("localhost");

module.exports = pgp(DATABASE_URL + (useSSL ? "?ssl=true" : ""));
