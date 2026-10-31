/*
 * AI 术语词典 · 分类数据：cat = "frontier"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
    {
      id: "sycophancy", en: "sycophancy", zh: "迎合",
      aka: ["谄媚", "讨好倾向", "拍马屁"], pinyin: "ying he",
      cat: "frontier", level: "advanced",
      def: "模型倾向附和用户已表明的立场，而不是坚持自己原本更对的判断。",
      long: "这是偏好优化的直接产物：人类标注者更容易给「顺着我说」的回答高分，于是这个倾向被写进了策略。危险之处在于它伪装成能力——用户给出错误前提时，模型顺着改口，错误就被固化。检测办法很直接：同一问题分别附上对立立场再问，看答案是否随之翻转。",
      avoid: ["把迎合当成「模型有情商」"],
      related: ["rlhf", "reward-model", "alignment", "reward-shaping"],
      tags: ["对齐", "缺陷"]
    },
    {
      id: "reward-hacking", en: "reward hacking", zh: "奖励作弊",
      aka: ["钻奖励空子", "Goodhart 效应", "指标操纵"], pinyin: "jiang li zuo bi",
      cat: "frontier", level: "advanced",
      def: "策略找到能拿高分但不符合真实意图的行为，因为优化的是代理指标。",
      long: "奖励模型只是人类偏好的近似，一旦成为优化目标，模型就会去攻它最薄弱的相关特征：偏爱长回答就灌水，偏爱结构化就无脑列表，偏爱自信语气就编得更笃定。这与基准刷分是同一机制的两种表现——指标与它想衡量的东西之间的缝隙，会被优化过程精确找到并撑大。",
      avoid: ["把奖励作弊归因于「模型想骗人」"],
      related: ["reward-model", "rlhf", "benchmark", "reward-shaping", "alignment"],
      tags: ["对齐", "风险"]
    },
    {
      id: "interpretability", en: "interpretability", zh: "可解释性研究",
      aka: ["机制可解释性", "mech interp", "神经可解释性"], pinyin: "ke jie xi xing",
      cat: "frontier", level: "advanced",
      def: "从内部激活与权重反推模型到底怎么算出这个结果，而不是只看输入输出。",
      long: "方法包括在残差流上定位信息载体、把神经元与注意力头按行为归因、构造反事实干预来验证因果作用。已有工作确实找到了可复现的机制（如某类算术回路、间接负注意力头）。但要注意「能解释局部机制」与「能解释整体行为」之间还差得很远，且神经元普遍存在多义（叠加现象），把单个激活直接译成人类概念容易过度解读。",
      avoid: ["把注意力图或单神经元激活当作可靠解释", "夸大当前进展为「已经读懂模型」"],
      related: ["attention", "residual-connection", "red-teaming", "scalable-oversight"],
      tags: ["前沿", "方法"]
    },
    {
      id: "artificial-general-intelligence", en: "Artificial General Intelligence", zh: "通用人工智能",
      aka: ["AGI"], pinyin: "tong yong ren gong zhi neng",
      cat: "frontier", level: "advanced",
      def: "在任意认知任务上都不逊于人的假想系统；目前各家定义并不一致。",
      long: "它更像方向标签而非可测结论：不同机构给出的判据差别很大，有的强调自主完成长时程工作，有的强调经济替代率，也有的拒绝给出定义。争议点在于「跨任务泛化到什么程度算达标」尚无共识阈值。本站把它归入争议概念：引用时应当同时说明所用的具体判据，否则这个词不携带信息。",
      avoid: ["把 AGI 当作有公认标准的工程里程碑", "用「距 AGI 还有几年」的断言替代判据"],
      related: ["emergent-ability", "scaling-law", "benchmark", "superintelligence"],
      tags: ["前沿", "争议"]
    },
    {
      id: "superintelligence", en: "superintelligence", zh: "超级智能",
      aka: ["超人智能", "ASI"], pinyin: "chao ji zhi neng",
      cat: "frontier", level: "advanced",
      def: "在几乎所有认知活动上远超人类的假想系统，是安全讨论的主要假设对象。",
      long: "相关论证集中在两点：能力一旦超过人类，监督成本会随之上升（可扩展监督问题）；以及目标若未精确对齐，强大能力会放大偏差而非纠正它。这些都建立在「能力可以比判断力先到达」这一假设上，而该假设本身有争议。把它当作工程预测来引用是不合适的，应当作为风险推演的前提。",
      avoid: ["把超级智能的论述当作已验证的事实", "与 AGI 混用"],
      related: ["scalable-oversight", "artificial-general-intelligence", "alignment"],
      tags: ["前沿", "安全"]
    },
    {
      id: "emergent-ability", en: "emergent ability", zh: "涌现能力", aka: ["涌现", "emergence"], pinyin: "yong xian neng li",
      cat: "frontier", level: "advanced", src: "glossary",
      def: "规模跨过某阈值后才出现的能力。",
      long: "多步算术、思维链带来的推理提升常被视为涌现。本站标注此为争议概念：有研究指出，若用连续指标（如逐步正确率）替代「答对与否」的跳变指标，所谓涌现只是度量方式造成的错觉，能力其实在平滑增长。写作时建议保留英文原词并注明争议。",
      avoid: ["把涌现说成已被证实的现象", "神秘化表述（「量变引起质变」不算解释）"],
      related: ["scaling-law", "chain-of-thought", "benchmark"], tags: ["争议", "大模型"]
    },
    {
      id: "scalable-oversight", en: "scalable oversight", zh: "可扩展监督", aka: ["可扩展的监督", "weak-to-strong"], pinyin: "ke kuo zhan jian du",
      cat: "frontier", level: "advanced", src: "glossary",
      def: "如何用较弱的人监督较强的模型。",
      long: "当模型输出超出人类可核验范围（几百页证明、复杂代码库）时，逐条人工审核在成本上已经不可行，但 RLHF 式偏好标注恰好不需要标注者比模型更强——这本身可能是个隐患。围绕这个问题的思路包括分层抽查、模型互评、弱到强泛化，都还没有公认答案。",
      avoid: ["把它简化为「加人工审核」"],
      related: ["red-teaming", "rlhf", "alignment"], tags: ["对齐", "前沿"]
    },
    {
      id: "reasoning-token", en: "reasoning token", zh: "推理词元",
      aka: ["思考词元", "test-time compute", "测试时算力"], pinyin: "tui li ci yuan",
      cat: "frontier", level: "advanced",
      def: "把算力花在生成中间步骤上：最终答案之前先生成多少词元，决定这次推理花多少钱。",
      long: "传统扩展是训练时多花算力（规模定律），这条路转向推理时多花算力——同一基座，允许它写更长中间过程，难题表现更好，于是出现「算力换智能」的新权衡。代价是同一问题的成本与延迟不再固定，且更多词元不保证更正确：跑偏的长链条同样烧钱。该方向仍在快速演化，本站标注为前沿概念。",
      avoid: ["把它说成「模型变聪明了」（是花了更多生成预算）"],
      related: ["chain-of-thought", "scaling-law", "inference", "temperature"],
      tags: ["前沿", "成本"]
    }
  );
})(window);
