/*
 * AI 术语词典 · 分类数据：cat = "agent"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
    {
      id: "react", en: "ReAct", zh: "推理与行动交替",
      aka: ["ReAct 范式", "Reasoning + Acting"], pinyin: "tui li yu xing dong jiao ti",
      cat: "agent", level: "core",
      def: "让模型交替产出「思考—调用工具—读结果」的循环，而不是一次性给答案。",
      long: "它把推理轨迹与外部动作交织起来：先想下一步要查什么，调用工具，把观察结果读回来再想。相比纯思维链，它能用真实观察纠偏；相比一次性规划，它能中途改道。局限也很清楚：每一步都要一次完整前向，误差与成本都按步数累积，且循环终止依赖模型自己判断「够了」。",
      avoid: ["把 ReAct 说成一种算法（它是提示与控制的组织范式）"],
      related: ["agent", "tool-use", "planning", "task-decomposition"],
      tags: ["智能体", "范式"]
    },
    {
      id: "agent-memory", en: "agent memory", zh: "智能体记忆",
      aka: ["长期记忆", "会话记忆", "memory"], pinyin: "zhi neng ti ji yi",
      cat: "agent", level: "core",
      def: "把跨轮次或跨会话的信息存到模型之外，下次需要时再取回上下文。",
      long: "模型本身没有可写的持久状态，所谓记忆全靠外部存储加检索：把历史摘要、事实条目、偏好写进数据库，再按相关性塞回上下文窗口。它解决的问题与 RAG 相同，但写入时机由系统决定，因此多了「该记什么、何时更新、如何失效」这三个没有标准答案的设计决策。",
      avoid: ["以为模型自己会记住上次会话"],
      related: ["rag", "context-window", "agent", "embedding"],
      tags: ["智能体", "存储"]
    },
    {
      id: "computer-use", en: "computer use", zh: "电脑操作",
      aka: ["GUI 操作", "屏幕代理", "agent with GUI"], pinyin: "dian nao cao zuo",
      cat: "agent", level: "advanced",
      def: "让模型直接看屏幕截图并输出点击、输入等动作来操作图形界面。",
      long: "它绕开了「必须有 API」的限制，代价是可靠性下降：界面识别可能错、坐标定位可能偏、且每一步的副作用难以回滚。与工具调用相比，它把结构化接口换成了像素与鼠标事件，出错面从参数校验扩大到整个屏幕。因此实际部署普遍要求人工确认关键步骤。",
      avoid: ["把它与工具调用混为一谈（一个走界面，一个走接口）"],
      related: ["agent", "tool-use", "multimodal", "vision-transformer"],
      tags: ["智能体", "风险"]
    },
    {
      id: "guardrails", en: "guardrails", zh: "护栏",
      aka: ["安全护栏", "输出约束", "safeguards"], pinyin: "hu lan",
      cat: "agent", level: "core",
      def: "在模型前后加的检查与约束，用来拦截不该有的输入输出或动作。",
      long: "典型形态是输入分类器、输出格式校验、动作白名单、权限分级与人工确认关口。它的价值在于把「模型倾向不这么做」变成「系统不允许这么做」——前者是概率，后者是机制。但护栏只能覆盖设计者想到的情形，提示注入与组合式绕过正是打在这个缺口上。",
      avoid: ["把对齐（训练出的倾向）与护栏（外部机制）混为一谈"],
      related: ["prompt-injection", "jailbreak", "alignment", "tool-use"],
      tags: ["安全", "工程"]
    },
    {
      id: "model-context-protocol", en: "Model Context Protocol", zh: "模型上下文协议",
      aka: ["MCP", "工具与数据源接入协议"], pinyin: "mo xing shang wen xia xie yi",
      cat: "agent", level: "advanced",
      def: "用统一接口把外部数据源与工具暴露给模型应用的开放协议。",
      long: "它想解决的是「每接一个工具就要写一套胶水」的碎片化问题：把资源、工具、提示三类能力标准化，服务端与客户端各自实现一次即可互通。协议本身不提供安全保证——一旦接入不可信的服务端，工具描述与返回内容都成了提示注入的入口，因此权限与来源审查必须自己补上。",
      avoid: ["以为采用协议就自动安全"],
      related: ["tool-use", "agent", "rag", "prompt-injection"],
      tags: ["接口", "生态"]
    },
    {
      id: "agent", en: "agent", zh: "智能体", aka: ["代理", "AI 智能体"], pinyin: "zhi neng ti",
      cat: "agent", level: "core", src: "glossary",
      def: "能规划、调用工具、观察结果并继续推进的模型系统。",
      long: "与一次问答的本质差别在于闭环：模型的输出会改变环境，环境的新状态又回到模型输入。这带来能力，也带来风险面——错误会被后续步骤放大，权限与副作用必须谨慎设计。多数所谓「智能体」其实就是循环调用模型加一层工具协议，规划能力仍是瓶颈。",
      avoid: ["代理（易与网络代理混淆）"],
      related: ["tool-use", "rag", "planning"], tags: ["应用", "系统"]
    },
    {
      id: "tool-use", en: "tool use / function calling", zh: "工具调用", aka: ["函数调用", "Function Calling", "插件"], pinyin: "gong ju diao yong",
      cat: "agent", level: "core", src: "glossary",
      def: "模型输出结构化请求，交由外部系统执行。",
      long: "模型本身不执行任何操作，它只是生成符合约定 schema 的一段文本；真正的动作发生在外部运行时，结果再以文本形式塞回上下文。「保留函数调用给代码语境」的约定有道理：这里的函数没有可执行体，只有一份描述。可靠性取决于 schema 遵循能力与参数抽取准确度。",
      avoid: ["以为模型真的执行了代码", "工具与函数概念不分（后者偏代码语境）"],
      related: ["agent", "rag", "system-prompt"], tags: ["应用", "接口"]
    },
    {
      id: "rag", en: "RAG", zh: "检索增强生成", aka: ["RAG", "检索增强"], pinyin: "jian suo zeng qiang sheng cheng",
      cat: "agent", level: "core", src: "glossary",
      def: "先检索资料，再让模型基于资料作答。",
      long: "它把「知识存在哪里」从权重搬到外部语料：更新知识不必重训，还能给出出处。效果几乎完全由检索质量决定——召回错了，生成再强也是「流畅地照着错误材料写」。常见误区是把 RAG 当作事实性保险：它保证的是「参考了给定材料」，不保证模型一定遵循。",
      avoid: ["RAG（首次出现必须展开）", "把 RAG 与微调混为一种「注入知识」手段"],
      related: ["hallucination", "embedding", "agent"], tags: ["应用", "检索"]
    },
    {
      id: "planning", en: "planning", zh: "规划",
      aka: ["任务规划", "规划能力"], pinyin: "gui hua",
      cat: "agent", level: "core",
      def: "把目标拆成一串可执行步骤，并能在环境反馈下修正后续步骤。",
      long: "智能体最核心的能力，也最脆弱：早期步骤的小误解会在后续被逐步放大，而模型无法预知自己会错。主流做法是「边做边改」而非一次排完计划，配合外部检查点（测试通过、返回值合法）来判断是否继续。把思维链当成规划能力是常见的概念滑动：写下步骤不等于会权衡与回溯。",
      avoid: ["把思维链等同于规划", "以为更长的提示能补足规划能力"],
      related: ["agent", "chain-of-thought", "tool-use", "task-decomposition"],
      tags: ["智能体", "能力"]
    },
    {
      id: "task-decomposition", en: "task decomposition", zh: "任务分解",
      aka: ["子任务拆分", "子目标分解"], pinyin: "ren wu fen jie",
      cat: "agent", level: "core",
      def: "把复杂目标切成可独立验证的小步骤，逐步完成并据结果调整后续。",
      long: "智能体可靠性提升的主要手段，有效原因很实在：小步骤的输出短、可用外部判据检查，错误能在局部被发现而不必推倒重来。反过来，如果分解本身错了（漏掉前提、顺序颠倒），再好的执行也救不回来，所以分解质量通常需要人给约束或给出显式计划。",
      avoid: ["以为「拆得越细越好」"],
      related: ["planning", "agent", "chain-of-thought", "tool-use"],
      tags: ["智能体", "方法"]
    }
  );
})(window);
