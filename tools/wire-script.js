/*
 * 一次性维护脚本：把某个数据分片的 <script> 标签补进所有页面
 * 用法：node tools/wire-script.js <scriptRelPath> [插入到哪个已有 script 之后]
 * 例：  node tools/wire-script.js data/data-agents.js data/data-extra.js
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var add = process.argv[2];
var after = process.argv[3] || "data/data-extra.js";
var PAGES = ["index.html", "search.html", "term.html", "about.html"];

if (!add) { console.error("usage: node tools/wire-script.js <path> [afterPath]"); process.exit(2); }

var tag = '<script src="' + add + '"></script>';
var anchor = '<script src="' + after + '"></script>';

PAGES.forEach(function (p) {
  var file = path.join(ROOT, p);
  if (!fs.existsSync(file)) { console.log(p + ": 不存在，跳过"); return; }
  var s = fs.readFileSync(file, "utf8");
  if (s.indexOf(add) >= 0) { console.log(p + ": 已包含，跳过"); return; }
  var i = s.indexOf(anchor);
  if (i < 0) { console.log(p + ": 找不到锚点 " + anchor + "，跳过"); return; }
  i += anchor.length;
  s = s.slice(0, i) + "\n" + tag + s.slice(i);
  fs.writeFileSync(file, s);
  console.log(p + ": 已在 " + after + " 之后插入 " + add);
});
