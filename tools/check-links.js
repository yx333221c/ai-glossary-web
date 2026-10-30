/*
 * 列出数据中所有指向不存在 id 的 related 引用
 * 运行：node tools/check-links.js
 */
"use strict";
var fs = require("fs");
var path = require("path");
var ROOT = path.resolve(__dirname, "..");

var win = {};
global.window = win;
require(path.join(ROOT, "assets", "engine.js"));
var dataFiles = fs.readdirSync(path.join(ROOT, "data"))
  .filter(function (f) { return /^data-.*\.js$/.test(f); })
  .sort();
dataFiles.forEach(function (f) { require(path.join(ROOT, "data", f)); });

var raw = win.AI_TERMS || [];
var ids = {};
raw.forEach(function (t) { ids[t.id] = 1; });

var bad = [];
raw.forEach(function (t) {
  (t.related || []).forEach(function (r) {
    if (!ids[r]) bad.push(t.id + " → " + r);
  });
});

console.log("分片: " + dataFiles.join(", ") + "   条目: " + raw.length);
console.log("悬空 related 引用: " + bad.length);
bad.forEach(function (b) { console.log("  · " + b); });
