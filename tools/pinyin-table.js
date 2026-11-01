/*
 * 拼音音节表生成器 + 校验器。
 *
 * 为什么不用手写清单：手写的表会漏音节（曾漏掉 ci、lei、lin、kui，
 * 还有一项写成了 " zou" 带空格），漏一个音节就让整条拼音切分失败、
 * 首字母检索静默退化。这里改成「声母 × 韵母」矩阵生成，再用真实数据校验。
 *
 * 用法：
 *   node tools/pinyin-table.js            校验现有数据，报告问题
 *   node tools/pinyin-table.js --emit     输出可直接粘进 engine.js 的数组
 */
"use strict";
var fs = require("fs");
var path = require("path");
var ROOT = path.resolve(__dirname, "..");

/* 声母 → 可用韵母。拼法即 声母 + 韵母；空声母表示零声母音节。
   j/q/x 与 zh/ch/sh/r/z/c/s 的 "u/uan/ue/un" 实际是 ü 系列，
   写成 u 正好对应汉语拼音的正字法（ju、juan、que、xun）。 */
var MATRIX = {
  "":   ["a","ai","an","ang","ao","e","ei","en","eng","er","o","ou"],
  b:    ["a","o","i","u","ai","ei","ao","an","en","ang","eng","ian","in","ing","iao","ie"],
  p:    ["a","o","i","u","ai","ei","ao","ou","en","ang","eng","ian","in","ing","iao","ie"],
  m:    ["a","o","e","i","u","ai","ei","ao","ou","an","en","ang","eng","ian","in","ing","iao","ie","iu"],
  f:    ["a","o","u","ei","ou","an","en","ang","eng","fo"],
  d:    ["a","e","i","u","ai","ei","ao","ou","an","en","ang","eng","ong","ian","ing","iao","ie","iu","uan","ui","un","uo"],
  t:    ["a","e","i","u","ai","ao","ou","an","ang","eng","ong","ian","ing","iao","ie","uan","ui","un","uo"],
  n:    ["a","e","i","u","v","ai","ao","ou","an","en","ang","eng","ong","ian","iang","iao","ie","iu","uan","uo","ve","uo"],
  l:    ["a","e","i","u","v","ai","ei","ao","ou","an","en","ang","eng","in","ing","ong","ia","ian","iang","iao","ie","iu","uan","un","uo","ve","ue"],
  g:    ["a","e","u","ai","ei","ao","ou","an","en","ang","eng","ong","ua","uai","uan","uang","ui","un","uo"],
  k:    ["a","e","u","ai","ao","ou","an","ang","eng","ong","ua","uai","uan","uang","ui","un","uo"],
  h:    ["a","e","u","ai","ao","ou","an","en","ang","eng","ong","ua","uai","uan","uang","ui","un","uo"],
  j:    ["i","ia","ian","iang","iao","ie","in","ing","iong","iu","u","uan","ue","un"],
  q:    ["i","ia","ian","iang","iao","ie","in","ing","iong","iu","u","uan","ue","un"],
  x:    ["i","ia","ian","iang","iao","ie","in","ing","iong","iu","u","uan","ue","un"],
  zh:   ["a","e","i","o","u","ua","uai","uan","uang","ui","un","uo","ao","ou","an","en","ang","eng","ong","ai"],
  ch:   ["a","e","i","o","u","ua","uai","uan","uang","ui","un","uo","ao","ou","an","en","ang","eng","ong","ai"],
  sh:   ["a","e","i","o","u","ua","uai","uan","uang","ui","un","uo","ao","ou","an","en","ang","eng","ong","ai"],
  r:    ["a","e","i","o","u","ua","uan","ui","un","uo","ao","ou","an","en","ang","eng","ong"],
  z:    ["a","e","i","o","u","uan","ui","un","uo","ao","ou","an","en","ang","eng","ong","ai"],
  c:    ["a","e","i","o","u","uan","ui","un","uo","ao","ou","an","en","ang","eng","ong","ai"],
  s:    ["a","e","i","o","u","uan","ui","un","uo","ao","ou","an","en","ang","eng","ong","ai"],
  y:    ["a","e","i","o","u","ao","ou","an","in","ang","ing","ong","ue","uan","un"],
  w:    ["a","o","u","ai","ei","an","en","ang","eng"]
};

var SYLLABLES = (function () {
  var set = {};
  Object.keys(MATRIX).forEach(function (ini) {
    MATRIX[ini].forEach(function (fin) { set[ini + fin] = 1; });
  });
  return Object.keys(set).sort(function (a, b) { return b.length - a.length || (a < b ? -1 : 1); });
})();

function cjk(s) { return (String(s).match(/[㐀-鿿]/g) || []).length; }
function hasLatin(s) { return /[a-z]/i.test(String(s).replace(/[㐀-鿿]/g, "")); }

/**
 * 定长切分：把连写拼音切成恰好 target 个音节。
 * 用记忆化搜索而不是贪心——贪心会跨音节切错（rengong 被切成 reng+o+…），
 * 因为 reng 和 ren 都是合法音节。音节数由汉字数给出，这是最强的约束。
 */
function segment(s, target) {
  var n = s.length;
  var memo = {};
  function go(pos, left) {
    if (pos === n) return left === 0 ? [] : null;
    if (left === 0) return null;
    var key = pos + ":" + left;
    if (memo[key] !== undefined) return memo[key];
    var best = null;
    for (var len = Math.min(6, n - pos); len >= 1; len--) {
      var cand = s.substr(pos, len);
      if (SYLLABLES.indexOf(cand) < 0) continue;
      var rest = go(pos + len, left - 1);
      if (rest) { best = [cand].concat(rest); break; }
    }
    memo[key] = best;
    return best;
  }
  return go(0, target);
}

/* ---------------- 输出 / 打补丁 ---------------- */

function emitArray(indent) {
  var out = [], line = indent;
  SYLLABLES.forEach(function (s) {
    if ((line + '"' + s + '",').length > 78) { out.push(line.replace(/,\s*$/, "")); line = indent; }
    line += '"' + s + '",';
  });
  out.push(line.replace(/,\s*$/, ""));
  return out.join(",\n");
}

if (process.argv.indexOf("--emit") >= 0) {
  console.log("  var PY_SYLLABLES = [\n" + emitArray("    ") + "\n  ];");
  process.exit(0);
}

/* 把 engine.js 里「手写音节表 + 贪心切分」整段换成「生成表 + 定长 DP 切分」。
   贪心会跨音节切错：rengong 被切成 reng+o+…，而 reng 和 ren 都合法。
   DP 用汉字数当音节数约束，切不出来的直接判定失败并退回整串。 */
if (process.argv.indexOf("--patch") >= 0) {
  var ENG = path.join(ROOT, "assets", "engine.js");
  var src = fs.readFileSync(ENG, "utf8");
  var a = src.indexOf("  var PY_SYLLABLES = [");
  var b = src.indexOf("  /**\n   * pyFull / py1");
  if (a < 0 || b < 0 || b < a) { console.error("找不到替换区间"); process.exit(2); }

  var REPL = [
    "  /* 音节表由「声母 × 韵母」生成，不手写：漏一个音节（曾漏 ci、lei、lin、kui）",
    "     就会让整条拼音切分失败、首字母检索静默退化。tools/pinyin-table.js 负责生成与校验。 */",
    "  var PY_SYLLABLES = [",
    emitArray("    "),
    "  ];",
    "",
    "  var PY_SET = {};",
    "  (function () { for (var i = 0; i < PY_SYLLABLES.length; i++) PY_SET[PY_SYLLABLES[i]] = 1; })();",
    "",
    "  /**",
    "   * 把连写拼音切成恰好 want 个音节（记忆化搜索）。",
    "   * want 来自名字里的汉字数，这是比「最长匹配优先」强得多的约束：",
    "   * rengong 必须切成 ren+gong，而不是 reng+o+ng……，因为后者凑不出目标段数。",
    "   * 切不出来返回 null，由调用方退回整串，不会把数据弄坏。",
    "   */",
    "  function segmentSyllables(s, want) {",
    "    var n = s.length;",
    "    if (!n || !want || want > n) return null;",
    "    var memo = {};",
    "    function go(pos, left) {",
    "      if (pos === n) return left === 0 ? [] : null;",
    "      if (left === 0) return null;",
    "      var key = pos * 32 + left;",
    "      if (memo[key] !== undefined) return memo[key];",
    "      var best = null;",
    "      for (var len = Math.min(6, n - pos); len >= 1; len--) {",
    "        var cand = s.substr(pos, len);",
    "        if (!PY_SET[cand]) continue;",
    "        var rest = go(pos + len, left - 1);",
    "        if (rest) { best = [cand].concat(rest); break; }",
    "      }",
    "      memo[key] = best;",
    "      return best;",
    "    }",
    "    return go(0, want);",
    "  }",
    "",
    "  /** 名字里的汉字个数，即拼音应有的音节数 */",
    "  function cjkCount(s) {",
    "    return (String(s || \"\").match(/[\\u3400-\\u9fff]/g) || []).length;",
    "  }",
    "",
    "  /**",
    "   * 数据里 pinyin 可以按音节空格分隔，也可以连写。",
    "   * 连写时按汉字数定长切分；切不动（含外来词、数字、括号注解）就退回整串，",
    "   * 至少保证按全拼检索还可用。",
    "   */",
    "  function splitPinyin(py, zh) {",
    "    var raw = norm(py || \"\");",
    "    if (!raw) return [];",
    "    if (/\\s/.test(raw)) {",
    "      /* 已分音节：把每一段再按字数拆开（数据里偶有 \"xuexi\" 挤成一段的情况） */",
    "      var parts = raw.split(/\\s+/).filter(Boolean), flat = [];",
    "      parts.forEach(function (p) {",
    "        if (PY_SET[p] || !/^[a-z]+$/.test(p)) { flat.push(p); return; }",
    "        var sub = segmentSyllables(p, p.length > 1 ? 2 : 1) || segmentSyllables(p, 3) || null;",
    "        if (sub) flat = flat.concat(sub); else flat.push(p);",
    "      });",
    "      return flat;",
    "    }",
    "    var s = raw.replace(/[^a-z0-9]/g, \"\");",
    "    if (!s) return [];",
    "    if (/[^a-z]/.test(s)) return [s];                 /* 含数字，如 l1l2zhengzehua */",
    "    var want = cjkCount(zh);",
    "    var seg = want ? segmentSyllables(s, want) : null;",
    "    if (seg) return seg;",
    "    for (var k = 2; k <= 8; k++) {                    /* 字数对不上时再试邻近段数 */",
    "      seg = segmentSyllables(s, k);",
    "      if (seg) return seg;",
    "    }",
    "    return [s];",
    "  }",
    "",
    ""
  ].join("\n");

  var next = src.slice(0, a) + REPL + src.slice(b);
  /* ensureInitials 需要把 zh 传给 splitPinyin */
  next = next.replace("var sil = splitPinyin(t.pinyin);", "var sil = splitPinyin(t.pinyin, t.zh);");
  fs.writeFileSync(ENG, next);
  console.log("已重写 assets/engine.js 的拼音切分（音节表 " + SYLLABLES.length + " 个，DP 定长切分）");
  process.exit(0);
}

/* ---------------- 校验现有数据 ----------------
 * 判定口径与引擎一致，并跳过三类「拼音本来就只覆盖名字一部分」的合法情形：
 *   带括号注解的名字（（基准）饱和 只给 饱和 注音）
 *   含英文或数字的名字（视觉 Transformer、L1/L2 正则化、Top-K 采样）
 * 剩下的条目必须满足：音节数 == 汉字数，且每段都是合法音节。
 */

var w = { AI_TERMS: undefined };
global.window = w;
var files = fs.readdirSync(path.join(ROOT, "data")).filter(function (f) { return /^data-[a-z]+\.js$/.test(f); }).sort();
files.forEach(function (f) { require(path.join(ROOT, "data", f)); });
var TERMS = w.AI_TERMS || [];

/** 名字里应当被注音的汉字数：去掉括号内的注解 */
function nameChars(zh) {
  var bare = String(zh).replace(/[（(][^）)]*[)）]/g, "");
  return cjk(bare);
}
/** 名字里混了英文或数字，拼音往往只覆盖中文部分，不作字数校验 */
function mixedName(zh) {
  var bare = String(zh).replace(/[（(][^）)]*[)）]/g, "");
  return /[A-Za-z0-9]/.test(bare);
}

var spacedBad = [], unspaced = [], noPy = [], skipped = 0;
TERMS.forEach(function (t) {
  var chars = nameChars(t.zh);
  if (!t.pinyin) { if (chars) noPy.push(t.id + " " + t.zh); return; }
  if (mixedName(t.zh)) { skipped++; return; }
  if (/\s/.test(t.pinyin)) {
    var parts = t.pinyin.trim().split(/\s+/).filter(Boolean);
    if (chars && parts.length !== chars) {
      spacedBad.push(t.id + " " + t.zh + "  " + chars + " 字 / " + parts.length + " 音节 [" + parts.join("-") + "]");
    }
    parts.forEach(function (p, i) {
      if (/^[a-z]+$/.test(p) && p.length > 1 && SYLLABLES.indexOf(p) < 0) {
        spacedBad.push(t.id + " 第" + (i + 1) + "段 \"" + p + "\" 不是合法音节（" + t.zh + "）");
      }
    });
    return;
  }
  unspaced.push(t);
});

var unspacedFail = [], unspacedOk = 0;
unspaced.forEach(function (t) {
  var chars = nameChars(t.zh);
  var clean = String(t.pinyin).toLowerCase().replace(/[^a-z]/g, "");
  var r = chars ? segment(clean, chars) : null;
  if (!r) {
    var anySeg = null;
    for (var k = 1; k <= 8 && !anySeg; k++) anySeg = segment(clean, k);
    unspacedFail.push(t.id + " " + t.zh + "  pinyin=" + t.pinyin + "  应注汉字=" + chars +
                      (anySeg ? "  实际可切成 " + anySeg.length + " 段[" + anySeg.join("-") + "]" : "  完全切不开"));
  } else unspacedOk++;
});

console.log("音节表: " + SYLLABLES.length + " 个音节（声母×韵母生成）");
console.log("条目: " + TERMS.length + "   连写拼音: " + unspaced.length +
            "   跳过（名字含英文或数字）: " + skipped);
console.log("\n连写拼音按汉字数可完美切分: " + unspacedOk + " / " + unspaced.length);
if (unspacedFail.length) {
  console.log("\n✗ 切分与字数对不上: " + unspacedFail.length);
  unspacedFail.forEach(function (x) { console.log("  · " + x); });
}
if (spacedBad.length) {
  console.log("\n✗ 分音节写法的拼音有问题: " + spacedBad.length);
  spacedBad.forEach(function (x) { console.log("  · " + x); });
}
if (noPy.length) {
  console.log("\n! 中文名却没有 pinyin 字段: " + noPy.length);
  noPy.forEach(function (x) { console.log("  · " + x); });
}
var bad = unspacedFail.length + spacedBad.length;
console.log("\n结论: " + (bad ? "存在 " + bad + " 处待修" : "✓ 全部拼音可正确切分"));
process.exit(bad ? 1 : 0);
