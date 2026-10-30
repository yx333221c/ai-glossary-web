/*
 * 搜索页：实时检索 + 相关度排序 + 键盘导航 + URL 同步
 * 交互约定：
 *   Enter        提交（同时写入 history，便于回退）
 *   ↑ / ↓        在结果间移动焦点
 *   Esc          清空并回到输入框
 *   输入即时出结果，无需按按钮
 */
(function (global) {
  "use strict";

  var AI = global.AIGlossary, UI = global.AIUI;

  AI.reindex();

  var els = {
    form: document.getElementById("bigForm"),
    input: document.getElementById("bigInput"),
    cat: document.getElementById("optCat"),
    level: document.getElementById("optLevel"),
    limit: document.getElementById("optLimit"),
    reason: document.getElementById("optReason"),
    area: document.getElementById("resultsArea"),
    examples: document.getElementById("examples"),
    foot: document.getElementById("footStat")
  };

  UI.buildChrome("search");
  UI.applyTheme(UI.currentTheme());

  /* ---------------- 分类选项 ---------------- */
  (function fillCats() {
    var counts = UI.countByCategory(AI.terms());
    var html = '<option value="all">全部分类（' + AI.terms().length + "）</option>";
    Object.keys(AI.CATEGORIES).forEach(function (k) {
      if (!counts[k]) return;
      html += '<option value="' + k + '">' + AI.CATEGORIES[k].icon + " " +
              AI.esc(AI.CATEGORIES[k].zh) + "（" + counts[k] + "）</option>";
    });
    els.cat.innerHTML = html;
  })();

  /* ---------------- 示例词 ---------------- */
  var EXAMPLES = ["注意力", "embedding", "幻觉", "ppl", "shangwenxia", "kv", "对齐", "越狱", "采样", "规模", "图像块", "智能体"];
  els.examples.innerHTML = '<span style="color:var(--ink-3);font-size:13px;margin-right:4px;">试试：</span>' +
    EXAMPLES.map(function (e) { return '<button type="button" class="chipbtn" data-ex="' + AI.esc(e) + '">' + AI.esc(e) + "</button>"; }).join("");
  els.examples.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-ex]");
    if (!b) return;
    els.input.value = b.dataset.ex;
    run(true);
    els.input.focus();
  });

  /* ---------------- 状态 ---------------- */
  var lastResults = [];

  function opts() {
    return {
      cat: els.cat.value,
      level: els.level.value,
      limit: parseInt(els.limit.value, 10) || 0
    };
  }

  function stateFromQuery() {
    var q = AI.idFromLocationByName
      ? AI.idFromLocationByName("q")
      : decodeURIComponent(((/[?&]q=([^&#]*)/.exec(global.location.search) || [null, ""])[1]).replace(/\+/g, " "));
    return q || "";
  }

  els.input.value = stateFromQuery();

  /* ---------------- 渲染 ---------------- */
  function rowHtml(res, query, showReason) {
    var t = res.term;
    return '<li class="trow" data-id="' + AI.esc(t.id) + '">' +
      '<a class="trow-main" href="' + AI.termUrl(t.id) + '">' +
        '<span class="trow-cat cat-' + t.cat + '">' + (AI.CATEGORIES[t.cat] || {}).icon + "</span>" +
        '<span class="trow-names">' +
          '<span class="trow-zh">' + AI.highlight(t.zh, query) + "</span>" +
          '<span class="trow-en">' + AI.highlight(t.en, query) + "</span>" +
          (t.aka && t.aka.length
            ? '<span class="trow-aka">' + AI.highlight(t.aka.slice(0, 3).join(" · "), query) + "</span>" : "") +
        "</span>" +
        '<span class="trow-def">' + AI.highlight(t.def, query) +
          (showReason && res.reasons && res.reasons.length
            ? '<span style="display:block;color:var(--ink-3);font-size:12px;margin-top:3px;">命中：' +
              AI.esc(res.reasons.join(" / ")) + "</span>" : "") +
        "</span>" +
        '<span class="trow-meta"><i class="lv lv-' + t.level + '">' +
          (AI.LEVELS[t.level] || {}).zh + "</i></span>" +
      "</a>" +
      '<div class="trow-score" title="相关度 ' + res.relevance + '/100">' +
        '<span class="bar"><span class="bar-fill" style="width:' + res.relevance + '%"></span></span>' +
        '<span class="num">' + res.relevance + "</span>" +
      "</div></li>";
  }

  function render(query) {
    if (!query.trim()) {
      els.area.innerHTML =
        '<div class="empty"><strong>还没有输入</strong>键入中文、英文或拼音即可开始检索；' +
        '<a href="index.html">或者直接浏览全部 ' + AI.terms().length + " 条术语</a>。</div>";
      els.foot.textContent = "共收录 " + AI.terms().length + " 条术语";
      lastResults = [];
      return;
    }

    var o = opts();
    var res = AI.search(query, o);
    lastResults = res;

    if (!res.length) {
      els.area.innerHTML =
        '<div class="empty"><strong>没有匹配「' + AI.esc(query) + "」的术语</strong>" +
        "换个说法试试：英文全称、中文译名、拼音都行。" +
        '<div style="margin-top:14px"><a class="btn" href="index.html">去浏览全部术语</a></div></div>';
      els.foot.textContent = "0 条结果";
      return;
    }

    var head = '<div class="results-meta">' +
      "<h2>找到 <span class=\"kw\">" + res.length + "</span> 条相关术语</h2>" +
      '<span>关键词：</span><span class="kw">' + AI.esc(query) + "</span>" +
      '<span class="why">按关联程度降序 · 相同分数时进阶条目更靠前</span></div>';

    var list = '<ul class="tlist" id="resList">' +
      res.map(function (r) { return rowHtml(r, query, els.reason.checked); }).join("") + "</ul>";

    els.area.innerHTML = head + list;
    els.foot.textContent = "共 " + res.length + " 条结果 · 第 1 条 " + res[0].term.zh;
  }

  /* ---------------- 事件 ---------------- */
  function pushUrl() {
    UI.setQuery("q", els.input.value.trim());
  }

  function run(push) {
    render(els.input.value);
    if (push) pushUrl();
  }

  els.input.addEventListener("input", UI.debounce(function () { run(false); }, 90));
  els.form.addEventListener("submit", function (e) { e.preventDefault(); run(true); });

  [els.cat, els.level, els.limit].forEach(function (s) {
    s.addEventListener("change", function () { run(true); });
  });
  els.reason.addEventListener("change", function () { run(false); });

  /* 键盘导航 */
  var focusIdx = -1;
  els.input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      els.input.value = "";
      run(true);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      var items = els.area.querySelectorAll("#resList .trow");
      if (!items.length) return;
      e.preventDefault();
      focusIdx = e.key === "ArrowDown"
        ? Math.min(items.length - 1, focusIdx + 1)
        : Math.max(0, focusIdx - 1);
      items[focusIdx].querySelector("a").focus();
    }
  });

  document.addEventListener("keydown", function (e) {
    /* “/” 聚焦搜索框，全站习惯 */
    if (e.key === "/" && document.activeElement !== els.input) {
      e.preventDefault();
      els.input.focus();
      els.input.select();
    }
  });

  els.area.addEventListener("focusout", function () { focusIdx = -1; });

  /* ---------------- 启动 ---------------- */
  render(els.input.value);
  if (!els.input.value) {
    els.area.innerHTML =
      '<div class="empty"><strong>输入关键词开始检索</strong>下面这些是最常被查的概念，也可以直接' +
      '<a href="index.html">浏览全部 ' + AI.terms().length + " 条</a>。</div>";
    var quick = ["attention", "hallucination", "rag", "rlhf", "embedding", "perplexity"]
      .map(function (id) { return AI.get(id); })
      .filter(Boolean);
    if (quick.length) {
      els.area.innerHTML += '<section class="section"><div class="section-hd"><h2>常见条目</h2>' +
        '<span class="hint">无需关键词即可直达</span></div><ul class="tlist">' +
        quick.map(function (t) { return UI.termRow(t, {}); }).join("") + "</ul></section>";
    }
    els.foot.textContent = "共收录 " + AI.terms().length + " 条术语";
  }
  els.input.focus();
})(window);
