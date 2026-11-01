/*
 * 比喻域重复检测：把每条 plain 里承担类比的那句话抽出来，归到若干生活场景，
 * 然后报告同一文件内、以及跨文件撞在同一个场景上的条目。
 *
 * 为什么需要它：lint-prose.js 能查句长、字数、编造数字，但查不出
 * 「五条术语都在用厨房打比方」。这种单调是读者真正会感觉到的。
 *
 * 用法：node tools/metaphor-map.js            全部文件
 *       node tools/metaphor-map.js data-infra.js
 */
"use strict";
var fs = require("fs");
var os = require("os");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var DATA = path.join(ROOT, "data");
var CATS = ["math", "ml", "dl", "nlp", "training", "inference",
            "multimodal", "agent", "safety", "infra", "frontier"];

function load(file) {
  var tmp = path.join(os.tmpdir(), "meta-" + file);
  fs.writeFileSync(tmp, fs.readFileSync(path.join(DATA, file), "utf8"));
  var w = { AI_TERMS: undefined };
  global.window = w;
  delete require.cache[require.resolve(tmp)];
  try { require(tmp); } catch (e) { return []; }
  fs.unlinkSync(tmp);
  return w.AI_TERMS || [];
}

/* 生活场景 → 关键词。顺序即优先级，第一个命中的算主域。 */
var DOMAINS = [
  ["厨房/食物",   ["做菜", "炒菜", "食材", "案板", "厨房", "菜谱", "尝味", "盐", "煮", "外卖", "饭", "吃", "厨子", "口味", "饿"]],
  ["考试/上学",   ["考试", "考生", "卷子", "考题", "批改", "老师", "学生", "上课", "复习", "模拟卷", "练习册", "打分", "阅卷", "作业", "班级", "同学", "学校", "照镜子"]],
  ["职场/办公",   ["员工", "入职", "主管", "老板", "实习生", "开会", "同事", "经理", "汇报", "签字", "工位", "秘书", "跑腿"]],
  ["交通/物流",   ["快递", "送货", "堵车", "路况", "车站", "地铁", "电梯", "搬运", "货车", "码头", "航班", "路口", "红绿灯", "导航"]],
  ["建筑/装修",   ["装修", "房子", "交付", "地基", "砌墙", "楼层", "图纸", "工地", "看门", "钥匙", "门锁", "阳台", "保安"]],
  ["医疗",        ["看病", "医生", "诊断", "药", "体检", "护士", "症状", "处方"]],
  ["手工/修理",   ["修电路", "电工", "表笔", "拧螺丝", "缝纫", "针线", "拼图", "组装", "扳手", "尺子", "刻度"]],
  ["体育/游戏",   ["下棋", "球赛", "裁判", "赛跑", "教练", "抽签", "骰子", "扑克", "牌局", "麻将"]],
  ["自然/农事",   ["下雨", "洪水", "堤坝", "浇水", "庄稼", "锄头", "翻地", "种子", "长高", "树", "水果", "苹果", "弹珠"]],
  ["日常家务",    ["收拾屋", "抽屉", "衣柜", "行李箱", "装东西", "打扫", "洗碗", "买菜", "清单", "备忘"]],
  ["阅读/文书",   ["翻书", "查字典", "目录", "纸条", "信封", "写信", "书签", "抄", "草稿", "索引卡", "本子"]],
  ["金融/交易",   ["算账", "记账", "付款", "收费", "汇率", "存钱", "罚款", "成本", "花钱", "买单"]],
  ["通讯/广播",   ["广播", "对讲", "电话", "通知", "喊话", "发信"]],
  ["度量/称重",   ["称", "秤", "量杯", "量身高", "温度计", "秒表"]]
];

/* 类比句：含标记词的那一句 */
var MARK = /(就像|好比|比如|例如|打个比方|想象|设想|相当于|可以这样理解|换个说法|如同|仿佛|好像|像是|像[^，。]{1,14}[：:，]|一样|似的|当成|当作)/;

function analogySentence(plain) {
  var parts = String(plain).split(/[。！？；]/).map(function (s) { return s.trim(); }).filter(Boolean);
  for (var i = 0; i < parts.length; i++) if (MARK.test(parts[i])) return parts[i];
  return null;
}

function domainOf(sent) {
  if (!sent) return null;
  var best = null, bestHits = 0;
  DOMAINS.forEach(function (d) {
    var hits = d[1].filter(function (k) { return sent.indexOf(k) >= 0; });
    if (hits.length > bestHits) { bestHits = hits.length; best = d[0]; }
  });
  return best;
}

var files = process.argv.slice(2);
if (!files.length) files = CATS.map(function (c) { return "data-" + c + ".js"; });

var byFile = {}, globalByDomain = {};
var noAnalogy = [];

files.forEach(function (f) {
  if (f.indexOf("data-") !== 0) f = "data-" + f.replace(/^.*[\/\\]/, "");
  var rows = [];
  load(f).forEach(function (t) {
    if (!t.plain) return;
    var s = analogySentence(t.plain);
    var d = domainOf(s);
    if (!s) { noAnalogy.push(f.replace("data-", "").replace(".js", "") + " :: " + t.id); return; }
    rows.push({ id: t.id, zh: t.zh, domain: d || "未归类", sent: s });
    (globalByDomain[d || "未归类"] = globalByDomain[d || "未归类"] || []).push(f.replace("data-", "").replace(".js", "") + "/" + t.id);
  });
  byFile[f] = rows;
});

console.log("=== 每个文件内部的比喻域分布 ===\n");
Object.keys(byFile).forEach(function (f) {
  var rows = byFile[f];
  if (!rows.length) return;
  var tally = {};
  rows.forEach(function (r) { tally[r.domain] = (tally[r.domain] || 0) + 1; });
  var hot = Object.keys(tally).filter(function (k) { return tally[k] >= 3; });
  var line = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; })
    .map(function (k) { return k + " " + tally[k]; }).join("  |  ");
  console.log((f.replace("data-", "").replace(".js", "") + "  ").padEnd(14) + line +
              (hot.length ? "\n   ⚠ 同域 ≥3 条：" + hot.join(", ") : ""));
});

console.log("\n=== 跨文件最集中的比喻域 ===\n");
Object.keys(globalByDomain).sort(function (a, b) {
  return globalByDomain[b].length - globalByDomain[a].length;
}).slice(0, 8).forEach(function (d) {
  var ids = globalByDomain[d];
  console.log("  " + d.padEnd(12) + String(ids.length).padStart(3) + " 条  " +
              (ids.length > 8 ? ids.slice(0, 8).join(", ") + " …" : ids.join(", ")));
});

if (noAnalogy.length) {
  console.log("\n=== 没找到类比句（需人工确认）===");
  noAnalogy.forEach(function (n) { console.log("  · " + n); });
}
console.log("\n提示：同域集中不等于写坏了，只是读起来单调。要改的是把其中几条换成别的场景，");
console.log("      保留最贴切的那一条。未归类通常是没用具体场景、直接讲机制的条目。");
