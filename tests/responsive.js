/*
 * 响应式 / 真实视口测试：用 Chrome DevTools Protocol 强制指定视口宽度，
 * 检查横向溢出与关键结构，并可截图。
 *
 * 为什么需要它：headless Chrome 的 --window-size 会被夹到固定尺寸，
 * 用 --screenshot 截出来的「移动端」其实还是桌面宽度，等于没测。
 *
 * 运行：node tests/responsive.js          （跑断言）
 *       node tests/responsive.js --shots   （额外把截图写到系统临时目录）
 */
"use strict";

var cp = require("child_process");
var fs = require("fs");
var http = require("http");
var os = require("os");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");

var BROWSER = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(function (p) { return fs.existsSync(p); })[0];

if (!BROWSER) { console.log("未找到 Chrome / Edge，跳过响应式测试。"); process.exit(0); }

var WANT_SHOTS = process.argv.indexOf("--shots") >= 0;
var SHOT_DIR = path.join(os.tmpdir(), "aig-responsive");
if (WANT_SHOTS) fs.mkdirSync(SHOT_DIR, { recursive: true });

function fileUrl(rel) {
  return "file:///" + path.join(ROOT, rel).replace(/\\/g, "/");
}

function getJson(url) {
  return new Promise(function (resolve, reject) {
    http.get(url, function (res) {
      var buf = "";
      res.on("data", function (c) { buf += c; });
      res.on("end", function () {
        try { resolve(JSON.parse(buf)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

/* ---------------------------------------------------------------- 启动 */

var profile = fs.mkdtempSync(path.join(os.tmpdir(), "aig-cdp-"));
var chrome = cp.spawn(BROWSER, [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--remote-debugging-port=0", "--user-data-dir=" + profile,
  "--hide-scrollbars", "about:blank"
], { stdio: "ignore" });

function readPort() {
  var f = path.join(profile, "DevToolsActivePort");
  var t0 = Date.now();
  return new Promise(function (resolve, reject) {
    (function poll() {
      if (fs.existsSync(f)) {
        var txt = "";
        try { txt = fs.readFileSync(f, "utf8"); } catch (e) { txt = ""; }
        var m = /^(\d+)/.exec(txt.trim());
        if (m) return resolve(parseInt(m[1], 10));
      }
      if (Date.now() - t0 > 15000) return reject(new Error("等不到 DevToolsActivePort"));
      setTimeout(poll, 150);
    })();
  });
}

/* ---------------------------------------------------------------- CDP 客户端 */

function CdpSession(wsUrl) {
  this.ws = new WebSocket(wsUrl);
  this.id = 0;
  this.pending = {};
  this.events = [];
  var self = this;
  this.ready = new Promise(function (resolve, reject) {
    self.ws.addEventListener("open", resolve);
    self.ws.addEventListener("error", function () { reject(new Error("ws error")); });
  });
  this.ws.addEventListener("message", function (ev) {
    var msg;
    try { msg = JSON.parse(ev.data); } catch (e) { return; }
    if (msg.id && self.pending[msg.id]) {
      var p = self.pending[msg.id];
      delete self.pending[msg.id];
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    } else if (msg.method) {
      self.events.push(msg);
    }
  });
}
CdpSession.prototype.send = function (method, params) {
  var self = this;
  return new Promise(function (resolve, reject) {
    var id = ++self.id;
    self.pending[id] = { resolve: resolve, reject: reject };
    self.ws.send(JSON.stringify({ id: id, method: method, params: params || {} }));
    setTimeout(function () {
      if (self.pending[id]) { delete self.pending[id]; reject(new Error("timeout: " + method)); }
    }, 20000);
  });
};
CdpSession.prototype.waitForEvent = function (name, ms) {
  var self = this;
  var t0 = Date.now();
  return new Promise(function (resolve, reject) {
    (function poll() {
      for (var i = 0; i < self.events.length; i++) {
        if (self.events[i].method === name) {
          var e = self.events.splice(i, 1)[0];
          return resolve(e.params);
        }
      }
      if (Date.now() - t0 > (ms || 10000)) return reject(new Error("no event " + name));
      setTimeout(poll, 40);
    })();
  });
};

/* ---------------------------------------------------------------- 主流程 */

var WIDTHS = [1400, 1024, 820, 560, 390];
var PAGES = ["index.html", "search.html?q=%E6%B3%A8%E6%84%8F%E5%8A%9B", "term.html?id=attention", "about.html"];

var pass = 0, fail = 0;
function ok(c, label) {
  if (c) { pass++; console.log("  ✓ " + label); }
  else { fail++; console.log("  ✗ " + label); }
}

/** 在页面里测量：横向溢出 + 关键元素可见性。写成真函数再序列化，避免手工转义出错。 */
function probe() {
  var de = document.documentElement;
  var over = [];
  /* 处在「自身可横向滚动」的祖先里的元素不算溢出——那是设计好的滚动区，不是把页面撑宽 */
  function inScroller(el) {
    var p = el.parentElement;
    while (p) {
      var ox = getComputedStyle(p).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
      p = p.parentElement;
    }
    return false;
  }
  var all = document.querySelectorAll("body *");
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    var r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    /* 故意移出屏幕的无障碍锚点（skip link）right 为负，不算溢出 */
    if (r.right <= 0) continue;
    if (r.right > window.innerWidth + 1.5) {
      if (inScroller(el)) continue;
      var cls = (el.className && typeof el.className === "string")
        ? "." + el.className.trim().split(/\s+/).join(".") : "";
      over.push(el.tagName.toLowerCase() + cls + " [right=" + Math.round(r.right) + "]");
    }
  }
  function vis(sel) {
    var e = document.querySelector(sel);
    if (!e) return "missing";
    var rr = e.getBoundingClientRect();
    return (rr.width > 0 && rr.height > 0) ? "ok" : "hidden";
  }
  var a = document.querySelector(".brand");
  var b = document.querySelector(".chrome-right");
  var row = "na";
  if (a && b) {
    row = Math.abs(a.getBoundingClientRect().top - b.getBoundingClientRect().top) < 8 ? "same-row" : "wrapped";
  }
  return JSON.stringify({
    docScrollW: de.scrollWidth,
    innerW: window.innerWidth,
    overflow: over.slice(0, 12),
    overflowCount: over.length,
    brand: vis(".brand"), nav: vis(".mainnav"), theme: vis(".theme-btn"),
    chromeRight: vis(".chrome-right"),
    rows: document.querySelectorAll(".trow").length,
    cards: document.querySelectorAll(".card").length,
    sections: document.querySelectorAll(".section").length,
    chromeTop: row
  });
}
var PROBE = "(" + probe.toString() + ")()";

readPort().then(function (port) {
  return getJson("http://127.0.0.1:" + port + "/json/list");
}).then(function (targets) {
  var page = targets.filter(function (t) { return t.type === "page"; })[0];
  if (!page) throw new Error("没有 page target");
  var s = new CdpSession(page.webSocketDebuggerUrl);
  return s.ready.then(function () { return s; });
}).then(function (s) {
  return s.send("Page.enable").then(function () { return s; });
}).then(function (s) {
  var chain = Promise.resolve();

  PAGES.forEach(function (p) {
    WIDTHS.forEach(function (w) {
      chain = chain.then(function () {
        var url = fileUrl(p.split("?")[0]) + (p.indexOf("?") >= 0 ? "?" + p.split("?")[1] : "");
        return s.send("Emulation.setDeviceMetricsOverride",
          { width: w, height: 900, deviceScaleFactor: 1, mobile: false })
          .then(function () { return s.send("Page.navigate", { url: url }); })
          .then(function () { return s.waitForEvent("Page.loadEventFired", 12000); })
          .then(function () { return delay(450); })   /* 等脚本渲染完 */
          .then(function () {
            return s.send("Runtime.evaluate", { expression: PROBE, returnByValue: true });
          })
          .then(function (res) {
            if (!res.result || res.result.subtype === "error" || res.exceptionDetails) {
              throw new Error("probe error: " +
                ((res.exceptionDetails && (res.exceptionDetails.exception && res.exceptionDetails.exception.description || res.exceptionDetails.text)) || JSON.stringify(res.result)));
            }
            if (typeof res.result.value !== "string") {
              throw new Error("probe returned non-string: " + JSON.stringify(res.result).slice(0, 300));
            }
            var m = JSON.parse(res.result.value);
            var label = p + " @ " + w + "px";

            /* 主判据：文档本身没有横向滚动条 */
            ok(m.docScrollW <= m.innerW + 1,
               label + " 无横向滚动（scrollW=" + m.docScrollW + " ≤ innerW=" + m.innerW + "）");
            /* 辅判据：没有元素真的伸出右边界（已排除负 left 的无障碍锚点） */
            ok(m.overflowCount === 0,
               label + " 无元素伸出右边界" +
               (m.overflowCount ? " — " + m.overflow.join(" | ") : ""));
            ok(m.brand === "ok" && m.nav === "ok" && m.theme === "ok",
               label + " 顶栏元素可见");

            if (p.indexOf("index") === 0) {
              ok(m.rows >= 170, label + " 浏览页列出全部条目（" + m.rows + "）");
            }
            if (p.indexOf("search") === 0) {
              ok(m.rows > 5 && m.rows < 60, label + " 搜索页给出排序结果（" + m.rows + "）");
            }
            if (p.indexOf("term") === 0) {
              ok(m.rows === 0, label + " 详情页不误用列表结构");
            }
            if (p.indexOf("about") === 0) {
              ok(m.sections >= 5, label + " 关于页分区完整（" + m.sections + "）");
            }
            if (w <= 760) {
              ok(m.chromeRight === "ok", label + " 窄屏下搜索/主题成组仍在");
            }
            if (WANT_SHOTS) {
              return s.send("Page.captureScreenshot", { format: "png" }).then(function (r) {
                var name = p.replace(/[?=&%.]/g, "_") + "-" + w + ".png";
                fs.writeFileSync(path.join(SHOT_DIR, name), Buffer.from(r.data, "base64"));
                console.log("      shot → " + path.join(SHOT_DIR, name));
              });
            }
          })
          .catch(function (e) {
            fail++;
            console.log("  ✗ " + p + " @ " + w + "px 探测失败: " + e.message);
          });
      });
    });
  });

  return chain.then(function () { return s; });
}).then(function () {
  console.log("\n" + "=".repeat(56));
  console.log("通过 " + pass + " / " + (pass + fail) + (fail ? "   失败 " + fail : "   全部通过"));
  console.log("=".repeat(56));
})["finally"](function () {
  try { chrome.kill(); } catch (e) {}
  process.exit(fail ? 1 : 0);
}).catch(function (e) {
  console.error("fatal:", e && e.message ? e.message : e);
  try { chrome.kill(); } catch (e2) {}
  process.exit(2);
});
