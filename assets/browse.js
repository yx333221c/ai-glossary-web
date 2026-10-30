/*
 * 浏览页：分类筛选 + 列表/卡片视图 + 拼音首字母索引 + 全部术语渲染
 */
(function (global) {
  "use strict";

  var AI = global.AIGlossary, UI = global.AIUI;

  AI.reindex();
  var TERMS = AI.terms();

  var state = {
    cat: "all",
    letter: "",
    view: "list",
    q: ""
  };

  /* ---------------- 顶栏 ---------------- */
  UI.buildChrome("browse");
  UI.applyTheme(UI.currentTheme());

  /* ---------------- 筛选条 ---------------- */
  var counts = UI.countByCategory(TERMS);
  var bar = document.getElementById("filterbar");

  function chip(label, key, n, colorClass) {
    var prefix = colorClass ? '<span class="' + colorClass + '">' : "";
    var suffix = colorClass ? "</span>" : "";
    return '<button type="button" class="chipbtn' + (state.cat === key ? " on" : "") +
           '" data-cat="' + key + '">' +
           prefix + label + suffix +
           (n != null ? '<span class="n">' + n + "</span>" : "") + "</button>";
  }

  function renderFilterbar() {
    var html = chip("全部", "all", TERMS.length);
    html += '<span class="sep"></span>';
    Object.keys(AI.CATEGORIES).forEach(function (k) {
      if (!counts[k]) return;
      var c = AI.CATEGORIES[k];
      html += chip(c.icon + " " + c.zh, k, counts[k], "cat-" + k);
    });
    html += '<span class="sep"></span>';
    html += '<button type="button" class="chipbtn' + (state.view === "list" ? " on" : "") + '" data-view="list">☰ 列表</button>';
    html += '<button type="button" class="chipbtn' + (state.view === "card" ? " on" : "") + '" data-view="card">▦ 卡片</button>';
    bar.innerHTML = html;
  }

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.cat) { state.cat = b.dataset.cat; state.letter = ""; }
    else if (b.dataset.view) { state.view = b.dataset.view; }
    else return;
    render();
    renderFilterbar();
    renderAlpha();
  });

  /* ---------------- 拼音首字母索引 ---------------- */
  var alphaEl = document.getElementById("alphaIndex");

  function letterOf(t) {
    var p = AI.tight(t.pinyin);
    if (p && /[a-z]/.test(p[0])) return p[0].toUpperCase();
    var e = AI.norm(t.en);
    if (/[a-z]/.test(e[0])) return e[0].toUpperCase();
    return "#";
  }

  function renderAlpha() {
    var present = {};
    pool().forEach(function (t) { present[letterOf(t)] = 1; });
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").concat(["#"]);
    var any = Object.keys(present).length > 1;
    alphaEl.hidden = !any && !state.letter;
    if (alphaEl.hidden) return;
    alphaEl.innerHTML =
      '<a href="#" data-letter="" class="' + (state.letter ? "" : "on") + '">全部</a>' +
      letters.map(function (L) {
        return '<a href="#" data-letter="' + L + '" class="' +
               (present[L] ? (state.letter === L ? "on" : "") : "off") + '">' + L + "</a>";
      }).join("");
  }

  alphaEl.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || a.classList.contains("off")) return;
    e.preventDefault();
    state.letter = a.dataset.letter;
    render();
    renderAlpha();
  });

  /* ---------------- 渲染 ---------------- */
  var body = document.getElementById("browseBody");

  function pool() {
    return TERMS.filter(function (t) {
      if (state.cat !== "all" && t.cat !== state.cat) return false;
      if (state.letter && letterOf(t) !== state.letter) return false;
      return true;
    });
  }

  function render() {
    var items = pool();
    if (!items.length) {
      body.innerHTML = '<div class="empty"><strong>这一档没有条目</strong>' +
        '换个分类或清除字母筛选。</div>';
      return;
    }

    if (state.view === "card") {
      body.innerHTML = '<div class="cardgrid">' +
        items.map(function (t) { return UI.termCard(t); }).join("") + "</div>";
    } else {
      /* 列表视图：按分类分组，组内已按拼音排序 */
      var groups = {};
      items.forEach(function (t) { (groups[t.cat] = groups[t.cat] || []).push(t); });
      var order = Object.keys(AI.CATEGORIES);
      body.innerHTML = order.filter(function (k) { return groups[k]; }).map(function (k) {
        var c = AI.CATEGORIES[k];
        return '<section class="section">' +
          '<div class="section-hd"><h2><span class="cat-' + k + '">' + c.icon + "</span> " +
            AI.esc(c.zh) + '</h2><span class="cnt">' + groups[k].length + " 条</span>" +
            '<span class="hint">' + AI.esc(c.hint) + "</span></div>" +
          '<ul class="tlist">' +
            groups[k].map(function (t) { return UI.termRow(t, { query: state.q }); }).join("") +
          "</ul></section>";
      }).join("");
    }

    document.getElementById("footStat").textContent =
      "当前显示 " + items.length + " / " + TERMS.length + " 条术语";
  }

  /* ---------------- 随机 ---------------- */
  document.getElementById("shuffleBtn").addEventListener("click", function (e) {
    e.preventDefault();
    if (!TERMS.length) return;
    var t = TERMS[Math.floor(Math.random() * TERMS.length)];
    global.location.href = AI.termUrl(t.id);
  });

  renderFilterbar();
  render();
  renderAlpha();
})(window);
