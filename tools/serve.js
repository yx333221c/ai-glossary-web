/*
 * 最小静态服务器（仅用于本地验证，非站点依赖）
 * 运行：node tools/serve.js [port]
 */
"use strict";
var http = require("http");
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var PORT = parseInt(process.argv[2], 10) || 8137;

var MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml"
};

http.createServer(function (req, res) {
  var u = req.url.split("?")[0];
  if (u === "/" || u === "") u = "/index.html";
  var file = path.join(ROOT, path.normalize(u).replace(/^(\.\.[\/\\])+/, ""));
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404); res.end("404 " + u); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, "127.0.0.1", function () {
  console.log("serving " + ROOT + " on http://127.0.0.1:" + PORT);
});
