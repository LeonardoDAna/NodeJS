import mysql from "mysql";
import { Client } from "ssh2";
import { readFileSync } from "fs";

const client = new Client();
let connection;

client
  .on("ready", () => {
    console.log("Client :: ready");
    client.exec("uptime", (err, stream) => {
      if (err) throw err;
      stream
        .on("close", (code, signal) => {
          console.log(
            "Stream :: close :: code: " + code + ", signal: " + signal
          );
          client.end();
        })
        .on("data", (data) => {
          console.log("STDOUT: " + data);
        })
        .stderr.on("data", (data) => {
          console.log("STDERR: " + data);
        });

      //创建数据库连接
      connection = mysql.createConnection({
        host: "122.51.48.31", //主机IP
        port: 3306, //端口号
        user: "root", //用户名
        password: "Root@1234", //密码
        database: "mysql", //数据库名
      });
      //启动连接
      connection.connect();
    });
  })
  .connect({
    host: "122.51.48.31",
    port: 22,
    username: "root",
    privateKey: readFileSync("../privatekey/Leo.pem"),
  });

//执行sql语句，查询两条
connection.query("select * from user_table ", function (error, result, fields) {
  if (error) throw error;
  console.log(result);
});
