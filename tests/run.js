/*
 * 检索内核与数据完整性测试
 * 运行：node tests/run.js        （不需要浏览器，也不需要任何依赖）
 *
 * 做法：造一个最小的 window 环境，用 vm 直接跑 data/*.js 与 assets/engine.js，
 *       这样既能验证真实数据，也能验证 file:// 场景下用到的全局挂载方式。
 */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..");

var pass = 0, fail = 0, failures = [];

function ok(cond, label) {
  if (cond) { pass++; console.log("  ✓ " + label); }
  else { fail++; failures.push(label); console.log("  ✗ " + label); }
}
function section(name) { console.log("\n" + name); }

/* ---------------- 构造浏览器替身 ---------------- */
var win = {};
win.window = win;
win.localStorage = {
  _d: {},
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
  setItem: function (k, v) { this._d[k] = String(v); }
};
win.matchMedia = function () { return { matches: false }; };
win.location = { search: "", hash: "", href: "file:///index.html" };
win.history = { replaceState: function () {} };
win.URL = URL;
win.setTimeout = setTimeout;
win.clearTimeout = clearTimeout;

function load(rel) {
  var file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { console.error("缺少文件: " + rel); process.exit(2); }
  vm.runInNewContext(fs.readFileSync(file, "utf8"), {
    window: win, document: undefined, globalThis: win, console: console,
    URL: URL, setTimeout: setTimeout, clearTimeout: clearTimeout
  }, { filename: file });
}

var dataFiles = fs.readdirSync(path.join(ROOT, "data"))
  .filter(function (f) { return /^data-.*\.js$/.test(f); })
  .sort();

section("数据加载");
console.log("  分片: " + dataFiles.join(", "));
load("assets/engine.js");
dataFiles.forEach(function (f) { load("data/" + f); });

var AI = win.AIGlossary;
ok(!!AI, "engine.js 暴露了 window.AIGlossary");
AI.reindex();
var TERMS = AI.terms();
console.log("  词条总数: " + TERMS.length + "（去重后）");

/* ---------------- 数据校验 ---------------- */
section("数据完整性");
var REQUIRED = ["id", "en", "zh", "cat", "level", "def", "long"];
var CATS = Object.keys(AI.CATEGORIES);
var LEVELS = Object.keys(AI.LEVELS);
var ids = {}, badFields = [], badCat = [], badLevel = [], dup = [], noAka = 0, noRelated = 0;
var shortDef = [], missingPy1 = [];

/* 参考术语表的「一句话释义」刻意保持极简，所以只要求不低于 8 字 */
var MIN_DEF = 8;

TERMS.forEach(function (t) {
  if (ids[t.id]) dup.push(t.id);
  ids[t.id] = 1;

  REQUIRED.forEach(function (k) {
    if (typeof t[k] !== "string" || !t[k].trim()) badFields.push(t.id + "." + k);
  });
  if (CATS.indexOf(t.cat) < 0) badCat.push(t.id + ":" + t.cat);
  if (LEVELS.indexOf(t.level) < 0) badLevel.push(t.id + ":" + t.level);
  if (!Array.isArray(t.aka)) noAka++;
  if (!Array.isArray(t.related)) noRelated++;
  if (t.def && t.def.length < MIN_DEF) shortDef.push(t.id + "(" + t.def.length + ")");
  if (!t.long || t.long.length < 40) shortDef.push(t.id + ".long(" + ((t.long || "").length) + ")");
  /* 有中文名（含 CJK）的条目应当有拼音 */
  if (/[\u3400-\u9fff]/.test(t.zh) && !t.pinyin) missingPy1.push(t.zh);
});

ok(dup.length === 0, "id 全局唯一" + (dup.length ? " — 重复: " + dup.join(", ") : ""));
ok(badFields.length === 0, "必填字段齐全" + (badFields.length ? " — 缺失: " + badFields.slice(0, 8).join(", ") : ""));
ok(badCat.length === 0, "cat 取值合法" + (badCat.length ? " — " + badCat.slice(0, 6).join(", ") : ""));
ok(badLevel.length === 0, "level 取值合法" + (badLevel.length ? " — " + badLevel.slice(0, 6).join(", ") : ""));
ok(shortDef.length === 0, "释义长度合理" + (shortDef.length ? " — " + shortDef.join(", ") : ""));
ok(missingPy1.length === 0, "中文条目都有拼音" + (missingPy1.length ? " — " + missingPy1.slice(0, 10).join(", ") : ""));

/* related 悬空引用：允许（跨分片可能未加载），只统计并提示 */
var dangling = [];
TERMS.forEach(function (t) {
  (t.related || []).forEach(function (r) { if (!AI.get(r)) dangling.push(t.id + "→" + r); });
});
console.log("  提示: 悬空的 related 引用 " + dangling.length + " 个" +
  (dangling.length ? "（详情页会自动过滤）：" + dangling.slice(0, 10).join(", ") : ""));

/* ---------------- 参考译名表覆盖 ---------------- */
section("参考术语表覆盖（docs/glossary.md 的 55 条）");
var REF = [
  "token", "embedding", "surprise", "kl-divergence", "parameter", "weight", "loss",
  "cross-entropy", "perplexity", "gradient", "learning-rate", "backpropagation",
  "activation-function", "receptive-field", "attention", "qkv", "permutation-equivariant",
  "ffn", "batchnorm", "pre-ln-post-ln", "positional-encoding", "rope", "residual-connection",
  "layernorm", "pretraining", "scaling-law", "emergent-ability", "fine-tuning", "alignment",
  "calibration", "rlhf", "reward-model", "hallucination", "temperature", "logit", "sampling",
  "top-p", "context-window", "kv-cache", "inference", "multimodal", "clip", "patch", "infonce",
  "zero-shot", "vector-quantization", "agent", "tool-use", "rag", "benchmark", "saturation",
  "jailbreak", "prompt-injection", "red-teaming", "scalable-oversight"
];
var missingRef = REF.filter(function (id) { return !AI.get(id); });
ok(missingRef.length === 0,
   "全部 " + REF.length + " 条参考术语都已收录" + (missingRef.length ? " — 缺: " + missingRef.join(", ") : ""));

/* 译名一致性抽查（与参考表给定的统一译名对照） */
var NAME_CHECK = {
  token: "词元", embedding: "嵌入", surprise: "惊讶度", "kl-divergence": "KL 散度",
  parameter: "参数", weight: "权重", loss: "损失", "cross-entropy": "交叉熵",
  perplexity: "困惑度", gradient: "梯度", "learning-rate": "学习率",
  backpropagation: "反向传播", "activation-function": "激活函数",
  "receptive-field": "感受野", attention: "注意力",
  "permutation-equivariant": "排列等变", ffn: "前馈网络", batchnorm: "批归一化",
  layernorm: "层归一化", "positional-encoding": "位置编码", rope: "旋转位置编码",
  "residual-connection": "残差连接", pretraining: "预训练", "scaling-law": "规模定律",
  "emergent-ability": "涌现能力", "fine-tuning": "微调", alignment: "对齐",
  calibration: "校准", "reward-model": "奖励模型", hallucination: "幻觉",
  temperature: "温度", sampling: "采样", "top-p": "核采样",
  "context-window": "上下文窗口", "kv-cache": "键值缓存", inference: "推理",
  multimodal: "多模态", clip: "图文对比模型", patch: "图像块",
  "zero-shot": "零样本分类", "vector-quantization": "向量量化", agent: "智能体",
  "tool-use": "工具调用", rag: "检索增强生成", benchmark: "基准测试",
  jailbreak: "越狱", "prompt-injection": "提示注入", "red-teaming": "红队测试",
  "scalable-oversight": "可扩展监督",
  /* 补齐余下 6 条，使 55 条参考译名全部有断言覆盖 */
  qkv: "查询 / 键 / 值", "pre-ln-post-ln": "前接式 / 后接式",
  rlhf: "基于人类反馈的强化学习", logit: "未归一化得分",
  infonce: "InfoNCE", saturation: "（基准）饱和"
};
var nameBad = Object.keys(NAME_CHECK).filter(function (id) {
  var t = AI.get(id);
  return t && t.zh !== NAME_CHECK[id];
});
ok(nameBad.length === 0, "统一译名与参考表一致" +
  (nameBad.length ? " — 不符: " + nameBad.map(function (i) { return i + "=" + (AI.get(i) || {}).zh; }).join(", ") : ""));
ok(Object.keys(NAME_CHECK).length === REF.length,
   "55 条参考术语逐条都有译名断言（实为 " + Object.keys(NAME_CHECK).length + "）");

/* ---------------- 搜索排序 ---------------- */
section("搜索：中文 / 英文 / 拼音 / 首字母");

function top(q, n) {
  var r = AI.search(q);
  return r.slice(0, n || 3).map(function (x) { return x.term.id; });
}
function expectTop(q, id) {
  var r = AI.search(q, { limit: 1 });
  ok(r.length > 0 && r[0].term.id === id,
     "搜索「" + q + "」首位 = " + id + (r.length ? "" : "（无结果）") +
     (r.length ? "  实得: " + r[0].term.id + " [" + r[0].score + "]" : ""));
}

expectTop("注意力", "attention");
expectTop("attention", "attention");
expectTop("词元", "token");
expectTop("token", "token");
expectTop("qianru", "embedding");
expectTop("qr", "embedding");
expectTop("huanjue", "hallucination");
expectTop("困惑度", "perplexity");
expectTop("反向传播", "backpropagation");
expectTop("规模定律", "scaling-law");
expectTop("检索增强生成", "rag");
expectTop("rag", "rag");
expectTop("RLHF", "rlhf");
expectTop("键值缓存", "kv-cache");
expectTop("旋转位置编码", "rope");

section("搜索：释义内文命中");
ok(top("多付").length > 0, "搜「多付」（KL 散度释义用词）有结果 → " + top("多付", 3).join(", "));
ok(top("省算力").length > 0, "搜「省算力」（键值缓存说明用词）有结果 → " + top("省算力", 3).join(", "));
ok(top("码长").length > 0, "搜「码长」（信息论用词）有结果 → " + top("码长", 3).join(", "));

section("搜索：排序合理性");
var rZh = AI.search("嵌入");
ok(rZh[0] && rZh[0].term.id === "embedding", "「嵌入」首位是 embedding");
ok(rZh.length > 1, "「嵌入」有多个相关结果（" + rZh.length + " 条）");
ok(rZh[0].relevance === 100, "首位相关度归一化为 100");
var desc = rZh.every(function (x, i) { return i === 0 || rZh[i - 1].score >= x.score; });
ok(desc, "结果严格按分数降序");

var multi = AI.search("语言模型");
ok(multi.length > 0 && multi[0].term.id === "language-model",
   "多词查询「语言模型」首位 = language-model（实得 " + ((multi[0] || {}).term || {}).id + "）");

/* 长中文查询里的滑窗词不应造成惩罚 */
["注意力机制", "上下文窗口", "基于人类反馈的强化学习", "旋转位置编码", "检索增强生成"].forEach(function (q) {
  var r = AI.search(q, { limit: 1 });
  ok(r.length > 0 && [ "attention", "context-window", "rlhf", "rope", "rag" ].indexOf(r[0].term.id) >= 0,
     "长中文名「" + q + "」首位正确（实得 " + ((r[0] || {}).term || {}).id + "）");
});

expectTop("Transformer", "transformer");
expectTop("transformer", "transformer");
expectTop("注意力机制", "attention");
expectTop("过拟合", "overfitting");
expectTop("top-k", "top-k");
expectTop("显存带宽", "memory-bandwidth");
expectTop("数据污染", "contamination");

var nope = AI.search("zzzqqqxx");
ok(nope.length === 0, "无关字符串返回空结果");

var catFilter = AI.search("注意力", { cat: "safety" });
ok(catFilter.every(function (x) { return x.term.cat === "safety"; }), "分类过滤生效（safety 内搜「注意力」）");

section("搜索：容错");
/* 只对「确实存在」的条目做拼写容错断言，避免因数据分片未加载而误报 */
var fuzzyTargets = AI.terms().filter(function (t) { return /^[a-z][a-z\-]+$/i.test(t.en); });
if (fuzzyTargets.length) {
  var cand = fuzzyTargets.map(function (t) {
    var e = t.en.toLowerCase().replace(/[^a-z]/g, "");
    return e.length > 4 ? { id: t.id, typo: e.slice(0, 2) + e.slice(3) } : null;   /* 删掉第 3 个字符 */
  }).filter(Boolean);
  var hit = 0, tried = 0, sample = [];
  cand.slice(0, 40).forEach(function (c) {
    tried++;
    var r = AI.search(c.typo, { limit: 1 });
    if (r.length && r[0].term.id === c.id) hit++;
    else sample.push(c.typo + "→" + ((r[0] || {}).term || {}).id);
  });
  ok(tried > 0 && hit / tried >= 0.6,
     "拼写容错命中率 ≥ 60%：" + hit + "/" + tried + (sample.length ? "  未命中样例 " + sample.slice(0, 5).join(", ") : ""));
} else {
  console.log("  (跳过：数据中暂无纯英文条目)");
}

/* 多词查询：未命中的词应当压低总分 */
var twoWord = AI.search("注意力 不存在的词zzz");
ok(twoWord.every(function (x) { return x.score < AI.search("注意力", { limit: 1 })[0].score; }),
   "含未命中词的多词查询整体分数被折减");

section("拼音：音节切分与首字母自洽");

function splitRef(py) {
  var raw = AI.norm(py || "");
  if (!raw) return [];
  if (/\s/.test(raw)) return raw.split(/\s+/).filter(Boolean);
  return null;  /* 连写的交给引擎，只验证自洽性 */
}

var pyIssues = [], homographs = [];
TERMS.forEach(function (t) {
  if (!t.pinyin) return;
  /* 1) pyFull 必须由 pinyin 去空格得到 */
  if (t.pyFull !== AI.tight(t.pinyin)) pyIssues.push(t.id + " pyFull≠pinyin: " + t.pyFull);
  /* 2) 全拼必须能搜回自己 */
  var r = AI.search(t.pyFull, { limit: 1 });
  if (!r.length || r[0].term.id !== t.id) pyIssues.push(t.id + " 全拼 " + t.pyFull + " → " + ((r[0] || {}).term || {}).id);
  /* 3) 若数据本身已按音节写好，首字母串必须能搜回自己
        （同名首字母是允许的：词元 / 采样 都是 cy，此时只要出现在并列首位即可） */
  var ref = splitRef(t.pinyin);
  if (ref && ref.length > 1) {
    var want = ref.map(function (s) { return s[0]; }).join("");
    if (t.py1 !== want) pyIssues.push(t.id + " py1 应为 " + want + " 实为 " + t.py1);
    var r2 = AI.search(t.py1, { limit: 4 });
    var tied = r2.length && r2[0].term.id === t.id;
    if (!tied && r2.length) {
      /* 允许与首位同分的同名 */
      tied = r2.some(function (x) { return x.term.id === t.id && x.score === r2[0].score; });
      if (tied) homographs.push(t.id + "(" + t.py1 + ")");
    }
    if (!tied) pyIssues.push(t.id + " 首字母 " + t.py1 + " → " + ((r2[0] || {}).term || {}).id);
  }
});
ok(pyIssues.length === 0, "拼音全拼/首字母自洽（共 " + TERMS.filter(function (t) { return t.pinyin; }).length + " 条有拼音）");
if (pyIssues.length) pyIssues.slice(0, 15).forEach(function (m) { console.log("      · " + m); });
console.log("  提示: 首字母同名（并列显示）" + homographs.length + " 处" +
  (homographs.length ? "：" + homographs.join(", ") : ""));

/* 定向断言：首字母检索 */
[["jzhc", "kv-cache"], ["zyl", "attention"], ["khd", "perplexity"], ["xxl", "learning-rate"],
 ["fxcb", "backpropagation"], ["gjdy", "tool-use"], ["jszqsc", "rag"], ["wzbm", "positional-encoding"],
 ["xllh", "vector-quantization"], ["cy", "sampling"]].forEach(function (p) {
  var r = AI.search(p[0], { limit: 1 });
  ok(r.length && r[0].term.id === p[1], "首字母「" + p[0] + "」→ " + p[1] + "（实得 " + ((r[0] || {}).term || {}).id + "）");
});

section("拼音不变式：音节数必须等于汉字数");
/*
 * 这条检查补上一个真实教训：引擎的音节表曾漏掉 ci / lei / lin / kui，
 * 且切分用的是「最长匹配优先」，会把 rengong 切成 reng+o+… 而整条失败，
 * 失败后静默退回整串。退回值仍然「自洽」（py1 由同一个错误结果导出），
 * 所以上面那套自洽测试全绿，首字母检索却已经大面积失效。
 * 能抓住它的只有一个外部事实：名字里有几个汉字，就该有几个音节。
 */
function isCjkCode(c) { return (c >= 0x3400 && c <= 0x4DBF) || (c >= 0x4E00 && c <= 0x9FFF); }
function nameChars(s) {
  var bare = String(s || "").replace(/[（(][^）)]*[)）]/g, "");   /* 括号注解不注音 */
  var n = 0;
  for (var i = 0; i < bare.length; i++) { if (isCjkCode(bare.charCodeAt(i))) n++; }
  return n;
}
function mixedName(s) {
  var bare = String(s || "").replace(/[（(][^）)]*[)）]/g, "");
  return /[A-Za-z0-9]/.test(bare);      /* 中英混排的名字，拼音只覆盖中文部分 */
}

var invBad = [], invChecked = 0;
TERMS.forEach(function (t) {
  if (!t.pinyin) return;
  var n = nameChars(t.zh);
  if (!n || mixedName(t.zh)) return;
  invChecked++;
  /* 核心不变式：py1 每个音节贡献一个首字母，所以它的长度必须等于汉字数。
     切分失败时引擎退回整串，py1 长度会变成 1，正好被这条抓住。 */
  if (t.py1.length !== n) {
    invBad.push(t.id + " " + t.zh + "：py1=\"" + t.py1 + "\" 长 " + t.py1.length +
                " ≠ " + n + " 字（拼音 \"" + t.pinyin + "\" 切分失败？）");
  }
  /* 数据里已按空格分好音节的，段数也必须等于汉字数 */
  if (/\s/.test(t.pinyin)) {
    var sil = String(t.pinyin).trim().split(/\s+/).filter(Boolean);
    if (sil.length !== n) {
      invBad.push(t.id + " " + t.zh + "：" + n + " 个汉字却写了 " + sil.length + " 段 [" + sil.join("-") + "]");
    }
  }
});
ok(invBad.length === 0, "已校验 " + invChecked + " 条：音节数与首字母长度均等于汉字数");
if (invBad.length) invBad.slice(0, 12).forEach(function (m) { console.log("      · " + m); });

/* 首字母检索可达性：允许同名首字母并列，但必须排在前列 */
var unreachable = [];
TERMS.forEach(function (t) {
  if (!t.py1 || t.py1.length < 2 || mixedName(t.zh)) return;
  var r = AI.search(t.py1, { limit: 5 });
  if (!r.some(function (x) { return x.term.id === t.id; })) {
    unreachable.push(t.id + "(" + t.py1 + ") → " + ((r[0] || {}).term || {}).id);
  }
});
ok(unreachable.length === 0,
   "首字母检索可达性：每条都能在自己的首字母结果前 5 名内" +
   (unreachable.length ? " — 不可达 " + unreachable.join(", ") : ""));

section("辅助 API");
ok(AI.esc("<b>&\"x\"</b>").indexOf("&lt;") === 0, "esc() 正确转义 HTML");
var hl = AI.highlight("注意力机制", "注意");
ok(hl.indexOf("<mark>") >= 0, "highlight() 产生 <mark>：" + hl);
var sug = AI.suggestFor(AI.get("attention"), 8);
ok(sug.length > 0, "suggestFor(attention) 给出推荐（" + sug.length + " 条）");
ok(sug.every(function (s) { return s.term.id !== "attention"; }), "推荐里不含自己");
var groups = AI.groupByCategory();
var groupTotal = groups.reduce(function (a, g) { return a + g.items.length; }, 0);
ok(groupTotal === TERMS.length, "groupByCategory 覆盖全部条目（" + groupTotal + "）");

console.log("\n" + "=".repeat(56));
console.log("通过 " + pass + " / " + (pass + fail) + (fail ? "  失败 " + fail : "  全部通过"));
if (fail) {
  console.log("失败项:");
  failures.forEach(function (f) { console.log("  - " + f); });
}
console.log("=".repeat(56));
process.exit(fail ? 1 : 0);
