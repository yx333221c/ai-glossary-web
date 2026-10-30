/*
 * AI 术语词典 · 数据分片四：智能体 / 多模态 / 前沿争议 / 推理工程 的补强条目
 * 这一片主要填补分片一~三在 agent / multimodal / frontier / inference 上的稀疏区。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
    /* ---------------- 智能体 ---------------- */
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

    /* ---------------- 多模态 ---------------- */
    {
      id: "vision-language-model", en: "Vision-Language Model", zh: "视觉语言模型",
      aka: ["VLM", "多模态大模型", "LVM"], pinyin: "shi jue yu yan mo xing",
      cat: "multimodal", level: "core",
      def: "同时接受图像与文本输入、以文本作答的模型，通常由视觉编码器接语言主干构成。",
      long: "主流做法是让视觉编码器把图像压成若干向量，再用一层投影把它们塞进语言模型的词元序列里，此后模型「看」图与「读」词没有区别。这带来一个直接后果：图像分辨率越高、占的上下文位越多。它的短板集中在需要精确定位与计数的任务上，因为视觉表征本身是语义导向而非几何导向的。",
      avoid: ["把 VLM 与「图文生成模型」混用（后者要能出图）"],
      related: ["multimodal", "clip", "patch", "vision-transformer"],
      tags: ["多模态", "架构"]
    },
    {
      id: "image-generation", en: "text-to-image generation", zh: "文本生成图像",
      aka: ["文生图", "图像合成"], pinyin: "wen ben sheng cheng tu xiang",
      cat: "multimodal", level: "core",
      def: "按文字描述合成图像，主流路线是先学潜空间再学逐步去噪。",
      long: "把像素压进低维潜空间，再训练模型从纯噪声一步步还原，比直接在像素上做扩散便宜得多。文字通过文本编码器进入，作为每一步去噪的条件。这一框架的副作用是「提示词与结果的对应关系是统计性的」：细粒度控制（指定数量、位置、文字）需要额外机制，而非天然具备。",
      avoid: ["以为模型「理解」了提示词的字面数量与空间约束"],
      related: ["diffusion-model", "clip", "vector-quantization", "multimodal"],
      tags: ["生成", "视觉"]
    },
    {
      id: "image-text-alignment", en: "image-text alignment", zh: "图文对齐",
      aka: ["跨模态对齐", "对比对齐"], pinyin: "tu wen dui qi",
      cat: "multimodal", level: "advanced",
      def: "让图像与描述它的文本落到同一表征空间的可比位置上。",
      long: "靠海量弱配对图文对训练，用对比损失把配对的拉近、批次内其余推开。它是零样本图像分类与多数视觉语言模型的地基。因为监督信号来自网络自带的图注，对齐质量受图注噪声直接影响：图注没提到的属性，模型自然不会区分。",
      avoid: ["把它与人类反馈对齐（alignment）混用同一个中文词"],
      related: ["clip", "infonce", "contrastive-learning", "zero-shot"],
      tags: ["多模态", "训练"]
    },

    /* ---------------- 前沿与争议 ---------------- */
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

    /* ---------------- 推理工程 ---------------- */
    {
      id: "speculative-decoding", en: "speculative decoding", zh: "投机解码",
      aka: ["草拟-验证", "draft-verify", "预测解码"], pinyin: "tou ji jie ma",
      cat: "inference", level: "advanced",
      def: "用小模型先草拟若干词元，再让大模型一次并行验证，从而在不改变输出的前提下提速。",
      long: "关键在于验证是逐位置比对概率，被拒的词元会退回大模型自己的分布重采，因此最终输出的分布与大模型单独解码严格一致——加速不是以牺牲质量换来的。收益取决于草拟命中率：领域越顺、命中率越高，收益越大；两者分布差得远时反而更慢。",
      avoid: ["以为它会略微降低输出质量（数学上等价）"],
      related: ["sampling", "kv-cache", "serving-latency", "memory-bandwidth"],
      tags: ["优化", "解码"]
    },
    {
      id: "continuous-batching", en: "continuous batching", zh: "连续批处理",
      aka: ["in-flight batching", "动态批处理"], pinyin: "lian xu pi chu li",
      cat: "inference", level: "advanced",
      def: "以词元为单位重组批次：谁生成完就立刻退出，新请求随时插入。",
      long: "固定批次要等最长的那条完成才能收工，短请求白白占着资源。连续批处理让批次成员随时变化，显存与算力利用率明显提升，是高并发服务的基本盘。实现上要配合分页式的缓存管理，否则变长序列会留下大量碎片。",
      avoid: ["把它与静态批处理混为一谈"],
      related: ["throughput", "batch-size", "serving-latency", "kv-cache"],
      tags: ["部署", "调度"]
    },
    {
      id: "prefix-caching", en: "prefix caching", zh: "前缀缓存",
      aka: ["提示缓存", "prompt caching"], pinyin: "qian zhui huan cun",
      cat: "inference", level: "advanced",
      def: "复用多个请求共用的那段前缀已算好的键值缓存，跳过重复的提示处理。",
      long: "长系统提示、多轮对话的历史、反复附上的同一份文档，都是天然的可复用前缀。命中后首字延迟与成本同时下降，这也是把大量上下文塞进提示变得经济的原因。前提是前缀必须逐词元完全一致——在前面加个时间戳就会让缓存整段失效。",
      avoid: ["以为只要内容相同就能命中（必须词元级一致且位置连续）"],
      related: ["kv-cache", "context-window", "throughput", "system-prompt"],
      tags: ["优化", "成本"]
    },
                                {
      id: "inference-scaling", en: "inference scaling", zh: "推理扩展",
      aka: ["test-time scaling", "推理时扩展", "思考预算"], pinyin: "tui li kuo zhan",
      cat: "training", level: "advanced",
      def: "训练完成后，通过让模型多生成、多尝试来换取更高准确率的扩展方式。",
      long: "与训练时扩展（规模定律）互补：同一权重下，允许更长推理链、采样多条再择优、或让模型自我校验，都能在难题上换到分数，且这条曲线也呈现出可预测的幂律形状。代价是成本与延迟不再固定，且「多写」不保证「写对」——跑偏的长链条同样烧钱。它把算力预算从训练端部分转移到了使用端。",
      avoid: ["把它说成模型变强了（是同权重下多花了生成预算）"],
      related: ["reasoning-token", "scaling-law", "chain-of-thought", "sampling"],
      tags: ["前沿", "成本"]
    }
  );
})(window);
