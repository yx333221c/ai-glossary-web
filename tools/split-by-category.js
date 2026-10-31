/*
 * 把现有 data-*.js 按 cat 字段重切成每个分类一个文件。
 * 关键要求：条目源码逐字节搬运，不重新序列化，避免转义/格式差异造成静默改动。
 *
 * 用法：node tools/split-by-category.js
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var DATA = path.join(ROOT, "data");

var files = fs.readdirSync(DATA).filter(function (f) {
  return /^data-.*\.js$/.test(f) && !/^data-(math|ml|dl|nlp|training|inference|multimodal|agent|safety|infra|frontier)\.js$/.test(f);
}).sort();

console.log("源文件: " + files.join(", "));

/**
 * 取出所有条目对象的源码片段。
 * 做法：定位每个 `id: "`，向前找最近的 `{`，再从那里做字符串感知的括号配对。
 * 不能只收 depth===1 的对象——文件最外层是 IIFE 的花括号，那样会把整份文件
 * 当成一个对象然后丢掉。条目内部只有数组，没有嵌套对象，所以向前找最近
 * 花括号是安全的。
 */
function extractObjects(text) {
  var out = [];
  var re = /\bid:\s*"/g, m;
  while ((m = re.exec(text))) {
    var start = text.lastIndexOf("{", m.index);
    if (start < 0) continue;
    var end = matchBrace(text, start);
    if (end < 0) continue;
    var slice = text.slice(start, end + 1);
    if (!/^\{\s*id:\s*"/.test(slice)) continue;
    if (out.indexOf(slice) >= 0) continue;
    out.push(slice);
  }
  return out;
}

/** 从 open 处的 '{' 起做配对，跳过字符串与注释，返回闭合 '}' 下标或 -1 */
function matchBrace(text, open) {
  var depth = 0, i = open, n = text.length;
  var inStr = false, quote = "", esc = false, inLineC = false, inBlkC = false;
  while (i < n) {
    var c = text[i], nx = text[i + 1];
    if (inLineC) { if (c === "\n") inLineC = false; i++; continue; }
    if (inBlkC) { if (c === "*" && nx === "/") { inBlkC = false; i += 2; continue; } i++; continue; }
    if (inStr) {
      if (esc) { esc = false; i++; continue; }
      if (c === "\\") { esc = true; i++; continue; }
      if (c === quote) inStr = false;
      i++; continue;
    }
    if (c === "/" && nx === "/") { inLineC = true; i += 2; continue; }
    if (c === "/" && nx === "*") { inBlkC = true; i += 2; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = true; quote = c; i++; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return i; }
    i++;
  }
  return -1;
}

function field(objSrc, key) {
  var re = new RegExp('(^|[\\s,{])' + key + ':\\s*"((?:[^"\\\\]|\\\\.)*)"', "m");
  var m = re.exec(objSrc);
  return m ? m[2] : null;
}

var groups = {};
var total = 0;
var seenIds = {};

files.forEach(function (f) {
  var src = fs.readFileSync(path.join(DATA, f), "utf8");
  var objs = extractObjects(src);
  objs.forEach(function (o) {
    var id = field(o, "id");
    var cat = field(o, "cat");
    if (!id) { console.log("!! 缺 id 的对象来自 " + f); return; }
    if (!cat) { console.log("!! " + id + " 缺 cat"); return; }
    if (seenIds[id]) { console.log("!! 重复 id: " + id + " (" + seenIds[id] + " vs " + f + ")"); return; }
    seenIds[id] = f;
    (groups[cat] = groups[cat] || []).push(o);
    total++;
  });
});

var CAT_ORDER = ["math", "ml", "dl", "nlp", "training", "inference",
                 "multimodal", "agent", "safety", "infra", "frontier"];

var written = 0, moved = 0;
CAT_ORDER.forEach(function (cat) {
  var list = groups[cat] || [];
  if (!list.length) { console.log("分类 " + cat + " 无条目，跳过"); return; }
  var body = list.map(function (o) {
    /* 对象切片的首行是 '{'，其余行带着原文件的缩进（字段 6 空格）。
       直接整体加缩进会累加成 10 空格，所以先把后续行的前导空白归一到 6。 */
    return o.split("\n").map(function (line, i) {
      if (i === 0) return "    {";
      if (!line.trim()) return "";
      return "      " + line.trim();
    }).join("\n");
  }).join(",\n");
  var text =
    "/*\n" +
    " * AI 术语词典 · 分类数据：cat = \"" + cat + "\"\n" +
    " * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。\n" +
    " * 字段与写法约定见 README「数据格式」。\n" +
    " */\n" +
    "(function (global) {\n" +
    "  var T = (global.AI_TERMS = global.AI_TERMS || []);\n\n" +
    "  T.push(\n" + body + "\n  );\n" +
    "})(window);\n";
  fs.writeFileSync(path.join(DATA, "data-" + cat + ".js"), text);
  written++;
  moved += list.length;
  console.log("  data-" + cat + ".js  " + list.length + " 条");
});

console.log("\n提取条目 " + total + "，写入 " + moved + "，文件 " + written);
console.log("未归类: " + Object.keys(groups).filter(function (k) { return CAT_ORDER.indexOf(k) < 0; }).join(", "));
