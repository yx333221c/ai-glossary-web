/*
 * 把四个页面里的 data-<旧分片>.js 引用换成 data-<分类>.js。
 * 用法：node tools/repoint-data.js
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var OLD = ["data-core.js", "data-llm.js", "data-systems.js", "data-extra.js", "data-agents.js"];
var CATS = ["math", "ml", "dl", "nlp", "training", "inference",
            "multimodal", "agent", "safety", "infra", "frontier"];
var PAGES = ["index.html", "search.html", "term.html", "about.html"];

var newBlock = CATS.map(function (c) {
  return '<script src="data/data-' + c + '.js"></script>';
}).join("\n");

PAGES.forEach(function (p) {
  var file = path.join(ROOT, p);
  var s = fs.readFileSync(file, "utf8");
  var first = s.indexOf('<script src="data/' + OLD[0] + '"></script>');
  var last = s.indexOf('<script src="data/' + OLD[OLD.length - 1] + '"></script>');
  if (first < 0 || last < 0) {
    /* 可能已经换过 */
    if (s.indexOf("data/data-math.js") >= 0) { console.log(p + ": 已是新引用，跳过"); return; }
    console.log(p + ": 找不到旧引用块，跳过");
    return;
  }
  var endOfLast = last + ('<script src="data/' + OLD[OLD.length - 1] + '"></script>').length;
  /* 保留原有的缩进（取第一行前面的空白） */
  var lineStart = s.lastIndexOf("\n", first) + 1;
  var indent = s.slice(lineStart, first).match(/^\s*/)[0];
  var indented = newBlock.split("\n").map(function (l) { return indent + l; }).join("\n");
  s = s.slice(0, lineStart) + indented + s.slice(endOfLast);
  fs.writeFileSync(file, s);
  console.log(p + ": 换成 " + CATS.length + " 个分类文件");
});

/* 校验：每个页面都引用了全部 11 个，且不再引用旧文件 */
var bad = 0;
PAGES.forEach(function (p) {
  var s = fs.readFileSync(path.join(ROOT, p), "utf8");
  var miss = CATS.filter(function (c) { return s.indexOf("data/data-" + c + ".js") < 0; });
  var stale = OLD.filter(function (o) { return s.indexOf("data/" + o) >= 0; });
  if (miss.length || stale.length) {
    bad++;
    console.log("  ✗ " + p + (miss.length ? " 缺 " + miss.join(",") : "") + (stale.length ? " 仍引用 " + stale.join(",") : ""));
  } else {
    console.log("  ✓ " + p);
  }
});
process.exit(bad ? 1 : 0);
