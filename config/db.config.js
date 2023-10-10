const { createPool } = require("mysql");
/** Connection pool creation - START */
const db = createPool({
  port: 3305,
  host: "localhost",
  user: "root",
  password: "",
  database: "expense_management",
  connectionLimit: 10,
});
/** Connection pool creation - END */

module.exports = db;
