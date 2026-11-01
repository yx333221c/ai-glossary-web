/*
 * 变异测试：故意让 about.html 的权重表清单与引擎脱节，
 * 确认 tests/pages.js 的同步检查会失败。
 * 用法：node tools/mutate-weight-sync.js
 */
"use strict";
var cp = require("child_process");
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var ABOUT = path.join(ROOT, "about.html");
var original = fs.readFileSync(ABOUT, "utf8");

function run() {
  var r = cp.spawnSync(process.execPath, ["tests/pages.js"], { cwd: ROOT, encoding: "utf8" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

var CASES = [
  { name: "从清单里删掉 plainHas 那一行",
    apply: function (s) {
      return s.replace(/\s*\["plainHas",[^\n]*\],/, "");
    } },
  { name: "往清单里塞一个引擎不认识的键",
    apply: function (s) {
      return s.replace(/\["longCap",/, '["ghostKey", "幽灵键", "不该存在"],\n      ["longCap",');
    } }
];

var allCaught = true;
CASES.forEach(function (c) {
  var mutated = c.apply(original);
  if (mutated === original) {
    console.log("?? " + c.name + " —— 没改动任何内容，本次变异无效");
    allCaught = false;
    return;
  }
  fs.writeFileSync(ABOUT, mutated);
  var r = run();
  var caught = r.code !== 0;
  console.log((caught ? "✓ " : "✗ ") + c.name + " → 测试" + (caught ? "如期失败" : "仍然通过（检查没起作用！）"));
  if (!caught) allCaught = false;
  else {
    var hit = (r.out.match(/· [^\n]*(漏|多余)[^\n]*/) || [""])[0];
    if (hit) console.log("      报告: " + hit.trim());
  }
});

fs.writeFileSync(ABOUT, original);
var back = run();
console.log("\n还原后 exit=" + back.code + "  " +
            ((/通过 (\d+) \/ (\d+)/.exec(back.out) || [, "?", "?"]).slice(1).join(" / ")));
if (back.code !== 0) { console.log("!! 还原后仍失败，可能没还原干净"); allCaught = false; }
console.log(allCaught ? "\n结论：同步检查有效" : "\n结论：同步检查有盲区");
process.exit(allCaught ? 0 : 1);
