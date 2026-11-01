/*
 * 页面装配检查：确认四个页面的脚本引用、data-page、样式引用都到位，
 * 并检查数据里 related 的悬空引用与跨文件重复 id。
 * 运行：node tests/pages.js
 */
"use strict";

var fs = require("fs");
var path = require("path");
var ROOT = path.resolve(__dirname, "..");

var pass = 0, fail = 0;
function ok(c, label) {
  if (c) { pass++; console.log("  ✓ " + label); }
  else { fail++; console.log("  ✗ " + label); }
}

var dataFiles = fs.readdirSync(path.join(ROOT, "data"))
  .filter(function (f) { return /^data-.*\.js$/.test(f); })
  .sort();

/* 真实加载一遍（和浏览器同样的顺序） */
var win = {};
global.window = win;
require(path.join(ROOT, "assets", "engine.js"));
dataFiles.forEach(function (f) { require(path.join(ROOT, "data", f)); });
win.AIGlossary.reindex();

var TERMS = win.AIGlossary.terms();
var AI = win.AIGlossary;

console.log("\n数据装配");
console.log("  分片: " + dataFiles.join(", "));
ok(TERMS.length > 100, "已索引 " + TERMS.length + " 条术语");

/* 跨文件重复 id：原始 push 顺序里数一遍 */
var rawIds = {};
dataFiles.forEach(function (f) {
  var src = fs.readFileSync(path.join(ROOT, "data", f), "utf8");
  (src.match(/id:\s*"([^"]+)"/g) || []).forEach(function (m) {
    var id = /id:\s*"([^"]+)"/.exec(m)[1];
    rawIds[id] = (rawIds[id] || 0) + 1;
  });
});
var dupIds = Object.keys(rawIds).filter(function (k) { return rawIds[k] > 1; });
ok(dupIds.length === 0, "无跨分片重复 id" + (dupIds.length ? " — " + dupIds.join(", ") : ""));

/* 悬空 related：buildIndex 已经过滤，所以这里检查「过滤掉了多少」 */
var dropped = 0;
dataFiles.forEach(function (f) {
  var src = fs.readFileSync(path.join(ROOT, "data", f), "utf8");
  (src.match(/related:\s*\[[^\]]*\]/g) || []).forEach(function (blk) {
    (blk.match(/"([^"]+)"/g) || []).forEach(function (q) {
      var id = q.replace(/"/g, "");
      if (!AI.get(id)) dropped++;
    });
  });
});
ok(dropped === 0, "related 无悬空引用（引擎过滤掉 " + dropped + " 处）");

/* 每条术语的链接图在过滤后仍然可用 */
var orphans = TERMS.filter(function (t) { return !(t.related && t.related.length); });
console.log("  提示: 过滤后无相关术语的条目 " + orphans.length + " 条" +
  (orphans.length ? " — " + orphans.slice(0, 8).map(function (t) { return t.id; }).join(", ") : ""));

console.log("\n页面装配");
var PAGES = ["index.html", "search.html", "term.html", "about.html"];
var EXPECT_PAGE = { "index.html": "browse", "search.html": "search", "term.html": "detail", "about.html": "about" };

PAGES.forEach(function (p) {
  var file = path.join(ROOT, p);
  if (!fs.existsSync(file)) { ok(false, p + " 存在"); return; }
  var s = fs.readFileSync(file, "utf8");

  var needScripts = dataFiles.concat(["engine.js", "ui.js"]);
  var missing = needScripts.filter(function (n) {
    return s.indexOf((n.indexOf("data-") === 0 ? "data/" : "assets/") + n) < 0;
  });
  ok(missing.length === 0, p + " 引用了全部脚本" + (missing.length ? " — 缺 " + missing.join(", ") : ""));

  ok(s.indexOf("assets/site.css") >= 0, p + " 引用了样式表");

  var m = /id="chrome" data-page="([a-z]+)"/.exec(s);
  ok(m && m[1] === EXPECT_PAGE[p], p + " 的 data-page = " + EXPECT_PAGE[p] + (m ? "（实为 " + m[1] + "）" : "（缺失）"));

  ok(s.indexOf('lang="zh-CN"') >= 0, p + " 声明了 lang");
  ok(s.indexOf("<meta name=\"viewport\"") >= 0, p + " 有 viewport");
  ok(s.indexOf("data-theme") >= 0 || p === "term.html", p + " 有主题初始化脚本（避免深色模式下闪白）");

  /* 内联脚本语法：抽出来交给 node --check */
  var inline = [];
  var re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g, mm;
  while ((mm = re.exec(s))) {
    if (mm[1].trim()) inline.push(mm[1]);
  }
  inline.forEach(function (code, i) {
    var tmp = path.join(ROOT, "tests", ".inline-" + p + "-" + i + ".js");
    fs.writeFileSync(tmp, code);
    var res = require("child_process").spawnSync(process.execPath, ["--check", tmp], { encoding: "utf8" });
    fs.unlinkSync(tmp);
    ok(res.status === 0, p + " 内联脚本 #" + (i + 1) + " 语法正确" +
      (res.status === 0 ? "" : " — " + res.stderr.split("\n").slice(0, 3).join(" / ")));
  });
});

console.log("\n入口可用性");
/* 浏览页需要能列出全部条目；搜索页需要能命中；详情页需要能取到任意 id */
["attention", "token", "transformer", "rag", "overfitting"].forEach(function (id) {
  var t = AI.get(id);
  ok(!!t, "可直达条目 " + id + (t ? "（" + t.zh + "）" : ""));
});
ok(AI.search("注意力").length > 3, "搜索「注意力」返回多条结果");
ok(AI.groupByCategory().length >= 8, "分类分组有 " + AI.groupByCategory().length + " 组");

console.log("\nabout.html 权重表与引擎同步");
/*
 * 那张表的数值是现场读 AI.WEIGHTS 的，但「列哪些行」是一份手写清单。
 * 引擎加了新权重键而清单没跟上，页面就会静默少几行，看起来仍然自洽。
 * 所以两个方向都要查。
 */
(function weightTableSync() {
  var about = fs.readFileSync(path.join(ROOT, "about.html"), "utf8");
  var block = /var ROWS = \[([\s\S]*?)\n    \];/.exec(about);
  ok(!!block, "about.html 里能找到权重表清单");
  if (!block) return;
  var listed = [];
  var re = /\[\s*"([A-Za-z]+)"\s*,/g, m2;
  while ((m2 = re.exec(block[1]))) listed.push(m2[1]);

  var declared = Object.keys(AI.WEIGHTS);
  var notListed = declared.filter(function (k) { return listed.indexOf(k) < 0; });
  var notDeclared = listed.filter(function (k) { return AI.WEIGHTS[k] === undefined; });

  ok(notListed.length === 0,
     "引擎的每个权重键都在表里出现（" + declared.length + " 个）" +
     (notListed.length ? " — 漏: " + notListed.join(", ") : ""));
  ok(notDeclared.length === 0,
     "表里没有引擎已不认识的键（" + listed.length + " 行）" +
     (notDeclared.length ? " — 多余: " + notDeclared.join(", ") : ""));
})();

console.log("\n白话版覆盖");
var noPlain = TERMS.filter(function (t) { return !t.plain || !String(t.plain).trim(); });
ok(noPlain.length === 0,
   "全部 " + TERMS.length + " 条都有 plain" + (noPlain.length ? " — 缺 " + noPlain.slice(0, 8).map(function (t) { return t.id; }).join(", ") : ""));
/* plain 参与检索但权重必须最低一档，否则长正文会左右排序 */
ok(AI.WEIGHTS.plainHas > 0 && AI.WEIGHTS.plainHas < AI.WEIGHTS.longHas,
   "plain 权重低于 long（" + AI.WEIGHTS.plainHas + " < " + AI.WEIGHTS.longHas + "），不会盖过正文");

console.log("\n" + "=".repeat(52));
console.log("通过 " + pass + " / " + (pass + fail) + (fail ? "  失败 " + fail : "  全部通过"));
console.log("=".repeat(52));
process.exit(fail ? 1 : 0);
