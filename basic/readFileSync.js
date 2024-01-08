const fs = require("fs");
const path = require("path");
const { Client } = require("ssh2");
const mysql = require("mysql");

const sshConfig = {
  host: "122.51.48.31",
  port: 22,
  username: "root",
  privateKey: fs.readFileSync(
    path.resolve(__dirname, "../privatekey/Leo.pem"),
    "UTF-8"
  ),
};

async function connectSSH() {
  const sshClient = new Client();
  return new Promise((resolve, reject) => {
    sshClient.connect(sshConfig, (err) => {
      console.log(err);
      if (err) reject(err);
      console.log("SSH 连接成功");
      resolve(sshClient);
    });
  });
}

async function connectDatabase(sshClient) {
  return new Promise((resolve, reject) => {
    sshClient.forwardOut(
      "localhost",
      3307,
      "localhost",
      3306,
      (err, stream) => {
        if (err) reject(err);
        console.log("隧道创建成功");
        const mysqlClient = mysql.createConnection({
          host: "localhost",
          port: 3306,
          user: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
        });
        mysqlClient.connect((err) => {
          if (err) reject(err);
          console.log("MySQL 连接成功");
          resolve(mysqlClient);
        });
      }
    );
  });
}
async function executeQuery() {
  try {
    const sshClient = await connectSSH();
    console.log(sshClient);
    const mysqlClient = await connectDatabase(sshClient);
    const results = await new Promise((resolve, reject) => {
      mysqlClient.query(
        "SELECT * FROM user_table",
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
    console.log("查询结果:", results);
    mysqlClient.end();
    sshClient.end();
  } catch (error) {
    console.error("连接过程中出现错误:", error);
  }
}

executeQuery();
