const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "122.51.48.31",
  user: "root",
  password: "root@1234",
  database: "user",
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL database: " + error);
    return;
  }
  console.log("Connected to MySQL database!");
});
