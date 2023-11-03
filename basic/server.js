const http = require("http");
const fs = require("fs");
const path = require("path");
const mime = require("mime");
const cache = {};
const chatServer = require("./lib/chat_server.js");

function send404(response) {
  response.writeHead(404, { "Content-Type": "text/plain" });
  response.write("Error 404:resource not found.");
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {
    "Content-Type": mime.lookup(path.basename(filePath)),
  });
  response.end(fileContents);
}

function serverStatic(response, cache, absPath) {
  // 判断内存中有没有
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    // 检测文件是否存在
    fs.exists(absPath, function (exists) {
      if (exists) {
        fs.readFile(absPath, function (err, data) {
          // 是否正确获取
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

const server = http.createServer(function (request, response) {
  let filePath = false;
  if (request == "/") {
    filePath = "public/index.html";
  } else {
    filePath = "public" + request.url;
  }
  let absPath = "./" + filePath;
  serverStatic(response, cache, absPath);
});

server.listen(3000, function () {
  console.log("Server listening on port 3000");
});
chatServer.listen(server);
