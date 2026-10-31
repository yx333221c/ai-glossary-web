/*
 * 术语详情页：读取 ?id=xxx，渲染完整条目、相关术语、上一条/下一条导航
 */
(function (global) {
  "use strict";

  var AI = global.AIGlossary, UI = global.AIUI;

  AI.reindex();

  UI.buildChrome("detail");
  UI.applyTheme(UI.currentTheme());

  var host = document.getElementById("detail");
  var id = AI.idFromLocation();
  var term = id ? AI.get(id) : null;

  if (!term) {
    document.title = "未找到术语 · AI 术语词典";
    host.innerHTML =
      '<div class="empty"><strong>' + (id ? "没有 id 为「" + AI.esc(id) + "」的条目" : "未指定条目") + "</strong>" +
      (id ? "这个标识可能已改名，试试搜索。<br>" : "请从浏览页进入。<br>") +
      '<div style="margin-top:14px"><a class="btn primary" href="search.html">去搜索</a> ' +
      '<a class="btn" href="index.html">浏览全部术语</a></div></div>';
    return;
  }

  var meta = AI.CATEGORIES[term.cat] || { zh: term.cat, icon: "·" };
  var level = AI.LEVELS[term.level] || { zh: term.level };
  var list = AI.terms();
  var pos = list.indexOf(term);

  document.title = term.zh + "（" + term.en + "）· AI 术语词典";
  document.getElementById("crumbCat").textContent = meta.zh;
  document.getElementById("crumbCat").href = "index.html#cat-" + term.cat;
  document.getElementById("crumbName").textContent = term.zh;

  /* 相关术语：正链 + 反链 + 同类 */
  var rel = AI.suggestFor(term, 10);

  var html =
    '<header class="detail-hd">' +
      '<div class="kicker">' + meta.icon + " " + AI.esc(meta.zh) + "</div>" +
      '<h1 class="detail-zh">' + AI.esc(term.zh) + "</h1>" +
      '<p class="detail-en">' + AI.esc(term.en) +
        (term.id !== AI.norm(term.en).replace(/\s+/g, "-")
          ? '<span style="color:var(--ink-3)"> · ' + AI.esc(term.id) + "</span>" : "") +
      "</p>" +
      '<div class="detail-tags">' +
        '<span class="chip cat-' + term.cat + '">' + meta.icon + " " + AI.esc(meta.zh) + "</span>" +
        '<i class="lv lv-' + term.level + '">' + AI.esc(level.zh) + "</i>" +
        (term.aka || []).map(function (a) { return '<span class="tag">' + AI.esc(a) + "</span>"; }).join("") +
        (term.tags || []).map(function (g) { return '<span class="tag">#' + AI.esc(g) + "</span>"; }).join("") +
        (term.src === "glossary"
          ? '<span class="tag" title="该条目的统一译名取自参考术语表">参考译名表</span>' : "") +
      "</div>" +
    "</header>" +

    '<section class="block"><h2>一句话释义</h2><p class="oneline">' +
      AI.esc(term.def) + "</p></section>" +

    (term.plain
      ? '<section class="block"><h2>白话版<span class="sub">不懂也能读，先看到这里</span></h2>' +
        '<p class="plain">' + AI.esc(term.plain) + "</p></section>"
      : "") +

    '<section class="block"><h2>展开说</h2><p class="longtext">' +
      AI.esc(term.long || "（本条目暂无补充说明。）") + "</p></section>";

  if (term.avoid && term.avoid.length) {
    html += '<section class="block"><h2>用法提醒</h2>' +
      '<div class="note warn"><strong>以下写法本站不采用，或属于常见误解：</strong>' +
      "<ul>" + term.avoid.map(function (a) { return "<li>" + AI.esc(a) + "</li>"; }).join("") +
      "</ul></div></section>";
  }

  if (rel.length) {
    html += '<section class="block"><h2>接着看</h2><ul class="relgrid">' +
      rel.map(function (r) {
        return '<li><a class="reltile" href="' + AI.termUrl(r.term.id) + '">' +
          '<span class="zh">' + AI.esc(r.term.zh) + "</span>" +
          '<span class="en">' + AI.esc(r.term.en) + "</span>" +
          '<span class="via">' + AI.esc(r.via) + "</span></a></li>";
      }).join("") + "</ul></section>";
  }

  var prev = pos > 0 ? list[pos - 1] : null;
  var next = pos < list.length - 1 ? list[pos + 1] : null;
  html += '<nav class="hero-actions" style="margin-top:30px;border-top:1px solid var(--line);padding-top:16px">' +
    (prev ? '<a class="btn" href="' + AI.termUrl(prev.id) + '">← ' + AI.esc(prev.zh) + "</a>" : "") +
    (next ? '<a class="btn" href="' + AI.termUrl(next.id) + '">' + AI.esc(next.zh) + " 下一页 →</a>" : "") +
    '<a class="btn" href="search.html?q=' + encodeURIComponent(term.zh) + '">在搜索页试这个关键词</a>' +
  "</nav>";

  host.innerHTML = html;
})(window);
