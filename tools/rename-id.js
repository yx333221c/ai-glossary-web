/*
 * 一次性维护脚本：把数据分片里指向旧 id 的 related 引用改名。
 * 用法：node tools/rename-id.js <file> <oldId> <newId>
 * 只改 related 数组里的字符串，不动 en/zh 文本，避免误伤释义。
 */
"use strict";
var fs = require("fs");

var file = process.argv[2], oldId = process.argv[3], newId = process.argv[4];
if (!file || !oldId || !newId) {
  console.error("usage: node tools/rename-id.js <file> <oldId> <newId>");
  process.exit(2);
}

var src = fs.readFileSync(file, "utf8");
var n = 0;

/* 逐条 related: [...] 处理，只替换数组内的字符串元素 */
var out = src.replace(/related:\s*\[[^\]]*\]/g, function (block) {
  return block.replace(new RegExp('"' + oldId.replace(/[-]/g, "\\$&") + '"', "g"), function () {
    n++;
    return '"' + newId + '"';
  });
});

fs.writeFileSync(file, out);
console.log(JSON.stringify({ file: file, oldId: oldId, newId: newId, replaced: n }));
