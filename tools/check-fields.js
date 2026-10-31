/*
 * 校验：与 HEAD 相比，数据文件是否只新增了 plain，其余字段一律未动。
 * 多人并行改数据时，这是防止误伤的主闸。
 * 用法：node tools/check-fields.js [基准ref，默认 HEAD]
 */
"use strict";
var cp = require("child_process");
var fs = require("fs");
var os = require("os");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var BASE = process.argv[2] || "HEAD";
var CATS = ["math", "ml", "dl", "nlp", "training", "inference",
            "multimodal", "agent", "safety", "infra", "frontier"];
var PROTECTED = ["id", "en", "zh", "aka", "pinyin", "cat", "level",
                 "def", "long", "avoid", "related", "tags", "src"];

function load(src, name) {
  var tmp = path.join(os.tmpdir(), "chk-" + name.replace(/[^\w.-]/g, "_"));
  fs.writeFileSync(tmp, src);
  var w = { AI_TERMS: undefined };
  global.window = w;
  delete require.cache[require.resolve(tmp)];
  require(tmp);                       /* 语法错误会在这里抛出 */
  fs.unlinkSync(tmp);
  var m = {};
  (w.AI_TERMS || []).forEach(function (t) { m[t.id] = t; });
  return m;
}

var diffs = 0, added = 0, removedPlain = 0;

CATS.forEach(function (c) {
  var f = "data-" + c + ".js";
  var oldSrc, newSrc;
  try {
    oldSrc = cp.execSync('git -C "' + ROOT + '" show ' + BASE + ":data/" + f,
                         { encoding: "utf8", maxBuffer: 1 << 28 });
  } catch (e) { console.log("  (跳过 " + f + "：基准里没有这个文件)"); return; }
  newSrc = fs.readFileSync(path.join(ROOT, "data", f), "utf8");

  var o, n;
  try { o = load(oldSrc, "old-" + f); } catch (e) { console.log("  !! " + f + " 基准版读不起: " + e.message); diffs++; return; }
  try { n = load(newSrc, "new-" + f); } catch (e) { console.log("  !! " + f + " 当前版语法错误: " + e.message); diffs++; return; }

  Object.keys(o).forEach(function (id) {
    var a = o[id], b = n[id];
    if (!b) { console.log("  !! 条目消失 " + f + " :: " + id); diffs++; return; }
    PROTECTED.forEach(function (k) {
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
        console.log("  !! 受保护字段被改 " + f + " :: " + id + "." + k);
        console.log("       旧: " + JSON.stringify(a[k]));
        console.log("       新: " + JSON.stringify(b[k]));
        diffs++;
      }
    });
    if (b.plain && !a.plain) added++;
    if (a.plain && b.plain && a.plain !== b.plain) {
      console.log("  ~  plain 被改写 " + f + " :: " + id + "（若为有意修订可忽略）");
    }
    if (a.plain && !b.plain) { console.log("  !! plain 被删除 " + f + " :: " + id); diffs++; removedPlain++; }
  });
  Object.keys(n).forEach(function (id) {
    if (!o[id]) { console.log("  !! 凭空多出条目 " + f + " :: " + id); diffs++; }
  });
});

console.log("\n新增 plain " + added + " 条，受保护字段改动 " + diffs + " 处");
process.exit(diffs ? 1 : 0);
