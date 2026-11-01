/*
 * AIGlossary —— 术语检索内核（纯浏览器，无依赖，兼容 file:// 双击打开）
 *
 * 设计要点：
 *  1. 多字段加权打分：id / en / zh / aka / pinyin / 首字母 / def / long / tags / cat / related
 *  2. 英文按词切分并做 AND 语义（未命中的词按惩罚系数折减，而不是直接丢弃，保证「部分相关」也能出现）
 *  3. 支持中文、拼音全拼、拼音首字母、英文前缀、子串与一次编辑距离的容错匹配
 *  4. 结果按分数降序，同分时按「权威度 → 名称长度 → 字典序」稳定排序
 *  5. 同时给出 0-100 的相对相关度，便于前端画进度条
 */
(function (global) {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 常量与词表
   * ------------------------------------------------------------------ */

  var CATEGORIES = {
    math:      { zh: "数学与信息论", icon: "∑",  hint: "词元、嵌入、熵、梯度这些「原料」级的概念" },
    ml:        { zh: "机器学习基础", icon: "◍",  hint: "学习范式、评估指标与泛化问题" },
    dl:        { zh: "神经网络与架构", icon: "⧉",  hint: "卷积、归一化、残差、反向传播" },
    nlp:       { zh: "语言模型与 NLP", icon: "✎",  hint: "分词、注意力、解码与提示" },
    training:  { zh: "训练与对齐",   icon: "⇅",  hint: "预训练、微调、RLHF 及其后继方法" },
    inference: { zh: "推理与生成",   icon: "▶",  hint: "采样、上下文、缓存与幻觉" },
    multimodal:{ zh: "多模态与视觉", icon: "◈",  hint: "图文对齐、图像块、生成模型" },
    agent:     { zh: "智能体与应用", icon: "☍",  hint: "规划、工具调用、检索增强" },
    safety:    { zh: "安全与评估",   icon: "⚿",  hint: "越狱、红队、基准与监督" },
    infra:     { zh: "系统与算力",   icon: "▤",  hint: "并行、量化、显存与吞吐" },
    frontier:  { zh: "前沿与争议",   icon: "✦",  hint: "尚无定论、需要保留原词的说法" }
  };

  var LEVELS = {
    basic:    { zh: "入门", weight: 1 },
    core:     { zh: "核心", weight: 2 },
    advanced: { zh: "进阶", weight: 3 }
  };

  /* 字段权重表：调这里就能改变排序倾向 */
  var W = {
    idExact: 92,   idPrefix: 46,   idHas: 26,
    enExact: 100,  enPrefix: 58,   enWord: 48,   enHas: 32,
    zhExact: 100,  zhPrefix: 56,   zhHas: 42,
    akaExact: 74,  akaHas: 28,
    pyExact: 62,   pyPrefix: 48,   pyHas: 26,
    iniExact: 58,  iniPrefix: 42,
    defHas: 17,    defCap: 34,
    longHas: 7,    longCap: 21,
    tagHas: 24,
    catHas: 13,
    levelHas: 8,
    relHas: 15,    relCap: 30,
    fuzzy: 20,
    phraseBonus: 24,
    missFactor: 0.22   /* 查询词完全没命中时，整条结果保留的分数比例 */
  };

  /* ------------------------------------------------------------------ *
   * 文本工具
   * ------------------------------------------------------------------ */

  /** 全角转半角、统一小写、压缩空白 */
  function norm(s) {
    if (s == null) return "";
    var out = String(s).toLowerCase();
    out = out.replace(/[\uff01-\uff5e]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    });
    out = out.replace(/\u3000/g, " ").replace(/\s+/g, " ");
    return out.trim();
  }

  /** 去掉所有空白，用于中文/拼音的连续匹配 */
  function tight(s) {
    return norm(s).replace(/\s+/g, "");
  }

  function isCJK(ch) {
    var c = ch.charCodeAt(0);
    return c >= 0x3400 && c <= 0x9fff;
  }

  /**
   * 把查询切成词，分两类：
   *  - terms：主查询词（按空白/标点切分）。缺失会按惩罚系数折减总分，代表「用户确实要求」。
   *  - extras：中文串补出的 2 字滑窗。只加分、不惩罚 —— 用于「注意力机制」也能命中「注意力」这类召回。
   */
  function analyze(q) {
    var n = norm(q);
    if (!n) return { terms: [], extras: [] };
    var parts = n.split(/[\s,，、;；/|]+/).filter(Boolean);
    var terms = [], extras = [];
    parts.forEach(function (p) {
      terms.push(p);
      var hasCJK = false, i;
      for (i = 0; i < p.length; i++) { if (isCJK(p[i])) { hasCJK = true; break; } }
      if (hasCJK && p.length > 2) {
        for (i = 0; i + 2 <= p.length; i++) extras.push(p.substr(i, 2));
      }
    });
    return { terms: dedupe2(terms), extras: dedupe2(extras) };
  }

  function dedupe2(arr) {
    var seen = {}, out = [];
    for (var i = 0; i < arr.length; i++) {
      if (!seen[arr[i]]) { seen[arr[i]] = 1; out.push(arr[i]); }
    }
    return out;
  }

  /** 兼容旧调用点：只要主词 */
  function queryTerms(q) { return analyze(q).terms; }

  /** 编辑距离（仅用于短查询的容错，超过阈值直接返回大数） */
  function levenshtein(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var m = a.length, n = b.length, prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      for (j = 0; j <= n; j++) prev[j] = cur[j];
    }
    return prev[n];
  }

  /* ------------------------------------------------------------------ *
   * 打分内核
   * ------------------------------------------------------------------ */

  /**
   * 单个字段值对单个查询词的匹配情况。
   * 返回 { score, tier, how }；tier/how 由「命中方式」直接决定，
   * 不再靠比较分值反推（分值彼此可能相等）。
   *   kind = "tight"：中文类字段，先去掉空白再比
   *   kind = "loose"：英文类字段，按词边界区分词首/前缀/子串
   */
  var HOW_LABEL = { exact: "精确匹配", prefix: "前缀匹配", word: "词首匹配", has: "包含关键词" };

  function scoreField(value, word, kind) {
    var v = kind === "tight" ? tight(value) : norm(value);
    if (!v || !word) return null;

    if (v === word) {
      return { score: kind === "tight" ? W.zhExact : W.enExact, tier: 3, how: "exact" };
    }
    var at = v.indexOf(word);
    if (at < 0) return null;

    if (kind === "tight") {
      /* 中文：开头命中算前缀，其余算子串 */
      return at === 0
        ? { score: W.zhPrefix, tier: 2, how: "prefix" }
        : { score: W.zhHas,    tier: 1, how: "has" };
    }
    /* 英文：整体前缀 > 词首 > 任意子串 */
    if (at === 0) return { score: W.enPrefix, tier: 2, how: "prefix" };
    var wordStart = /[\s\-_/]/.test(v.charAt(at - 1));
    return wordStart
      ? { score: W.enWord, tier: 1, how: "word" }
      : { score: W.enHas,  tier: 1, how: "has" };
  }

  /** 把一次字段命中并入累计结果；fieldLabel 用于生成「XX 前缀匹配」这类说明 */
  function take(acc, m, fieldLabel) {
    if (!m) return acc;
    acc.score += m.score;
    if (m.tier > acc.tier) acc.tier = m.tier;
    if (fieldLabel) acc.reasons.push(fieldLabel + HOW_LABEL[m.how]);
    return acc;
  }
  function newAcc() { return { score: 0, tier: 0, reasons: [] }; }

  /**
   * 计算一个术语对某个查询词的得分与「命中层级」。
   * tier 3 = 名称（英/中/别名/id）完全等于查询词
   * tier 2 = 名称前缀命中（含拼音前缀）
   * tier 1 = 名称子串命中
   * tier 0 = 只在释义 / 标签 / 分类 / 关联术语里命中
   * 返回 { score, tier, reasons }
   */
  function scoreWord(term, word) {
    var acc = newAcc(), akas = term.aka || [], i, m;

    take(acc, scoreField(term.en, word, "loose"), "英文名");
    take(acc, scoreField(term.zh, word, "tight"), "中文名");

    for (i = 0; i < akas.length; i++) {
      var a = tight(akas[i]);
      if (!a) continue;
      if (a === word) { acc.score += W.akaExact; if (3 > acc.tier) acc.tier = 3; acc.reasons.push("别名匹配"); break; }
      if (a.indexOf(word) === 0) { acc.score += W.akaExact * 0.6; if (2 > acc.tier) acc.tier = 2; acc.reasons.push("别名前缀匹配"); break; }
      if (a.indexOf(word) > 0) { acc.score += W.akaHas; if (1 > acc.tier) acc.tier = 1; acc.reasons.push("别名包含关键词"); break; }
    }

    var py = term.pyFull || tight(term.pinyin);
    if (py && py.length >= 2) {
      var pyLabel = term.pinyin ? "拼音" : "英文名";
      if (py === word) { acc.score += W.pyExact; if (2 > acc.tier) acc.tier = 2; acc.reasons.push(pyLabel + "全拼匹配"); }
      else if (py.indexOf(word) === 0) { acc.score += W.pyPrefix; if (2 > acc.tier) acc.tier = 2; acc.reasons.push(pyLabel + "前缀匹配"); }
      else if (py.indexOf(word) > 0) { acc.score += W.pyHas; if (1 > acc.tier) acc.tier = 1; acc.reasons.push(pyLabel + "包含关键词"); }
    }
    var ini = term.py1 || "";
    if (ini && ini.length >= 2) {
      if (ini === word) { acc.score += W.iniExact; if (2 > acc.tier) acc.tier = 2; acc.reasons.push("拼音首字母匹配"); }
      else if (ini.indexOf(word) === 0) { acc.score += W.iniPrefix; if (2 > acc.tier) acc.tier = 2; acc.reasons.push("拼音首字母前缀"); }
    }

    /* id：与英文名同构处理，但整体降一档（用户很少直接搜 id） */
    var vId = norm(term.id);
    if (vId) {
      if (vId === word) { acc.score += W.idExact; if (3 > acc.tier) acc.tier = 3; }
      else {
        var atId = vId.indexOf(word);
        if (atId === 0) { acc.score += W.idPrefix; if (2 > acc.tier) acc.tier = 2; }
        else if (atId > 0) { acc.score += W.idHas; if (1 > acc.tier) acc.tier = 1; }
      }
    }

    /* 正文类字段：命中即加分，但各自封顶，避免长文本靠出现次数刷分 */
    var defHits = countHits(norm(term.def || ""), word);
    if (defHits) {
      acc.score += Math.min(defHits * W.defHas, W.defCap);
      if (acc.tier === 0) acc.reasons.push("释义命中");
    }
    var longHits = countHits(norm(term.long || ""), word);
    if (longHits) acc.score += Math.min(longHits * W.longHas, W.longCap);

    var tags = term.tags || [];
    for (i = 0; i < tags.length; i++) {
      if (norm(tags[i]).indexOf(word) >= 0) {
        acc.score += W.tagHas;
        if (acc.tier === 0) acc.reasons.push("标签命中");
        break;
      }
    }

    var catMeta = CATEGORIES[term.cat];
    if (catMeta && (norm(catMeta.zh).indexOf(word) >= 0 || norm(term.cat).indexOf(word) >= 0)) {
      acc.score += W.catHas;
      if (acc.reasons.length === 0) acc.reasons.push("分类命中");
    }

    var lv = LEVELS[term.level];
    if (lv && norm(lv.zh).indexOf(word) >= 0) acc.score += W.levelHas;

    /* 一次编辑距离容错：只在其它字段都没命中、且词够长时兜底 */
    if (acc.score === 0 && word.length >= 4) {
      var cands = [norm(term.en), tight(term.id)].concat(akas.map(tight));
      for (i = 0; i < cands.length; i++) {
        if (cands[i].length < 3) continue;
        if (levenshtein(cands[i], word, 1) <= 1) {
          acc.score += W.fuzzy;
          acc.reasons.push("近似匹配（拼写容错）");
          break;
        }
      }
    }

    return { score: acc.score, tier: acc.tier, reasons: dedupe(acc.reasons) };
  }

  /** 统计非重叠出现次数 */
  function countHits(hay, needle) {
    if (!hay || !needle) return 0;
    var n = 0, from = 0, at;
    while ((at = hay.indexOf(needle, from)) >= 0) { n++; from = at + needle.length; }
    return n;
  }

  function dedupe(arr) {
    var seen = {}, out = [];
    for (var i = 0; i < arr.length; i++) {
      if (!seen[arr[i]]) { seen[arr[i]] = 1; out.push(arr[i]); }
    }
    return out;
  }

  /** 相关术语的间接关联：查询词命中了它 related 指向的条目名 */
  function relatedScore(term, words, index) {
      var rel = term.related || [], s = 0, reasons = [];
    for (var i = 0; i < rel.length; i++) {
      var t = index.by[rel[i]];
      if (!t) continue;
      for (var w = 0; w < words.length; w++) {
        var word = words[w];
        if (tight(t.en).indexOf(word) >= 0 || tight(t.zh).indexOf(word) >= 0) {
          s += W.relHas;
          if (reasons.indexOf("关联术语命中") < 0) reasons.push("关联术语命中");
          break;
        }
      }
    }
    return { score: Math.min(s, W.relCap), reasons: reasons };
  }

  function scoreTerm(term, parsed, index) {
    var words = parsed.terms, extras = parsed.extras;
    var total = 0, reasons = [], missed = 0, bestTier = 0;

    function apply(word, isExtra) {
      var r = scoreWord(term, word);
      if (r.score === 0) { if (!isExtra) missed++; return; }
      total += isExtra ? r.score * 0.4 : r.score;
      /* 滑窗词只用于召回，不决定命中层级，否则长名会被拆碎误判为精确命中 */
      if (!isExtra && r.tier > bestTier) bestTier = r.tier;
      reasons = reasons.concat(r.reasons);
    }

    for (var i = 0; i < words.length; i++) apply(words[i], false);
    for (var j = 0; j < extras.length; j++) apply(extras[j], true);

    var rel = relatedScore(term, words, index);
    total += rel.score;
    reasons = reasons.concat(rel.reasons);

    /* 整句短语命中额外加权：让「完全对应」的条目稳居前排 */
    var full = tight(words.join(""));
    if (full && words.length > 1 &&
        (tight(term.en).replace(/[^a-z0-9]/g, "") === full.replace(/[^a-z0-9]/g, "") ||
         tight(term.zh) === full)) {
      total += W.phraseBonus;
      bestTier = 3;
      reasons.push("整体短语匹配");
    }

    if (missed > 0) total *= Math.pow(W.missFactor, missed);

    return { score: total, tier: bestTier, reasons: dedupe(reasons).slice(0, 4) };
  }

  /* ------------------------------------------------------------------ *
   * 索引
   * ------------------------------------------------------------------ */

  /**
   * 拼音音节表（无声调，标准普通话音节集）。数据里 pinyin 可以连写
   * （"jianzhihuancun"），引擎负责切音节并据此推出首字母串，避免人工写错 py1。
   */
  /* 音节表由「声母 × 韵母」生成，不手写：漏一个音节（曾漏 ci、lei、lin、kui）
     就会让整条拼音切分失败、首字母检索静默退化。tools/pinyin-table.js 负责生成与校验。 */
  var PY_SYLLABLES = [
    "chuang","shuang","zhuang","chang","cheng","chong","chuai","chuan",
    "guang","huang","jiang","jiong","kuang","liang","niang","qiang","qiong",
    "shang","sheng","shong","shuai","shuan","xiang","xiong","zhang","zheng",
    "zhong","zhuai","zhuan","bang","beng","bian","biao","bing","cang","ceng",
    "chai","chan","chao","chen","chou","chua","chui","chun","chuo","cong",
    "cuan","dang","deng","dian","diao","ding","dong","duan","fang","feng",
    "gang","geng","gong","guai","guan","hang","heng","hong","huai","huan",
    "jian","jiao","jing","juan","kang","keng","kong","kuai","kuan","lang",
    "leng","lian","liao","ling","long","luan","mang","meng","mian","miao",
    "ming","nang","neng","nian","niao","nong","nuan","pang","peng","pian",
    "piao","ping","qian","qiao","qing","quan","rang","reng","rong","ruan",
    "sang","seng","shai","shan","shao","shen","shou","shua","shui","shun",
    "shuo","song","suan","tang","teng","tian","tiao","ting","tong","tuan",
    "wang","weng","xian","xiao","xing","xuan","yang","ying","yong","yuan",
    "zang","zeng","zhai","zhan","zhao","zhen","zhou","zhua","zhui","zhun",
    "zhuo","zong","zuan","ang","bai","ban","bao","bei","ben","bie","bin",
    "cai","can","cao","cen","cha","che","chi","cho","chu","cou","cui","cun",
    "cuo","dai","dan","dao","dei","den","die","diu","dou","dui","dun","duo",
    "eng","fan","fei","fen","ffo","fou","gai","gan","gao","gei","gen","gou",
    "gua","gui","gun","guo","hai","han","hao","hen","hou","hua","hui","hun",
    "huo","jia","jie","jin","jiu","jue","jun","kai","kan","kao","kou","kua",
    "kui","kun","kuo","lai","lan","lao","lei","len","lia","lie","lin","liu",
    "lou","lue","lun","luo","lve","mai","man","mao","mei","men","mie","min",
    "miu","mou","nai","nan","nao","nen","nie","niu","nou","nuo","nve","pai",
    "pao","pei","pen","pie","pin","pou","qia","qie","qin","qiu","que","qun",
    "ran","rao","ren","rou","rua","rui","run","ruo","sai","san","sao","sen",
    "sha","she","shi","sho","shu","sou","sui","sun","suo","tai","tan","tao",
    "tie","tou","tui","tun","tuo","wai","wan","wei","wen","xia","xie","xin",
    "xiu","xue","xun","yan","yao","yin","you","yue","yun","zai","zan","zao",
    "zen","zha","zhe","zhi","zho","zhu","zou","zui","zun","zuo","ai","an",
    "ao","ba","bi","bo","bu","ca","ce","ci","co","cu","da","de","di","du",
    "ei","en","er","fa","fo","fu","ga","ge","gu","ha","he","hu","ji","ju",
    "ka","ke","ku","la","le","li","lu","lv","ma","me","mi","mo","mu","na",
    "ne","ni","nu","nv","ou","pa","pi","po","pu","qi","qu","ra","re","ri",
    "ro","ru","sa","se","si","so","su","ta","te","ti","tu","wa","wo","wu",
    "xi","xu","ya","ye","yi","yo","yu","za","ze","zi","zo","zu","a","e","o"
  ];

  var PY_SET = {};
  (function () { for (var i = 0; i < PY_SYLLABLES.length; i++) PY_SET[PY_SYLLABLES[i]] = 1; })();

  /**
   * 把连写拼音切成恰好 want 个音节（记忆化搜索）。
   * want 来自名字里的汉字数，这是比「最长匹配优先」强得多的约束：
   * rengong 必须切成 ren+gong，而不是 reng+o+ng……，因为后者凑不出目标段数。
   * 切不出来返回 null，由调用方退回整串，不会把数据弄坏。
   */
  function segmentSyllables(s, want) {
    var n = s.length;
    if (!n || !want || want > n) return null;
    var memo = {};
    function go(pos, left) {
      if (pos === n) return left === 0 ? [] : null;
      if (left === 0) return null;
      var key = pos * 32 + left;
      if (memo[key] !== undefined) return memo[key];
      var best = null;
      for (var len = Math.min(6, n - pos); len >= 1; len--) {
        var cand = s.substr(pos, len);
        if (!PY_SET[cand]) continue;
        var rest = go(pos + len, left - 1);
        if (rest) { best = [cand].concat(rest); break; }
      }
      memo[key] = best;
      return best;
    }
    return go(0, want);
  }

  /** 名字里的汉字个数，即拼音应有的音节数 */
  function cjkCount(s) {
    return (String(s || "").match(/[\u3400-\u9fff]/g) || []).length;
  }

  /**
   * 数据里 pinyin 可以按音节空格分隔，也可以连写。
   * 连写时按汉字数定长切分；切不动（含外来词、数字、括号注解）就退回整串，
   * 至少保证按全拼检索还可用。
   */
  function splitPinyin(py, zh) {
    var raw = norm(py || "");
    if (!raw) return [];
    if (/\s/.test(raw)) {
      /* 已分音节：把每一段再按字数拆开（数据里偶有 "xuexi" 挤成一段的情况） */
      var parts = raw.split(/\s+/).filter(Boolean), flat = [];
      parts.forEach(function (p) {
        if (PY_SET[p] || !/^[a-z]+$/.test(p)) { flat.push(p); return; }
        var sub = segmentSyllables(p, p.length > 1 ? 2 : 1) || segmentSyllables(p, 3) || null;
        if (sub) flat = flat.concat(sub); else flat.push(p);
      });
      return flat;
    }
    var s = raw.replace(/[^a-z0-9]/g, "");
    if (!s) return [];
    if (/[^a-z]/.test(s)) return [s];                 /* 含数字，如 l1l2zhengzehua */
    var want = cjkCount(zh);
    var seg = want ? segmentSyllables(s, want) : null;
    if (seg) return seg;
    for (var k = 2; k <= 8; k++) {                    /* 字数对不上时再试邻近段数 */
      seg = segmentSyllables(s, k);
      if (seg) return seg;
    }
    return [s];
  }

  /**
   * pyFull / py1 在索引时自动补齐，数据只需写 pinyin。
   */
  function ensureInitials(t) {
    var sil = splitPinyin(t.pinyin, t.zh);
    t.pyFull = sil.join("");
    t.py1 = sil.map(function (s) { return s.charAt(0); }).join("");
    /* 纯英文名（无拼音）用英文名本身兜底，保证按英文名检索仍然可用 */
    if (!sil.length) t.pyFull = norm(t.en).replace(/[^a-z0-9]/g, "");
  }

  function buildIndex(terms) {
    var by = {}, list = [];
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t || !t.id) continue;
      if (by[t.id]) continue;      /* id 冲突时保留先注册的（数据文件加载顺序即优先级） */
      ensureInitials(t);
      by[t.id] = t;
      list.push(t);
    }
    /* 第二遍：related 只保留确实存在的目标，清掉数据里的占位写法（xxx-ref 之类） */
    list.forEach(function (t) {
      if (!t.related || !t.related.length) return;
      var kept = [];
      t.related.forEach(function (r) {
        if (by[r] && r !== t.id && kept.indexOf(r) < 0) kept.push(r);
      });
      t.related = kept;
    });
    return { list: list, by: by };
  }

  /* ------------------------------------------------------------------ *
   * 对外 API
   * ------------------------------------------------------------------ */

  var AI = {
    CATEGORIES: CATEGORIES,
    LEVELS: LEVELS,
    WEIGHTS: W,
    norm: norm,
    tight: tight,
    queryTerms: queryTerms,
    levenshtein: levenshtein,

    _index: null,

    terms: function () {
      if (!this._index) this.reindex();
      return this._index.list;
    },

    reindex: function () {
      this._index = buildIndex(global.AI_TERMS || []);
      return this._index;
    },

    get: function (id) {
      if (!this._index) this.reindex();
      return this._index.by[id] || null;
    },

    /**
     * 主搜索入口。
     * @param {string} q  用户输入
     * @param {object} [opts] { cat, level, limit }
     * @returns {Array<{term, score, relevance, reasons}>}
     */
    search: function (q, opts) {
      opts = opts || {};
      if (!this._index) this.reindex();
      var index = this._index;
      var parsed = analyze(q);

      var pool = index.list.filter(function (t) {
        if (opts.cat && opts.cat !== "all" && t.cat !== opts.cat) return false;
        if (opts.level && opts.level !== "all" && t.level !== opts.level) return false;
        return true;
      });

      if (!parsed.terms.length) {
        return pool.map(function (t) {
          return { term: t, score: 0, relevance: 0, reasons: [] };
        });
      }

      var scored = [];
      for (var i = 0; i < pool.length; i++) {
        var r = scoreTerm(pool[i], parsed, index);
        if (r.score > 0) {
          /* 命中层级优先：名称完全相等的条目不该被「名字里带这个词」的条目挤下去 */
          var boosted = r.score * (1 + 0.6 * r.tier);
          scored.push({ term: pool[i], score: boosted, tier: r.tier, reasons: r.reasons });
        }
      }

      scored.sort(function (a, b) {
        if (b.tier !== a.tier) return b.tier - a.tier;
        if (b.score !== a.score) return b.score - a.score;
        var la = LEVELS[a.term.level] ? LEVELS[a.term.level].weight : 0;
        var lb = LEVELS[b.term.level] ? LEVELS[b.term.level].weight : 0;
        if (lb !== la) return lb - la;
        if (tight(a.term.zh).length !== tight(b.term.zh).length) {
          return tight(a.term.zh).length - tight(b.term.zh).length;
        }
        return norm(a.term.en) < norm(b.term.en) ? -1 : 1;
      });

      var top = scored.length ? scored[0].score : 1;
      scored.forEach(function (s) {
        s.relevance = Math.max(1, Math.round((s.score / top) * 100));
      });

      if (opts.limit) scored = scored.slice(0, opts.limit);
      return scored;
    },

    /** 按分类分组，组内按中文名拼音/字符排序，供浏览页使用 */
    groupByCategory: function (order) {
      var terms = this.terms();
      var groups = {};
      terms.forEach(function (t) {
        if (!groups[t.cat]) groups[t.cat] = [];
        groups[t.cat].push(t);
      });
      Object.keys(groups).forEach(function (k) {
        groups[k].sort(function (a, b) {
          var pa = tight(a.pinyin) || norm(a.en);
          var pb = tight(b.pinyin) || norm(b.en);
          return pa < pb ? -1 : pa > pb ? 1 : 0;
        });
      });
      var keys = order || Object.keys(CATEGORIES);
      return keys.filter(function (k) { return groups[k]; })
                 .map(function (k) { return { cat: k, meta: CATEGORIES[k], items: groups[k] }; });
    },

    /** 只给「同分类 + 被引用」的弱关联排序，用于详情页相关推荐 */
    suggestFor: function (term, limit) {
      if (!this._index) this.reindex();
      var index = this._index, out = [], seen = {};
      (term.related || []).forEach(function (id) {
        var t = index.by[id];
        if (t && !seen[t.id]) { seen[t.id] = 1; out.push({ term: t, via: "相关" }); }
      });
      /* 反向链接：谁在 related 里提到了我 */
      index.list.forEach(function (t) {
        if (t.id === term.id || seen[t.id]) return;
        if ((t.related || []).indexOf(term.id) >= 0) { seen[t.id] = 1; out.push({ term: t, via: "被引用" }); }
      });
      /* 同分类补齐 */
      index.list.forEach(function (t) {
        if (t.id === term.id || seen[t.id]) return;
        if (t.cat === term.cat) { seen[t.id] = 1; out.push({ term: t, via: "同类" }); }
      });
      return out.slice(0, limit || 8);
    },

    /** 转义 HTML，避免数据里的尖括号破坏页面 */
    esc: function (s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },

    /** 把命中的关键词高亮出来 */
    highlight: function (text, q) {
      var s = this.esc(text);
      var words = this.queryTerms(q);
      if (!words.length) return s;
      var n = this.norm(text);
      var out = "", i = 0;
      var marks = [];
      words.forEach(function (w) {
        if (w.length < 2) return;
        var from = 0, at;
        while ((at = n.indexOf(w, from)) >= 0) {
          marks.push([at, at + w.length]);
          from = at + w.length;
        }
      });
      if (!marks.length) return s;
      marks.sort(function (a, b) { return a[0] - b[0]; });
      var merged = [];
      marks.forEach(function (m) {
        var last = merged[merged.length - 1];
        if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1]);
        else merged.push(m.slice());
      });
      merged.forEach(function (m) {
        out += s.slice(i, m[0]) + "<mark>" + s.slice(m[0], m[1]) + "</mark>";
        i = m[1];
      });
      return out + s.slice(i);
    },

    /** 详情页链接：同时带 ?id= 与 #hash，file:// 与 http:// 都能用 */
    termUrl: function (id) {
      return "term.html?id=" + encodeURIComponent(id);
    },

    /** 从 URL 取 id：优先 ?id=，退化到 #hash */
    idFromLocation: function () {
      var search = global.location.search || "";
      var m = /[?&]id=([^&#]+)/.exec(search);
      if (m) { try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; } }
      var hash = (global.location.hash || "").replace(/^#/, "");
      return hash ? decodeURIComponent(hash) : "";
    },

    /** 搜索页链接 */
    searchUrl: function (q) {
      return "search.html?q=" + encodeURIComponent(q || "");
    }
  };

  global.AIGlossary = AI;
})(typeof window !== "undefined" ? window : globalThis);
