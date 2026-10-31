/*
 * AI 术语词典 · 分类数据：cat = "safety"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
    {
      id: "benchmark", en: "benchmark", zh: "基准测试", aka: ["基准", "评测集", "benchmark suite"], pinyin: "ji zhun ce shi",
      cat: "safety", level: "core", src: "glossary",
      def: "标准化任务集，用于横向比较模型能力。",
      long: "价值来自可比性，前提是数据不重叠。现实困难是污染：基准题目进了预训练语料，高分可能只是背过。更深层的问题是代理指标一旦成为优化目标就不再中立（Goodhart 定律）——刷榜与真实能力可以长期背离。因此基准分数应被读作「在这套题上的表现」。",
      avoid: ["跑分", "把榜单名次等同于综合能力"],
      related: ["saturation", "contamination", "emergent-ability"], tags: ["评估", "治理"]
    },
    {
      id: "saturation", en: "saturation", zh: "（基准）饱和", aka: ["饱和", "天花板效应"], pinyin: "bao he",
      cat: "safety", level: "advanced", src: "glossary",
      def: "模型分数逼近上限，导致区分度消失。",
      long: "饱和不是好消息而是信号：这套题已经无法区分不同模型，继续在上面刷分没有信息量。原因是题目难度分布有上限，而能力可以一直推进。应对方式是提升难度、增加隐藏测试集或换成连续指标——注意连续指标往往能重新揭示「涌现」其实是平滑的。",
      avoid: ["把饱和读作「模型已到极限」"],
      related: ["benchmark", "emergent-ability", "contamination"], tags: ["评估"]
    },
    {
      id: "jailbreak", en: "jailbreak", zh: "越狱", aka: ["越狱攻击", "jailbreaking"], pinyin: "yue yu",
      cat: "safety", level: "core", src: "glossary",
      def: "用特殊输入绕过安全限制。",
      long: "它不是破解权重，而是操纵条件分布：把请求包装进角色扮演、虚构场景、低资源语言或长前缀里，使「有害续写」在当前上下文成为高概率。这说明安全行为是学出来的表层倾向，而不是结构性约束。对抗手段与规避手段呈持续军备竞赛，没有一劳永逸的方案。",
      avoid: ["破甲", "把它类比为系统提权"],
      related: ["prompt-injection", "red-teaming", "alignment"], tags: ["安全", "攻击"]
    },
    {
      id: "prompt-injection", en: "prompt injection", zh: "提示注入", aka: ["提示词注入", "间接注入"], pinyin: "ti shi zhu ru",
      cat: "safety", level: "advanced", src: "glossary",
      def: "把指令藏进被处理的数据里，劫持模型行为。",
      long: "危害的根源是模型没有「指令」与「数据」的区分机制——两者都是同一串词元。因此在智能体场景中最危险：网页或邮件里的文字若被当成指令执行，就构成对真实世界的攻击面。这比越狱更难防，因为防御者无法预知哪些数据是敌意的。",
      avoid: ["把它与越狱混为一谈（越狱是用户主动，注入是第三方植入）"],
      related: ["jailbreak", "agent", "tool-use"], tags: ["安全", "攻击"]
    },
    {
      id: "red-teaming", en: "red teaming", zh: "红队测试", aka: ["红队", "对抗测试"], pinyin: "hong dui ce shi",
      cat: "safety", level: "core", src: "glossary",
      def: "主动以攻击者视角寻找系统的失效模式。",
      long: "与「跑一遍安全检查清单」的差别在于心态：红队的目的是找出没想到的失效，而不是确认想到的都已修复。人工红队能挖出语境化的复合攻击，但成本高且不可复现；自动化红队可规模扫描却容易漏掉需要长期互动的漏洞。两者互补，且都受限于攻击者的想象力。",
      avoid: ["把红队当合规流程走过场"],
      related: ["jailbreak", "scalable-oversight", "alignment"], tags: ["安全", "方法"]
    },
    {
      id: "contamination", en: "data contamination", zh: "数据污染",
      aka: ["基准污染", "测试集泄漏"], pinyin: "shu ju wu ran",
      cat: "safety", level: "core",
      def: "评测题目的内容出现在训练语料里，使分数不再反映真实能力。",
      long: "这是基准分数最难处理的可信度问题：网络语料规模大到几乎必然包含公开评测集，模型「答对」可能只是背过。常见对策有隐藏测试集、构造同构新题（Controlled Benchmarking）、n-gram 查重、以及从分数里剔除可疑提升。判断方法之一是比较原题与改写题的成绩差距。",
      avoid: ["把它与训练数据里的脏数据（低质量文本）混为一谈"],
      related: ["benchmark", "saturation", "evaluation-methods"],
      tags: ["评估", "可信度"]
    },
    {
      id: "evaluation-methods", en: "evaluation methodology", zh: "评测方法学",
      aka: ["评测口径", "指标设计"], pinyin: "ping ce fang fa xue",
      cat: "safety", level: "advanced",
      def: "关于「怎么测才算数」的方法约定：指标形式、数据隔离、重复次数与统计显著性。",
      long: "同一个模型换一种打分口径就能从「不行」变「很强」：二值判对与逐步得分给出的曲线形状完全不同，前者容易制造跳变（涌现错觉），后者常显示能力是平滑增长的。自动评分（LLM-as-judge）便宜但有偏好与位置偏差，人工评审可靠却难复现。任何对比都必须固定口径、报出方差才有意义。",
      avoid: ["只报单一分数不报口径", "跨数据集直接比较指标"],
      related: ["benchmark", "saturation", "contamination", "emergent-ability", "calibration"],
      tags: ["评估", "方法论"]
    }
  );
})(window);
