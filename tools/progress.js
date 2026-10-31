/*
 * 进度看板：每个分类文件的 plain 覆盖情况 + 当前硬性违规明细
 * 用法：node tools/progress.js
 */
"use strict";
var fs = require("fs");
var os = require("os");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var DATA = path.join(ROOT, "data");
var files = fs.readdirSync(DATA).filter(function (f) { return /^data-[a-z]+\.js$/.test(f); }).sort();

function load(file) {
  var tmp = path.join(os.tmpdir(), "prog-" + file);
  fs.writeFileSync(tmp, fs.readFileSync(path.join(DATA, file), "utf8"));
  var w = { AI_TERMS: undefined };
  global.window = w;
  delete require.cache[require.resolve(tmp)];
  try { require(tmp); } catch (e) { return { error: e.message, terms: [] }; }
  fs.unlinkSync(tmp);
  return { error: null, terms: w.AI_TERMS || [] };
}

var totAll = 0, totPlain = 0, syntaxErrors = [];

files.forEach(function (f) {
  var r = load(f);
  if (r.error) {
    syntaxErrors.push(f + " :: " + r.error.split("\n")[0]);
    console.log((f + " ").padEnd(26) + "!! 语法错误，文件读不起来");
    return;
  }
  var terms = r.terms;
  var done = terms.filter(function (t) { return t.plain && String(t.plain).trim(); });
  totAll += terms.length;
  totPlain += done.length;
  var bar = "";
  for (var i = 0; i < 20; i++) bar += (i < Math.round(20 * done.length / Math.max(1, terms.length)) ? "#" : ".");
  console.log((f.replace("data-", "").replace(".js", "") + " ").padEnd(16) +
              " [" + bar + "] " + String(done.length).padStart(2) + "/" + String(terms.length).padEnd(3));
});

console.log("\n合计 " + totPlain + " / " + totAll + " 条已写 plain");
if (syntaxErrors.length) {
  console.log("\n!! 语法错误（会直接让站点白屏）：");
  syntaxErrors.forEach(function (e) { console.log("   · " + e); });
}
