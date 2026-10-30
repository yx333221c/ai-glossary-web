/*
 * 共享 UI：顶部导航、搜索框行为、主题、卡片渲染
 * 页面通过 data-page 属性区分自身，脚本据此挂载对应逻辑。
 */
(function (global) {
  "use strict";

  var AI = global.AIGlossary;

  /* ---------------- 主题 ---------------- */
  function currentTheme() {
    var t = null;
    try { t = global.localStorage.getItem("ai-glossary-theme"); } catch (e) {}
    if (t === "light" || t === "dark") return t;
    var dark = global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches;
    return dark ? "dark" : "light";
  }

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = document.getElementById("themeToggle");
    if (btn) {
      btn.textContent = t === "dark" ? "☀︎ 浅色" : "☾ 深色";
      btn.setAttribute("aria-label", t === "dark" ? "切换到浅色主题" : "切换到深色主题");
    }
  }

  function toggleTheme() {
    var next = (document.documentElement.getAttribute("data-theme") === "dark") ? "light" : "dark";
    try { global.localStorage.setItem("ai-glossary-theme", next); } catch (e) {}
    applyTheme(next);
  }

  /* ---------------- 顶栏与搜索框 ---------------- */
  function buildChrome(activePage) {
    var host = document.getElementById("chrome");
    if (!host) return;

    host.innerHTML =
      '<div class="chrome-inner">' +
        '<a class="brand" href="index.html">' +
          '<span class="brand-mark">AI</span>' +
          '<span class="brand-text"><strong>AI 术语词典</strong><em>Glossary of AI Terms</em></span>' +
        '</a>' +
        '<nav class="mainnav">' +
          '<a href="index.html"' + (activePage === "browse" ? ' class="on"' : '') + '>浏览</a>' +
          '<a href="search.html"' + (activePage === "search" ? ' class="on"' : '') + '>搜索</a>' +
          '<a href="about.html"' + (activePage === "about" ? ' class="on"' : '') + '>关于 · 译名规范</a>' +
        '</nav>' +
        '<div class="chrome-right">' +
          (activePage === "search" ? "" :
            '<form class="quicksearch" action="search.html" role="search">' +
              '<input type="search" name="q" id="quickInput" placeholder="搜术语，如 attention / 注意力 / zyl" autocomplete="off" ' +
                     'aria-label="搜索术语">' +
              '<button type="submit" class="qs-btn" title="搜索">⌕</button>' +
            '</form>') +
          '<button type="button" id="themeToggle" class="theme-btn"></button>' +
        '</div>' +
      '</div>';

    document.getElementById("themeToggle").addEventListener("click", toggleTheme);

    /* 顶栏搜索框：输入即给出即时建议（仅搜索页以外的页面） */
    var q = document.getElementById("quickInput");
    if (q && activePage !== "search") {
      q.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          var val = q.value.trim();
          if (!val) return;
          /* 只有一个高置信命中就直接跳详情，否则去搜索页 */
          var res = AI.search(val, { limit: 2 });
          if (res.length === 1 || (res.length >= 2 && res[0].score >= 90 && res[1].score < 90)) {
            global.location.href = AI.termUrl(res[0].term.id);
          } else {
            global.location.href = AI.searchUrl(val);
          }
        }
      });
    }
  }

  /* ---------------- 术语卡片 ---------------- */
  /**
   * 列表用的小卡片
   * @param t term
   * @param opts { query, score, relevance, reasons, showScore }
   */
  function termRow(t, opts) {
    opts = opts || {};
    var meta = AI.CATEGORIES[t.cat] || { zh: t.cat, icon: "·" };
    var level = AI.LEVELS[t.level] || { zh: t.level };
    var q = opts.query || "";

    var html = '<li class="trow">' +
      '<a class="trow-main" href="' + AI.termUrl(t.id) + '">' +
        '<span class="trow-cat cat-' + t.cat + '" title="' + AI.esc(meta.zh) + '">' + meta.icon + '</span>' +
        '<span class="trow-names">' +
          '<span class="trow-zh">' + AI.highlight(t.zh, q) + '</span>' +
          '<span class="trow-en">' + AI.highlight(t.en, q) + '</span>' +
          (t.aka && t.aka.length
            ? '<span class="trow-aka">' + AI.esc(t.aka.slice(0, 3).join(" · ")) + '</span>' : '') +
        '</span>' +
        '<span class="trow-def">' + AI.highlight(t.def, q) + '</span>' +
        '<span class="trow-meta"><i class="lv lv-' + t.level + '">' + level.zh + '</i></span>' +
      '</a>';

    if (opts.showScore) {
      html += '<div class="trow-score" title="相关度：' + AI.esc((opts.reasons || []).join("，")) + '">' +
        '<span class="bar"><span class="bar-fill" style="width:' + (opts.relevance || 0) + '%"></span></span>' +
        '<span class="num">' + (opts.relevance || 0) + '</span>' +
      '</div>';
    }
    html += '</li>';
    return html;
  }

  /* 浏览页的大卡片 */
  function termCard(t) {
    var meta = AI.CATEGORIES[t.cat] || { zh: t.cat, icon: "·" };
    var level = AI.LEVELS[t.level] || { zh: t.level };
    return '<article class="card catborder-' + t.cat + '">' +
      '<header class="card-hd">' +
        '<h3 class="card-zh">' + AI.esc(t.zh) + '</h3>' +
        '<p class="card-en">' + AI.esc(t.en) + '</p>' +
        (t.aka && t.aka.length ? '<p class="card-aka">亦作 ' + AI.esc(t.aka.slice(0, 3).join("、")) + '</p>' : '') +
      '</header>' +
      '<p class="card-def">' + AI.esc(t.def) + '</p>' +
      '<footer class="card-ft">' +
        '<span class="chip cat-' + t.cat + '">' + meta.icon + ' ' + meta.zh + '</span>' +
        '<span class="chip lv-' + t.level + '">' + level.zh + '</span>' +
        '<a class="card-more" href="' + AI.termUrl(t.id) + '">详解 →</a>' +
      '</footer>' +
    '</article>';
  }

  /* ---------------- 常用工具 ---------------- */
  function setQuery(name, value) {
    var url = new global.URL(global.location.href);
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
    global.history.replaceState({}, "", url);
  }

  function debounce(fn, ms) {
    var id = null;
    return function () {
      var args = arguments, self = this;
      if (id) global.clearTimeout(id);
      id = global.setTimeout(function () { fn.apply(self, args); }, ms || 120);
    };
  }

  function countByCategory(terms) {
    var c = {};
    terms.forEach(function (t) { c[t.cat] = (c[t.cat] || 0) + 1; });
    return c;
  }

  global.AIUI = {
    buildChrome: buildChrome,
    applyTheme: applyTheme,
    currentTheme: currentTheme,
    termRow: termRow,
    termCard: termCard,
    setQuery: setQuery,
    debounce: debounce,
    countByCategory: countByCategory
  };
})(window);
