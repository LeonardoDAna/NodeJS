import { createClient } from "ssh2";
import { createConnection } from "mysql2";
import fs from "fs";

const sshConfig = {
  host: "122.51.48.31",
  port: 22,
  username: "root",
  privateKey: fs.readFileSync("../privatekey/Leo.pem"),
};

const dbConfig = {
  host: "localhost", // 在SSH隧道中连接本地主机
  user: "root",
  password: "Root@1234",
  database: "mysql",
};

async function connectSSHAndDatabase() {
  const sshClient = createClient();
  await new Promise((resolve, reject) => {
    sshClient
      .on("ready", () => {
        console.log("SSH 连接成功");
        resolve();
      })
      .connect(sshConfig);

    sshClient.on("error", (err) => {
      reject(err);
    });
  });

  const mysqlConnection = await createConnection({
    host: "localhost", // 使用隧道的本地主机名
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    ssh: {
      host: sshConfig.host,
      user: sshConfig.username,
      privateKey: sshConfig.privateKey,
    },
  });

  console.log("MySQL 连接成功");
  return mysqlConnection;
}

async function executeQuery() {
  try {
    const connection = await connectSSHAndDatabase();
    const [rows, fields] = await connection.execute("SELECT * FROM user_table");
    console.log("查询结果:", rows);
    connection.end();
  } catch (error) {
    console.error("连接过程中出现错误:", error);
  }
}

executeQuery();
// 当你运行上述代码时，它会连接到SSH服务器，并在SSH隧道中创建一个到MySQL数据库的连接。然后，它执行一个示例查询并输出结果。请确保将占位符（如'your_ssh_host'、'your_db_username'等）替换为你自己的实际值。同时，确保私钥文件的路径正确，并且私钥的权限设置正确（通常只有用户可读）。`mysql2`插件在创建连接时使用了SSH配置，以便通过SSH隧道连接到数据库。这样，你就可以使用Node.js连接到部署在SSH协议上的Linux上的数据库了。`ssh2`插件负责SSH连接，而`mysql2`插件则处理与MySQL数据库的连接和查询执行。
