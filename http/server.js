const http = require("http");
const mySQL = require("mysql");

const db = mySQL.createConnection({
  host: "localhost",
  port: "3306", //数据库端口
  user: "root",
  password: "Root@1234",
  database: "mysql",
});

const hostname = "localhost";
const port = 3000;

db.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL dtabase: a" + error);
    return;
  }
  console.log("Connected to MySQL database!");
});

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    // 处理GET请求
    const url = req.url;
    console.log(`接收GET请求，URL: ${url}`);

    // 在这里编写获取接口的逻辑，比如从数据库获取数据
    // 假设这里从数据库中获取了一些用户数据
    const userData = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
      { id: 3, name: "Bob" },
    ];

    // 设置响应头部
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    // 发送响应
    res.end(JSON.stringify(userData));
  } else {
    // 处理其他请求方法
    res.statusCode = 405;
    res.end("Method Not Allowed");
  }
});

server.listen(port, hostname, () => {
  console.log(`服务器运行在 http://${hostname}:${port}/`);
});
