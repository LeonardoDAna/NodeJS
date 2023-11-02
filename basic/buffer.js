var fs = require("fs");
const path = require("path");

fs.readFile(path.join(__dirname, "log.txt"), function (err, data) {
  if (data.length > 0) {
    console.log(data);
  } else {
    let SUCCESSED = "写入文件成功";
    fs.writeFile(path.join(__dirname, "log.txt"), SUCCESSED, function (err) {
      if (err) {
        throw err;
      }
    });
  }
});
