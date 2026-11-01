/*
 * 散文质量检查：针对 def / long / plain 三个字段，检查
 *   1) plain 是否存在、长度是否合适
 *   2) 是否引入了原条目没有的具体事实（年份、百分比、倍数等）—— 防编造
 *   3) 是否有可机器识别的 AI 味模式（按 humanizer-zh 的清单，本站约定除外）
 *   4) 句子是否过长、是否有层叠的「的」
 *
 * 用法：
 *   node tools/lint-prose.js                 检查全部 data-<cat>.js
 *   node tools/lint-prose.js data-nlp.js     只检查某个文件
 *   node tools/lint-prose.js --missing       只列出还没写 plain 的条目
 *
 * 退出码：有硬违规时为 1。
 */
"use strict";
var fs = require("fs");
var os = require("os");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var DATA = path.join(ROOT, "data");

var CATS = ["math", "ml", "dl", "nlp", "training", "inference",
            "multimodal", "agent", "safety", "infra", "frontier"];

var args = process.argv.slice(2);
var onlyMissing = args.indexOf("--missing") >= 0;
var STRICT = args.indexOf("--strict") >= 0;      /* 每条都必须有 plain */
var CALIBRATE = args.indexOf("--calibrate") >= 0; /* 拿现有 long 试跑模式，校准阈值 */
var files = args.filter(function (a) { return /\.js$/.test(a); })
  /* 允许写成 data-nlp.js 或 data/data-nlp.js，统一成裸文件名再拼 DATA */
  .map(function (a) { return a.replace(/^.*[\/\\]/, ""); });
if (!files.length) files = CATS.map(function (c) { return "data-" + c + ".js"; })
  .filter(function (f) { return fs.existsSync(path.join(DATA, f)); });

function load(file) {
  var tmp = path.join(os.tmpdir(), "lint-" + file.replace(/[^a-z0-9.]/gi, "_"));
  fs.writeFileSync(tmp, fs.readFileSync(path.join(DATA, file), "utf8"));
  var w = { AI_TERMS: undefined };
  global.window = w;
  delete require.cache[require.resolve(tmp)];
  require(tmp);
  fs.unlinkSync(tmp);
  return w.AI_TERMS || [];
}

/* ---------- plain 长度 ---------- */
var PLAIN_MIN = 150, PLAIN_MAX = 420;

/* ---------- 具体事实：plain 里出现的数字串必须来自 def/long ---------- */
function numbersIn(s) {
  var out = [];
  (s.match(/\d+(?:\.\d+)?/g) || []).forEach(function (n) { out.push(n); });
  return out;
}

/* ---------- AI 味模式（上限，不是黑名单；命中过多才报） ---------- */
var CAPS = [
  { name: "破折号 ——", re: /——/g, max: 1, why: "humanizer §8：破折号当万能连接" },
  { name: "文言连接词（因此/从而/故而/因而）", re: /(因此|从而|故而|因而)/g, max: 1, why: "默认用书面连接词，读起来像论文摘要" },
  { name: "不是…而是…", re: /不是[^，。；]{1,20}而(是|非)/g, max: 1, why: "humanizer §1：假对比抬语气" },
  { name: "代价是", re: /代价是/g, max: 1, why: "同一个转折句式反复使用" },
  { name: "本质是/本质上", re: /本质(上)?是/g, max: 1, why: "同上" },
  { name: "拔高词（标志着/彰显/赋能/无缝/闭环/旨在）", re: /(标志着|彰显|赋能|无缝|闭环|旨在)/g, max: 0, why: "humanizer §13/§12：意义拔高与 AI 高频词" },
  { name: "免责式提示（值得注意的是/需要注意的是）", re: /(值得注意的是|需要注意的是|不难发现|众所周知)/g, max: 0, why: "humanizer §4：起跑式铺垫" },
  { name: "随着…式开头", re: /^\s*(随着|在当今|在[^，。]{0,10}的时代)/, max: 0, why: "humanizer §30" },
  { name: "层叠的「的」（≥3 连）", re: /的[^，。、；：]{0,6}的[^，。、；：]{0,6}的/g, max: 0, why: "humanizer §26：长定语难读" },
  { name: "套话收尾（总而言之/综上/让我们）", re: /(总而言之|综上所述|让我们|拭目以待)/g, max: 0, why: "humanizer §31" }
];

/* 「」是本站既定约定（见 README 与参考术语表），不计入 AI 味 */

function sentences(s) {
  return s.split(/[。！？；]/).map(function (x) { return x.trim(); }).filter(Boolean);
}

/**
 * 字符二元组重合度（Dice 系数），用来判断 plain 是否只是 long 的换皮。
 * 返回 0~1。两段完全相同为 1，毫无重叠为 0。
 */
function bigramSim(a, b) {
  function grams(s) {
    var t = String(s).replace(/[\s，。、；：！？「」『』（）()《》"'’“”\-—·]/g, "");
    var g = {};
    for (var i = 0; i + 1 < t.length; i++) g[t.substr(i, 2)] = 1;
    return g;
  }
  var x = grams(a), y = grams(b);
  var kx = Object.keys(x).length, ky = Object.keys(y).length;
  if (!kx || !ky) return 0;
  var shared = 0;
  Object.keys(x).forEach(function (k) { if (y[k]) shared++; });
  return (2 * shared) / (kx + ky);
}

var report = [];
var hard = 0, soft = 0, missing = [];

files.forEach(function (f) {
  var terms = load(f);
  terms.forEach(function (t) {
    var row = { file: f, id: t.id, zh: t.zh, errs: [], warns: [] };

    if (!t.plain || !String(t.plain).trim()) {
      missing.push(f + " :: " + t.id + " (" + t.zh + ")");
      report.push(row);
      return;
    }
    var p = String(t.plain);
    var len = p.replace(/\s/g, "").length;

    /* 硬：长度 */
    if (len < PLAIN_MIN) row.errs.push("plain 太短：" + len + " 字（要求 ≥ " + PLAIN_MIN + "）");
    if (len > PLAIN_MAX) row.errs.push("plain 太长：" + len + " 字（要求 ≤ " + PLAIN_MAX + "）");

    /* 硬：不得引入原条目没有的具体事实 */
    var allowed = numbersIn(t.def || "").concat(numbersIn(t.long || ""));
    numbersIn(p).forEach(function (n) {
      if (allowed.indexOf(n) < 0) row.errs.push("plain 出现原文没有的数字「" + n + "」——疑似编造事实");
    });
    var yearInPlain = /19\d{2}|20\d{2}\s*年/.exec(p);
    if (yearInPlain && !/19\d{2}|20\d{2}\s*年/.test((t.def || "") + (t.long || ""))) {
      row.errs.push("plain 引入原文没有的年份「" + yearInPlain[0] + "」");
    }
    var paper = /《[^》]{2,30}》/.exec(p);
    if (paper && !new RegExp(paper[0]).test((t.def || "") + (t.long || ""))) {
      row.errs.push("plain 引入原文没有的作品名「" + paper[0] + "」");
    }

    /* 中文数量表达同样可能夹带编造事实，但它绝大多数出现在假想场景里
       （「一个班几十号学生」「只改几十份卷子」），那是类比的道具而不是对
       技术的断言，正则区分不了。所以只记为建议，由人复核；ASCII 数字、
       年份、书名仍按硬性处理，那三类几乎总是真实世界的事实。 */
    var src = (t.def || "") + (t.long || "");
    var CN_QTY = /(百分之[一二三四五六七八九十百千]+|[一二三四五六七八九十两]\s*倍|上[百千万]|几十|[一二三四五六七八九十]\s*(个月|周|天|秒|毫秒|亿|万亿))/g;
    var cq = p.match(CN_QTY) || [];
    cq.forEach(function (x) {
      if (src.indexOf(x) < 0) row.warns.push("数量说法「" + x + "」原文没有，请确认它只是类比里的假设而非事实断言");
    });

    /* 硬：不能用别的术语解释，除非当场说明 */
    if (/^(该|这|此|其)\s*(词|概念|术语|技术|模型|方法)/.test(p)) {
      row.errs.push("plain 以指代开头（" + p.slice(0, 8) + "…），脱离上下文读不通");
    }

    /* 硬：plain 不能只是把 long 换个说法抄一遍 */
    var sim = bigramSim(p, String(t.long || ""));
    if (sim > 0.72) {
      row.errs.push("plain 与 long 高度重合（" + Math.round(sim * 100) + "%），等于没写白话版");
    }

    /* 类比检测：标记词能覆盖大多数，但真正好的白话常常不带标记词
       （例如整段用「实习生打草稿、老板核对」来比方投机解码）。
       所以命中不了只记为建议，交给人复核；把它当硬性失败会逼人塞假「就像」。 */
    var ANALOGY = /(就像|就像是|就像|好比|比如|例如|打个比方|想象|设想|相当于|可以这样理解|换个说法|通俗说|简单说|日常|平时|生活中|如同|仿佛|宛如|好像|像是|像[^，。]{1,14}[：:，]|一样|似的|当成|当作|等于|拿[^，。]{1,8}来[比打作]|借用|不是一回事)/;
    if (!ANALOGY.test(p)) {
      row.warns.push("没找到类比标记词，请人工确认这段是否真的讲给零基础读");
    }

    /* 软：白话版应当比 long 少依赖英文术语 */
    var enRatio = (p.match(/[A-Za-z]/g) || []).length / Math.max(1, len);
    var longClean = String(t.long || "").replace(/\s/g, "");
    var enRatioLong = (longClean.match(/[A-Za-z]/g) || []).length / Math.max(1, longClean.length);
    if (enRatio > 0.18) row.warns.push("英文字符占比 " + Math.round(enRatio * 100) + "%，术语味偏重");
    if (enRatio > enRatioLong) {
      row.warns.push("比 long 更依赖英文（" + Math.round(enRatio * 100) + "% vs " +
                     Math.round(enRatioLong * 100) + "%），白话版应当更少而不是更多");
    }

    /* 软：句长 */
    var ss = sentences(p);
    var longest = ss.reduce(function (a, x) { return Math.max(a, x.length); }, 0);
    var avg = ss.length ? Math.round(p.length / ss.length) : 0;
    /* plain 面向零基础，句子要比 long（实测最长句 p50=52）明显更短 */
    if (longest > 60) row.warns.push("最长句 " + longest + " 字，零基础读者容易跟丢");
    if (avg > 42) row.warns.push("平均句长 " + avg + " 字，偏长");

    /* 软：AI 味上限 */
    CAPS.forEach(function (c) {
      var n = (p.match(c.re) || []).length;
      if (n > c.max) row.warns.push(c.name + " 命中 " + n + " 次（上限 " + c.max + "）：" + c.why);
    });

    if (row.errs.length) hard += row.errs.length;
    if (row.warns.length) soft += row.warns.length;
    report.push(row);
  });
});

/* ---------- 校准模式：拿现有 long 试跑，看阈值是否合理 ---------- */
if (CALIBRATE) {
  var tally = {}, n = 0, longLens = [], longSent = [];
  files.forEach(function (f) {
    load(f).forEach(function (t) {
      var s = String(t.long || "");
      if (!s) return;
      n++;
      longLens.push(s.replace(/\s/g, "").length);
      var ss = sentences(s);
      longSent.push(ss.reduce(function (a, x) { return Math.max(a, x.length); }, 0));
      CAPS.forEach(function (c) {
        var hits = (s.match(c.re) || []).length;
        tally[c.name] = tally[c.name] || { entries: 0, hits: 0 };
        if (hits) tally[c.name].entries++;
        tally[c.name].hits += hits;
      });
    });
  });
  function pct(list, q) {
    var a = list.slice().sort(function (x, y) { return x - y; });
    return a[Math.min(a.length - 1, Math.floor(a.length * q))];
  }
  console.log("以现有 long 字段校准（" + n + " 条）\n");
  console.log("长度  p50=" + pct(longLens, .5) + " p90=" + pct(longLens, .9) + " max=" + pct(longLens, 1));
  console.log("最长句 p50=" + pct(longSent, .5) + " p90=" + pct(longSent, .9) + " max=" + pct(longSent, 1));
  console.log("\n模式命中率（按条目计）：");
  Object.keys(tally).forEach(function (k) {
    var v = tally[k];
    console.log("  " + k.padEnd(34) + (100 * v.entries / n).toFixed(0).padStart(3) + "% 的条目命中，共 " + v.hits + " 处");
  });
  process.exit(0);
}

/* ---------- 输出 ---------- */
if (onlyMissing) {
  console.log("尚未写 plain 的条目：" + missing.length);
  missing.forEach(function (m) { console.log("  · " + m); });
  process.exit(0);
}

var bad = report.filter(function (r) { return r.errs.length; });
var warn = report.filter(function (r) { return !r.errs.length && r.warns.length; });

console.log("检查文件：" + files.join(", "));
console.log("条目总数：" + report.length);
console.log("已写 plain：" + (report.length - missing.length) + "   待写：" + missing.length);
console.log("");

if (bad.length) {
  console.log("✗ 硬性违规 " + bad.length + " 条：");
  bad.forEach(function (r) {
    console.log("  " + r.file + " :: " + r.id + "（" + r.zh + "）");
    r.errs.forEach(function (e) { console.log("      - " + e); });
  });
  console.log("");
}
if (warn.length) {
  console.log("! 建议改进 " + warn.length + " 条（不阻塞）：");
  warn.slice(0, 40).forEach(function (r) {
    console.log("  " + r.id + "（" + r.zh + "）");
    r.warns.forEach(function (w) { console.log("      · " + w); });
  });
  if (warn.length > 40) console.log("  …另有 " + (warn.length - 40) + " 条");
  console.log("");
}
if (missing.length) {
  console.log((STRICT ? "✗ " : "… ") + "还没写 plain 的条目 " + missing.length + " 条（前 20）：");
  missing.slice(0, 20).forEach(function (m) { console.log("  · " + m); });
  console.log("");
}

/* strict 模式下「缺 plain」本身就是失败，否则门禁形同虚设 */
if (STRICT && missing.length) hard += missing.length;

console.log("=".repeat(52));
console.log("硬违规 " + hard + " 处，建议 " + soft + " 处，待写 plain " + missing.length + " 条");
console.log(STRICT ? "（strict：缺 plain 计为失败）" : "（加 --strict 可把缺 plain 视为失败）");
process.exit(hard ? 1 : 0);
