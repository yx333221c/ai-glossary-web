/*
 * 浏览器冒烟测试：用无头 Chrome 渲染每个页面，检查
 *   1) 控制台没有未捕获错误
 *   2) 关键内容确实渲染出来了（而不是停留在 loading 占位）
 * 运行：node tests/browser.js      （需要本机装有 Chrome 或 Edge）
 *
 * 说明：这是可选验证步骤，CI/无浏览器环境下会自动跳过并返回 0。
 */
"use strict";

var fs = require("fs");
var os = require("os");
var path = require("path");
var cp = require("child_process");

var ROOT = path.resolve(__dirname, "..");

/* ---------------- 找浏览器 ---------------- */
var CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
];
var BROWSER = CANDIDATES.filter(function (p) { return fs.existsSync(p); })[0];

if (!BROWSER) {
  console.log("未找到 Chrome / Edge，跳过浏览器冒烟测试。");
  console.log("（逻辑层请跑 node tests/run.js 与 node tests/pages.js）");
  process.exit(0);
}
console.log("浏览器: " + BROWSER);

function fileUrl(rel) {
  return "file:///" + path.join(ROOT, rel).replace(/\\/g, "/").replace(/ /g, "%20");
}

/** 渲染一个页面，返回 { dom, errors } */
function render(rel) {
  var tmpOut = path.join(os.tmpdir(), "aig-" + Date.now() + "-" + Math.random().toString(36).slice(2) + ".html");
  var tmpErr = tmpOut + ".err";
  var url = typeof rel === "string" ? fileUrl(rel) : rel.url;

  var res = cp.spawnSync(BROWSER, [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--virtual-time-budget=6000",
    "--enable-logging=stderr", "--log-level=0",
    "--dump-dom", url
  ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

  var dom = res.stdout || "";
  var errText = res.stderr || "";
  var errors = [];
  errText.split(/\r?\n/).forEach(function (line) {
    /* Chrome 把页面 console 输出转发成 INFO:CONSOLE 行 */
    if (/INFO:CONSOLE/.test(line) && !/DevTools|Download the|favicon/i.test(line)) {
      var m = /INFO:CONSOLE:(\d+)\]\s*"(.*)"/.exec(line);
      if (m) {
        var msg = m[2];
        /* 只有真错误才算失败；日志性提示忽略 */
        if (/Uncaught|ReferenceError|TypeError|SyntaxError|is not defined|is not a function/.test(msg)) {
          errors.push("line " + m[1] + ": " + msg);
        }
      }
    }
  });
  /* favicon 404 之类的资源错误不作为失败 */
  return { dom: dom, errors: errors, status: res.status };
}

/* ---------------- 断言 ---------------- */
var pass = 0, fail = 0;
function check(page, dom, label, cond) {
  if (cond) { pass++; console.log("  ✓ " + page + " — " + label); }
  else {
    fail++;
    console.log("  ✗ " + page + " — " + label);
  }
}
function noErrors(page, r) {
  if (r.errors.length === 0) { pass++; console.log("  ✓ " + page + " — 无未捕获错误"); }
  else {
    fail++;
    console.log("  ✗ " + page + " — " + r.errors.length + " 个错误");
    r.errors.forEach(function (e) { console.log("       · " + e); });
  }
}
function count(dom, re) { return (dom.match(re) || []).length; }

console.log("\n浏览页 index.html");
var home = render("index.html");
noErrors("index.html", home);
check("index.html", home.dom, "渲染出全部术语行", count(home.dom, /class="trow"/g) > 150);
check("index.html", home.dom, "分类分区存在", count(home.dom, /class="section"/g) >= 8);
check("index.html", home.dom, "筛选条已填充", count(home.dom, /data-cat="/g) >= 10);
check("index.html", home.dom, "统计文案已写入", /当前显示 \d+ \/ \d+ 条术语/.test(home.dom));
check("index.html", home.dom, "占位文本已被替换", home.dom.indexOf("正在加载术语数据") < 0);
check("index.html", home.dom, "字母索引存在", home.dom.indexOf('id="alphaIndex"') >= 0);

var CASES = [
  { name: "search.html?q=attention", url: fileUrl("search.html") + "?q=attention",
    expect: function (d) {
      check("search?attention", d, "结果行 > 5", count(d, /class="trow"/g) > 5);
      check("search?attention", d, "首位是「注意力」", /trow-zh">[^<]*注意力/.test(d));
      check("search?attention", d, "命中词被高亮", count(d, /<mark>/g) > 0);
      check("search?attention", d, "相关度条已渲染", count(d, /bar-fill/g) > 5);
      check("search?attention", d, "结果计数标题", /找到 <span class="kw">\d+<\/span> 条相关术语/.test(d));
    } },
  { name: "search.html?q=注意力（URL 编码）", url: "file:///" + ROOT.replace(/\\/g, "/") + "/search.html?q=%E6%B3%A8%E6%84%8F%E5%8A%9B",
    expect: function (d) {
      check("search?注意力", d, "结果行 > 10", count(d, /class="trow"/g) > 10);
      check("search?注意力", d, "命中原因已显示", count(d, /命中：/g) > 0);
    } },
  { name: "search.html?q=jzhc（拼音首字母）", url: fileUrl("search.html") + "?q=jzhc",
    expect: function (d) {
      check("search?jzhc", d, "首位是「键值缓存」", /trow-zh">[^<]*键值缓存/.test(d));
    } },
  { name: "search.html?q=多付（释义内文）", url: fileUrl("search.html") + "?q=%E5%A4%9A%E4%BB%98",
    expect: function (d) {
      check("search?多付", d, "命中 KL 散度", /KL 散度/.test(d));
    } },
  { name: "search.html?q=zzzqqq（无结果）", url: fileUrl("search.html") + "?q=zzzqqqxx",
    expect: function (d) {
      check("search?无结果", d, "显示空结果提示", /没有匹配/.test(d));
    } },
  { name: "search.html（空查询）", url: fileUrl("search.html"),
    expect: function (d) {
      check("search?空", d, "显示常见条目引导", /常见条目/.test(d));
    } },
  { name: "term.html?id=attention", url: fileUrl("term.html") + "?id=attention",
    expect: function (d) {
      /* 英文名按参考表口径保留原始大小写（常用名词小写、缩写大写），
         所以这里只断言「标题由中文名 + 英文名构成」，不写死大小写 */
      check("term?attention", d, "标题含中文名与词典后缀", /<title>注意力（[^<]+）· AI 术语词典<\/title>/.test(d));
      check("term?attention", d, "主标题为「注意力」", /detail-zh">注意力</.test(d));
      check("term?attention", d, "英文名已渲染", /detail-en">[^<]+</.test(d));
      check("term?attention", d, "展开说存在", /展开说/.test(d));
      check("term?attention", d, "用法提醒存在", /用法提醒/.test(d));
      check("term?attention", d, "相关条目 > 3", count(d, /reltile/g) > 3);
      check("term?attention", d, "上一页/下一页导航", /hero-actions/.test(d));
    } },
  { name: "term.html?id=不存在", url: fileUrl("term.html") + "?id=no-such-term-xyz",
    expect: function (d) {
      check("term?404", d, "优雅提示未找到", /没有 id 为|未指定条目/.test(d));
      check("term?404", d, "提供回退入口", /去搜索/.test(d));
    } },
  { name: "about.html", url: fileUrl("about.html"),
    expect: function (d) {
      check("about", d, "译名对照表已填充", count(d, /<tr>/g) > 60);
      check("about", d, "权重表含真实数值", /enExact/.test(d) && /100/.test(d));
      check("about", d, "统计数字为动态值", /共收录 \d+ 条术语 · \d+ 个分类/.test(d));
      check("about", d, "已无「当前未生效」标注", d.indexOf("当前未生效") < 0);
      check("about", d, "口径为 55 条参考译名", /核心 55 条/.test(d));
    } }
];

CASES.forEach(function (c) {
  console.log("\n" + c.name);
  var r = render(c);
  noErrors(c.name, r);
  c.expect(r.dom);
});

console.log("\n" + "=".repeat(56));
console.log("通过 " + pass + " / " + (pass + fail) + (fail ? "   失败 " + fail : "   全部通过"));
console.log("=".repeat(56));
process.exit(fail ? 1 : 0);
