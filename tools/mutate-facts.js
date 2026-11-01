/*
 * 变异测试：往 plain 里注入 def/long 没有的事实，确认 lint-prose.js 拦得住。
 * 「代码里有这条检查」不等于「这条检查会触发」，所以必须实测。
 * 用法：node tools/mutate-facts.js
 */
"use strict";
var cp = require("child_process");
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var FILE = path.join(ROOT, "data", "data-math.js");
var original = fs.readFileSync(FILE, "utf8");

function lint() {
  var r = cp.spawnSync(process.execPath,
    ["tools/lint-prose.js", "data-math.js", "--strict"],
    { cwd: ROOT, encoding: "utf8" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

/* 锚点：token 那条 plain 里的一段真实文字 */
var ANCHOR = "片数既决定它一次能读多少内容";
if (original.indexOf(ANCHOR) < 0) {
  console.error("锚点没找到，data-math.js 可能已被改动");
  process.exit(2);
}

var CASES = [
  { name: "注入原文没有的小数", inject: "大约每 3.5 个汉字算一片，", want: "数字" },
  { name: "注入原文没有的年份", inject: "这套做法在 2016 年后才普及，", want: "年份" },
  { name: "注入原文没有的作品名", inject: "《Attention Is All You Need》之外也常用，", want: "作品名" }
];

var allCaught = true;
CASES.forEach(function (c) {
  fs.writeFileSync(FILE, original.replace(ANCHOR, c.inject + ANCHOR));
  var r = lint();
  var caught = r.code !== 0;
  var named = r.out.indexOf(c.want) >= 0;
  console.log((caught && named ? "✓ " : "✗ ") + c.name +
              " → lint " + (caught ? "失败（正确）" : "通过（漏检！）") +
              (named ? "，且报告了「" + c.want + "」" : "，但未点名「" + c.want + "」"));
  if (!caught || !named) allCaught = false;
});

fs.writeFileSync(FILE, original);
var back = lint();
console.log("\n还原后 exit=" + back.code + (back.code === 0 ? "（已复原）" : "（!! 未复原）"));
if (back.code !== 0) allCaught = false;

console.log(allCaught
  ? "\n结论：白话版「不得新增事实」这条约束确实由机器把关"
  : "\n结论：该检查有盲区，about.html 的说法需要收敛");
process.exit(allCaught ? 0 : 1);
