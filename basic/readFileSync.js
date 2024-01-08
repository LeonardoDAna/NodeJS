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

const conn = new Client();
conn
  .on("ready", () => {
    console.log("Client :: ready");

    //执行命令
    /*  conn.exec('ls', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  }); */

    //获取目录
    /* conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.readdir('/home', (err, list) => {
      if (err) throw err;
      console.dir(list);
      conn.end();
    });
  }); */

    //执行多个命令
    conn.shell((err, stream) => {
      if (err) throw err;
      stream
        .on("close", () => {
          console.log("Stream :: close");
          conn.end();
        })
        .on("data", (data) => {
          console.log("OUTPUT: " + data);
        });
      stream.end("cd /home\nls\ntouch fff.txt\n");
    });
  })
  .connect(sshConfig);
