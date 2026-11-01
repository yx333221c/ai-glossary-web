/*
 * 变异测试：故意破坏拼音音节表，确认 tests/run.js 的不变式真的会失败。
 * 一条永远不会红的测试等于没有测试，所以这一步不能省。
 * 用法：node tools/mutate-pinyin.js            （跑完自动还原）
 */
"use strict";
var cp = require("child_process");
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var ENG = path.join(ROOT, "assets", "engine.js");
var BAK = ENG + ".mutate-bak";

var MUTATIONS = [
  { name: "删掉音节 ci（原缺陷的真实形态）", drop: "ci" },
  { name: "删掉音节 lei", drop: "lei" },
  { name: "删掉音节 lin", drop: "lin" }
];

function runTests() {
  var r = cp.spawnSync(process.execPath, ["tests/run.js"], { cwd: ROOT, encoding: "utf8" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

var original = fs.readFileSync(ENG, "utf8");
fs.writeFileSync(BAK, original);

var allCaught = true;
MUTATIONS.forEach(function (m) {
  /* 按 token 精确剔除表里的这一个音节，逐行替换最可靠 */
  var hit = false;
  var lines = original.split("\n").map(function (line) {
    var before = line;
    line = line.replace(new RegExp('"' + m.drop + '",\\s*', "g"), "");
    line = line.replace(new RegExp('\\s*"' + m.drop + '"', "g"), "");
    if (line !== before) hit = true;
    return line;
  }).join("\n");

  if (!hit) {
    console.log("?? " + m.name + " —— 没能在表里找到该项，变异未生效，测试无效");
    allCaught = false;
    return;
  }
  fs.writeFileSync(ENG, lines);
  var r = runTests();
  var caught = r.code !== 0;
  console.log((caught ? "✓ " : "✗ ") + m.name + " → 测试" + (caught ? "如期失败" : "仍然通过（不变式没起作用！）"));
  if (!caught) {
    allCaught = false;
    var lines2 = r.out.split("\n").filter(function (l) { return /≠|切分失败|通过 \d+ \/ \d+/.test(l); });
    lines2.slice(0, 6).forEach(function (l) { console.log("      " + l.trim()); });
  }
});

fs.writeFileSync(ENG, original);
fs.unlinkSync(BAK);
var restored = runTests();
console.log("\n还原后：exit=" + restored.code + "  " +
            (/通过 (\d+) \/ (\d+)/.exec(restored.out) || [, "?", "?"]).slice(1).join(" / "));
if (restored.code !== 0) {
  console.log("!! 还原后测试没通过，说明还原出了问题");
  allCaught = false;
}
console.log(allCaught ? "\n结论：不变式确实能抓住音节表缺项这类缺陷" : "\n结论：不变式存在盲区，需要加强");
process.exit(allCaught ? 0 : 1);
