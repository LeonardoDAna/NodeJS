import http from "http";
import { loadIdByGuid } from "./SQL_config.js";

const hostname = "127.0.0.1";
const port = 3000;

let conn = loadIdByGuid();

let server = http.createServer((req, res, next) => {
  // sql语句查询列表所有数据  SELECT * FROM 你数据库的表名，我这里是userList
  let sql = "SELECT * FROM user_table";

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end("hello world");
  // conn.query(sql, (err, r) => {
  // res.json({ code: 200, data: r, msg: "成功" });
  // console.log(err, r);
  // });
});
conn
  .then((res) => {
    server.listen(port, hostname, () => {
      console.log(`服务器运行在 http://${hostname}:${port}/`);
    });
  })
  .catch((err) => {
    // console.log(err);
  });
