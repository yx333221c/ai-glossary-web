/*
 * 一次性维护脚本：删除数据分片里的重复条目（文本级、保留注释与排版）
 * 用法：node tools/dedupe.js <file> <id> [<id> ...]
 * 会打印删除前后的条目数，避免「报告删了但其实没删」。
 */
"use strict";
var fs = require("fs");

var args = process.argv.slice(2);
var file = args.shift();
var targets = args;
if (!file || !targets.length) {
  console.error("usage: node tools/dedupe.js <file> id [id ...]");
  process.exit(2);
}

var src = fs.readFileSync(file, "utf8");
var before = countEntries(src);

/** 数一下文本里有多少个 `id: "..."` 形式的条目 */
function countEntries(text) {
  return (text.match(/^\s*id:\s*"/gm) || []).length;
}

/**
 * 找到 idx 所在对象字面量的 [start, end)。
 * 关键：从 idx 往前找到的 `{` 可能属于嵌套结构，所以从那个 `{` 开始向后做
 * 括号配对时，必须确认配对的 `}` 之后紧跟 `,` 或 `)`（即它确实是数组元素对象）。
 * 简化做法：直接扫描所有顶层对象，靠 id 文本落在哪个对象里来定位。
 */
function findObjectByText(text, marker) {
  var idx = text.indexOf(marker);
  if (idx < 0) return null;

  /* 从 marker 往前逐个候选 `{`，取第一个「能干净配对且以 { 开始、内容为该对象」的 */
  var start = -1, depth = 0, inStr = false, quote = "", esc = false, i;
  /* 先向后找闭合，向前找起点：以 id: 出现处的最近 { 为起点试探 */
  for (i = idx; i >= 0; i--) {
    if (text[i] === "{") { start = i; break; }
  }
  if (start < 0) return null;

  depth = 0;
  for (i = start; i < text.length; i++) {
    var c = text[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === quote) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = true; quote = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return [start, i + 1];
    }
  }
  return null;
}

var removed = [];
targets.forEach(function (id) {
  var marker = 'id: "' + id + '"';
  var span = findObjectByText(src, marker);
  if (!span) { console.log("  not found: " + id); return; }
  var s = span[0], e = span[1];
  /* 吃掉后面可能的逗号 */
  var m = /^[\s]*,?/.exec(src.slice(e));
  e += m ? m[0].length : 0;
  /* 再吃掉这一行剩下的缩进与换行 */
  var m2 = /^[ \t]*\r?\n/.exec(src.slice(e));
  e += m2 ? m2[0].length : 0;
  src = src.slice(0, s) + src.slice(e);
  removed.push(id);
});

/* 清理可能留下的空 push */
src = src.replace(/T\.push\(\s*\)\s*;/g, "");

fs.writeFileSync(file, src);
var after = countEntries(src);
console.log(JSON.stringify({
  file: file, targets: targets, removed: removed,
  entriesBefore: before, entriesAfter: after, delta: after - before
}, null, 1));
if (after !== before - removed.length) {
  console.log("!! 计数与删除数不一致，请人工检查");
  process.exit(1);
}
