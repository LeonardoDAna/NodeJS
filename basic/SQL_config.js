import fs from "fs";
import { Client } from "ssh2";
import mysql2 from "mysql2";

const sshConfig = {
  host: "122.51.48.31",
  port: 22,
  username: "root",
  privateKey: fs.readFileSync("../privatekey/Leo.pem"),
};

const dbConfig = {
  host: "127.0.0.1",
  port: 3306,
  user: "mysqlAdmin",
  // password: "Root@1234",
  password: "wanghaoyu213458",
  database: "mysql",
};

async function connectSSH() {
  const sshClient = new Client();
  return new Promise((resolve, reject) => {
    sshClient
      .on("ready", () => {
        console.log("SSH 连接成功");
        resolve(sshClient);
      })
      .connect(sshConfig);

    sshClient.on("error", (err) => {
      reject(err);
    });
  });
}

async function connectDatabase(sshClient) {
  return new Promise((resolve, reject) => {
    const mysqlClient = mysql2.createConnection({
      host: "127.0.0.1",
      port: 3306, // 使用隧道的本地端口
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    sshClient.forwardOut("localhost", 3306, "localhost", 3306, (err) => {
      if (err) reject(err);
      console.log("隧道创建成功");
      mysqlClient.connect((err) => {
        if (err) reject(err);
        console.log("MySQL 连接成功");
        resolve(mysqlClient);
      });
    });
  });
}

async function executeQuery() {
  try {
    const sshClient = await connectSSH();
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
//在上面的代码中，使用了 `import` 语句来引入所需的模块。然后，通过 `connectSSH` 函数建立 SSH 连接，使用 `connectDatabase` 函数在 SSH 连接中创建隧道并连接数据库。最后，通过 `executeQuery` 函数执行查询操作。这些函数都使用了 `async/await` 来处理异步操作。请注意，示例代码中的占位符需要替换为你自己的实际值。同时，确保你已经使用 npm 或 yarn 安装了所需的依赖模块（`ssh2` 和 `mysql`）。
