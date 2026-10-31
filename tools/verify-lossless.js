/*
 * 校验按分类重切是否无损：把 git HEAD 里的旧 data-*.js 与工作区新的
 * data-<cat>.js 分别解析，逐条逐字段比对。
 * 用法：node tools/verify-lossless.js
 */
"use strict";
var cp = require("child_process");
var fs = require("fs");
var os = require("os");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var OLD = ["data-core.js", "data-llm.js", "data-systems.js", "data-extra.js", "data-agents.js"];
var NEW = ["math", "ml", "dl", "nlp", "training", "inference", "multimodal",
           "agent", "safety", "infra", "frontier"].map(function (c) { return "data-" + c + ".js"; });

function loadSet(names, resolver) {
  var map = {};
  names.forEach(function (n) {
    var src = resolver(n);
    var tmp = path.join(os.tmpdir(), "vloss-" + n.replace(/[^a-z0-9.]/gi, "_"));
    fs.writeFileSync(tmp, src);
    var w = { AI_TERMS: undefined };
    global.window = w;
    delete require.cache[require.resolve(tmp)];
    require(tmp);
    (w.AI_TERMS || []).forEach(function (t) { map[t.id] = t; });
    fs.unlinkSync(tmp);
  });
  return map;
}

var a = loadSet(OLD, function (n) {
  return cp.execSync("git -C \"" + ROOT + "\" show HEAD:data/" + n, { encoding: "utf8", maxBuffer: 1 << 28 });
});
var b = loadSet(NEW, function (n) {
  return fs.readFileSync(path.join(ROOT, "data", n), "utf8");
});

var ka = Object.keys(a), kb = Object.keys(b);
console.log("旧条目 " + ka.length + "，新条目 " + kb.length);

var problems = [];
ka.forEach(function (id) {
  if (!b[id]) { problems.push("丢失条目: " + id); return; }
  var x = a[id], y = b[id];
  var keys = {};
  Object.keys(x).forEach(function (k) { keys[k] = 1; });
  Object.keys(y).forEach(function (k) { keys[k] = 1; });
  Object.keys(keys).forEach(function (k) {
    var s1 = JSON.stringify(x[k]), s2 = JSON.stringify(y[k]);
    if (s1 !== s2) problems.push(id + "." + k + " 不一致\n    旧: " + s1 + "\n    新: " + s2);
  });
});
kb.forEach(function (id) { if (!a[id]) problems.push("凭空多出条目: " + id); });

/* 分类归属是否仍然正确 */
NEW.forEach(function (f) {
  var cat = f.replace(/^data-/, "").replace(/\.js$/, "");
  var src = fs.readFileSync(path.join(ROOT, "data", f), "utf8");
  var w = { AI_TERMS: undefined };
  var tmp = path.join(os.tmpdir(), "vcat-" + f);
  fs.writeFileSync(tmp, src);
  global.window = w;
  delete require.cache[require.resolve(tmp)];
  require(tmp);
  w.AI_TERMS.forEach(function (t) {
    if (t.cat !== cat) problems.push(t.id + " 在 " + f + " 里但 cat=" + t.cat);
  });
  fs.unlinkSync(tmp);
});

if (problems.length) {
  console.log("\n✗ 发现 " + problems.length + " 处差异：");
  problems.slice(0, 20).forEach(function (p) { console.log("  · " + p); });
  process.exit(1);
}
console.log("\n✓ 无损：195 条逐字段完全一致，分类归属正确");
