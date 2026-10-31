/*
 * 统一 data-<分类>.js 的缩进：T.push(...) 块内，
 *    以 { 或 } 开头的行 -> 4 空格；其余非空行 -> 6 空格。
 * 依据：条目对象内部没有嵌套对象，数组都写成一行，所以这个形状规则是安全的。
 * 只调整行首空白，不碰内容。
 * 用法：node tools/reindent-data.js [文件...]
 */
"use strict";
var fs = require("fs");
var path = require("path");
var ROOT = path.resolve(__dirname, "..");

var files = process.argv.slice(2);
if (!files.length) {
  files = fs.readdirSync(path.join(ROOT, "data"))
    .filter(function (f) { return /^data-[a-z]+\.js$/.test(f); });
}

var bad = 0;
files.forEach(function (f) {
  var p = path.join(ROOT, "data", f);
  var src = fs.readFileSync(p, "utf8");
  var lines = src.split("\n");

  var start = -1, end = -1;
  for (var i = 0; i < lines.length; i++) {
    if (start < 0 && /^\s*T\.push\(\s*$/.test(lines[i])) start = i + 1;
    if (start >= 0 && i > start && /^\s*\);\s*$/.test(lines[i])) { end = i - 1; break; }
  }
  if (start < 0 || end < 0) { console.log(f + ": 找不到 T.push 块，跳过"); bad++; return; }

  /* 安全检查：块内不应出现多行数组或嵌套对象 */
  var depth = 0, nested = 0;
  for (var j = start; j <= end; j++) {
    var t = lines[j].trim();
    if (!t) continue;
    depth += (t.match(/\{/g) || []).length - (t.match(/\}/g) || []).length;
    if (depth > 1) nested++;
    if (depth < 0) { console.log(f + ": 括号异常于第 " + (j + 1) + " 行"); bad++; return; }
  }
  if (nested) { console.log(f + ": 有 " + nested + " 行处于嵌套对象内，跳过以免破坏结构"); bad++; return; }

  var changed = 0;
  for (var k = start; k <= end; k++) {
    var raw = lines[k], trimmed = raw.trim();
    if (!trimmed) continue;
    var want = (/^[{}]/.test(trimmed) || /^},?\s*$/.test(trimmed)) ? "    " : "      ";
    var rebuilt = want + trimmed;
    if (rebuilt !== raw) { lines[k] = rebuilt; changed++; }
  }
  fs.writeFileSync(p, lines.join("\n"));
  console.log(f + ": 调整 " + changed + " 行");
});
process.exit(bad ? 1 : 0);
