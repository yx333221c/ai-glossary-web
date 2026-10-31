/*
 * AI 术语词典 · 分类数据：cat = "training"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
    {
      id: "inference-scaling", en: "inference scaling", zh: "推理扩展",
      aka: ["test-time scaling", "推理时扩展", "思考预算"], pinyin: "tui li kuo zhan",
      cat: "training", level: "advanced",
      def: "训练完成后，通过让模型多生成、多尝试来换取更高准确率的扩展方式。",
      long: "与训练时扩展（规模定律）互补：同一权重下，允许更长推理链、采样多条再择优、或让模型自我校验，都能在难题上换到分数，且这条曲线也呈现出可预测的幂律形状。代价是成本与延迟不再固定，且「多写」不保证「写对」——跑偏的长链条同样烧钱。它把算力预算从训练端部分转移到了使用端。",
      avoid: ["把它说成模型变强了（是同权重下多花了生成预算）"],
      related: ["reasoning-token", "scaling-law", "chain-of-thought", "sampling"],
      tags: ["前沿", "成本"]
    },
    {
      id: "pretraining", en: "pretraining", zh: "预训练", aka: ["预训练阶段", "pretrain"], pinyin: "yu xun lian",
      cat: "training", level: "core", src: "glossary",
      def: "在海量无标注数据上做下一词元预测。",
      long: "看似简单的目标逼出了惊人的能力：要预测下一个词，模型必须掌握语法、事实、推理套路甚至世界知识。这一阶段消耗 99% 以上的算力，决定了模型的「底色」。学到的表征是通用的副产品而非专用于任何任务，这正是它能被下游微调的原因。",
      avoid: ["预学习"],
      related: ["language-model", "fine-tuning", "scaling-law"], tags: ["训练", "大模型"]
    },
    {
      id: "scaling-law", en: "scaling law", zh: "规模定律", aka: ["扩展律", "Kaplan 定律", "Chinchilla"], pinyin: "gui mo ding lv",
      cat: "training", level: "advanced", src: "glossary",
      def: "损失随参数量、数据量、算力呈幂律下降的经验规律。",
      long: "幂律意味着「再翻十倍只降一点点」，收益递减，但可预测——这是敢于投入巨额算力的理论依据。后续工作纠正了早期结论：参数与数据应近似同倍增长（Chinchilla 法则），此前的模型普遍「参数过大、数据过少」。在推理模型时代又分化出 test-time scaling：花算力在生成而非训练。",
      avoid: ["缩放律", "把规模定律当数学定理（它是经验拟合）"],
      related: ["pretraining", "emergent-ability", "compute"], tags: ["大模型", "经验规律"]
    },
    {
      id: "fine-tuning", en: "fine-tuning", zh: "微调", aka: ["精调", "FT", "下游训练"], pinyin: "wei tiao",
      cat: "training", level: "core", src: "glossary",
      def: "在特定数据上继续训练已训好的模型。",
      long: "因为预训练已给出好的通用表征，只需少量数据、小学习率把它推向目标任务。全参微调最彻底也最贵；参数高效方法（如 LoRA）只训一小撮低秩增量，可插拔、易切换风格。要留意灾难性遗忘：在窄领域上过度微调会损害原有通用能力。",
      avoid: ["精调"],
      related: ["pretraining", "lora", "instruction-tuning"], tags: ["训练"]
    },
    {
      id: "alignment", en: "alignment", zh: "对齐", aka: ["价值对齐", "对齐问题"], pinyin: "dui qi",
      cat: "training", level: "core", src: "glossary",
      def: "使模型行为符合人类意图与价值。",
      long: "范围比「安全」宽：既要听得懂指令（意图对齐），也要在模糊处给出人真正想要的结果。经典困境是双重效应——模型可能学到「看起来像人喜欢的」而非「人真正喜欢的」，于是奖励欺骗与迎合（sycophancy）成为对齐的顽固问题。它与校准是两个不同概念，别混。",
      avoid: ["一致性（作为 consistency 的译名时才对）", "把对齐等同于加过滤器"],
      related: ["rlhf", "dpo", "calibration", "constitutional-ai"], tags: ["对齐", "价值"]
    },
    {
      id: "rlhf", en: "RLHF", zh: "基于人类反馈的强化学习", aka: ["RLHF", "人类反馈强化学习"], pinyin: "ji yu ren lei fan kui de qiang hua xuexi",
      cat: "training", level: "core", src: "glossary",
      def: "SFT → 奖励模型 → 策略优化 的三段后训练流程。",
      long: "第一段用示范数据学会格式与基本跟随；第二段把人类偏好压成一个可微的打分器；第三段用强化学习提高奖励模型给的分数，同时用 KL 约束拉住别跑太远。问题也出在这里：模型优化的是代理指标（奖励模型分）而非真实人类满意，一旦钻出漏洞就出现奖励欺骗。",
      avoid: ["RLHF（首次出现必须展开）", "把 RLHF 等同于 PPO"],
      related: ["reward-model", "alignment", "dpo", "ppo"], tags: ["对齐", "流程"]
    },
    {
      id: "reward-model", en: "reward model", zh: "奖励模型", aka: ["RM", "偏好模型", "打分器"], pinyin: "jiang li mo xing",
      cat: "training", level: "core", src: "glossary",
      def: "学习人类偏好、给回答打分的模型。",
      long: "通常由一个语言模型去掉生成头、换上标量输出头构成，在成对偏好数据上用 Bradley-Terry 损失训练（只学「A 比 B 好多少」而非绝对分数）。它是 RLHF 里唯一的人类价值代理，因此它的偏差会被策略优化放大——奖励模型偏爱长回答，训练后就得到爱灌水的答案。",
      avoid: ["RM（首次不缩写）", "把它当客观质量度量"],
      related: ["rlhf", "dpo", "alignment"], tags: ["对齐", "模型"]
    },
    {
      id: "instruction-tuning", en: "instruction tuning", zh: "指令微调", aka: ["指令调优", "IT"], pinyin: "zhi ling wei tiao",
      cat: "training", level: "core",
      def: "用「指令—回应」配对数据训练模型跟随自然语言任务描述。",
      long: "它把预训练学到的能力「解锁」成可被提示调用的形式：同样参数，未经指令训练的模型倾向于续写而不是回答。数据质量远比数量重要，少量高质量多样样本就能带来显著提升，因为模型学的是「响应格式与意图映射」。",
      avoid: ["把它当作「教会新知识」的手段"],
      related: ["fine-tuning", "sft", "alignment"], tags: ["训练", "对齐"]
    },
    {
      id: "sft", en: "supervised fine-tuning", zh: "监督微调", aka: ["SFT", "示范微调"], pinyin: "jian du wei tiao",
      cat: "training", level: "core",
      def: "用带标准答案的示范数据继续训练，让模型学会期望的作答方式。",
      long: "RLHF 三段中的第一段，也是今天多数「推理模型」冷启动的阶段。它与偏好优化的区别很关键：SFT 只告诉模型「什么是好答案」，不告诉「什么不好」，因此模仿上限受示范数据质量约束，且会把示范里的毛病一起学来。",
      avoid: ["把它与监督学习混作同义"],
      related: ["instruction-tuning", "rlhf", "reward-model"], tags: ["训练", "流程"]
    },
    {
      id: "dpo", en: "Direct Preference Optimization", zh: "直接偏好优化", aka: ["DPO", "偏好优化"], pinyin: "zhi jie pian hao you hua",
      cat: "training", level: "advanced",
      def: "跳过奖励模型，直接用偏好对构造损失优化策略。",
      long: "它把「最大化奖励同时不偏离参考模型」这一 RLHF 目标改写成一个可直接优化的分类式损失，因此训练更稳定、更省资源。代价是假设了偏好服从 Bradley-Terry 模型且离线数据覆盖足够；分布外区域没有信号，容易过拟合到偏好对的表面特征（比如长度）。",
      avoid: ["把它写成「无需人类反馈」（偏好数据仍然来自人）"],
      related: ["rlhf", "reward-model", "alignment"], tags: ["对齐", "方法"]
    },
    {
      id: "ppo", en: "Proximal Policy Optimization", zh: "近端策略优化", aka: ["PPO", "策略优化"], pinyin: "jin duan ce lue you hua",
      cat: "training", level: "advanced",
      def: "用截断的重要性比率限制每步更新幅度的强化学习算法。",
      long: "截断的作用是让策略不会在一次更新里跑太远，从而避免强化学习常见的崩塌。RLHF 里它需要同时维护策略、参考、奖励、价值四个模型，显存与调参成本高——这正是 DPO 之类离线方法流行的现实原因。",
      avoid: ["把 RLHF 与 PPO 当同义词"],
      related: ["rlhf", "reward-model", "actor-critic"], tags: ["强化学习", "优化"]
    },
    {
      id: "constitutional-ai", en: "Constitutional AI", zh: "宪法式 AI", aka: ["CAI", "原则驱动自我改进"], pinyin: "xian fa shi",
      cat: "training", level: "advanced",
      def: "让模型依据一组书面原则自我批评并修订回答，再据此训练。",
      long: "它把「什么算更好回答」的裁判从人类标注者换成一份明文规则加一个模型，从而减少人工标注、并使安全准则可审计可修改。风险也很直白：原则的措辞偏差会被完整放大，且模型的自我批评能力决定了这套方法的上限。",
      avoid: ["把它理解为「给模型装了硬性安全规则」"],
      related: ["alignment", "rlhf", "reward-model"], tags: ["对齐", "方法"]
    },
    {
      id: "weight-decay", en: "weight decay", zh: "权重衰减",
      aka: ["权值衰减", "L2 正则（近似说法）"], pinyin: "quan zhong shuai jian",
      cat: "training", level: "core",
      def: "每步把参数往零方向缩小一点，以此抑制模型把权重养得过大。",
      long: "在 SGD 下，权重衰减与 L2 正则化数学等价，因此常被混称；但在 Adam 这类自适应优化器里两者不再等价——把衰减塞进梯度会被二阶矩归一化削弱，于是才有 Decoupled Adam（AdamW）把衰减移到参数更新一步单独做。实践中大模型普遍用 AdamW，衰减系数常取 0.1 量级。",
      avoid: ["断言「权重衰减就是 L2 正则」（换了优化器就不成立）"],
      related: ["adam-optimizer", "sgd-optimizer", "l1-l2-regularization", "regularization"],
      tags: ["正则化", "优化器"]
    },
    {
      id: "mini-batch", en: "mini-batch", zh: "小批量",
      aka: ["极小批量", "batch"], pinyin: "xiao pi liang",
      cat: "training", level: "basic",
      def: "一次参数更新所用的那一小块样本，介于单样本与整批数据之间。",
      long: "批量太小，梯度噪声大、更新方向抖；批量太大，每一步的边际收益递减且显存吃紧，还会导致「大 batch 需要大学习率」的调参耦合。批大小还直接影响批归一化的统计量质量，这正是序列模型偏爱层归一化的原因之一。梯度累积可以在不增加显存的前提下等效放大批量。",
      avoid: ["把 epoch 与 batch 混用（一个 epoch 包含许多 batch）"],
      related: ["batch-size", "batchnorm", "epoch", "gradient-accumulation"],
      tags: ["训练", "超参数"]
    },
    {
      id: "actor-critic", en: "actor-critic", zh: "演员-评论家",
      aka: ["Actor-Critic", "行动者-批评者"], pinyin: "yan yuan ping lun jia",
      cat: "training", level: "advanced",
      def: "同时学一个给动作的策略（演员）和一个估计回报的价值函数（评论家），用后者指导前者更新。",
      long: "纯策略梯度只用整条轨迹的回报，方差大；引入价值函数作基线（优势估计）后，更新方差显著下降、学习更快，代价是评论家本身可能估错，形成偏差。RLHF 中的 PPO 正是这套结构：策略模型是演员，价值模型是评论家。",
      avoid: ["把演员-评论家当成两种算法而非一个框架内的两个部件"],
      related: ["policy-gradient", "ppo", "reinforcement-learning", "reward-model"],
      tags: ["强化学习"]
    },
    {
      id: "policy-gradient", en: "policy gradient", zh: "策略梯度",
      aka: ["策略梯度法", "REINFORCE"], pinyin: "ce lue ti du",
      cat: "training", level: "advanced",
      def: "直接对策略参数求梯度、把高回报动作的概率推高的一类强化学习方法。",
      long: "与「先学价值再选最优动作」的价值法路线不同，它显式优化一个随机策略，因此天然支持随机动作与连续动作空间。基本形式是让回报加权对数似然的梯度取期望；单样本估计方差极大，实际要靠基线、优势函数、裁剪与多个采样来压方差——这也是训练不稳定的主要来源。",
      avoid: ["把「策略梯度」等同于 PPO（PPO 是它的一种带裁剪的实例）"],
      related: ["actor-critic", "ppo", "reinforcement-learning", "rlhf"],
      tags: ["强化学习", "优化"]
    },
    {
      id: "reward-shaping", en: "reward shaping", zh: "奖励塑形",
      aka: ["奖励设计", "reward design"], pinyin: "jiang li su xing",
      cat: "training", level: "advanced",
      def: "为加速学习而人为添加中间奖励信号，引导策略走向期望行为。",
      long: "稀疏奖励下探索几乎学不到东西，于是给「接近目标」也发分。危险在于策略会去最大化你写的奖励而不是你想要的结果：塑形项一旦可刷，模型就会专门刷它。RLHF 里这条教训直接对应奖励欺骗与迎合现象，因此现代做法倾向少给、后给，并优先用约束而非奖励。",
      avoid: ["把「加奖励」当成中性的工程技巧"],
      related: ["reward-model", "rlhf", "alignment", "reinforcement-learning"],
      tags: ["强化学习", "对齐"]
    },
    {
      id: "early-stopping",
      en: "Early Stopping",
      zh: "早停",
      aka: ["提前停止", "停止准则"],
      pinyin: "zaoting",
      cat: "training",
      level: "core",
      def: "训练过程中持续观察验证集，一旦验证损失连续若干轮不再下降就停止，把模型留在过拟合真正发生之前的位置。",
      long: "它其实是一种隐式正则化：限制了有效训练步数，也就间接限制了权重能长多大。耐心值与检查频率必须显式设定，太小会被噪声误停，太大则形同虚设。要注意验证集参与了这次「停机决策」，因此它已不再是干净的测试集，报最终成绩时该另留一套从未用于决策的数据。",
      avoid: ["认为早停只是省时间的工程技巧"],
      related: ["regularization", "cross-validation", "generalization", "hyperparameter", "data-augmentation"],
      tags: ["泛化", "训练流程"]
    },
    {
      id: "data-augmentation",
      en: "Data Augmentation",
      zh: "数据增强",
      aka: ["数据扩充", "Aug"],
      pinyin: "shujuzengqiang",
      cat: "training",
      level: "core",
      def: "对训练样本施加不改变标签的变换，例如翻转、裁剪与噪声扰动，相当于免费扩充数据并注入不变性先验，是最常用的正则化手段之一。",
      long: "关键在「不改变标签」这个前提：把上下颠倒的文本仍标成原意，模型只会学到矛盾。增强强度需要与任务匹配，过强的裁剪会造出与真实分布不符的样本，反而压低上限。它的真正作用是把人工知识写进数据分布，与随机失活、正则化项属于同一目标下的不同实现路径。",
      avoid: ["把任何给数据加扰动的做法都当作增强"],
      related: ["regularization", "self-supervised-learning", "semi-supervised-learning", "dropout"],
      tags: ["训练策略", "正则化"]
    },
    {
      id: "mixed-precision",
      en: "Mixed Precision Training",
      zh: "混合精度训练",
      aka: ["AMP", "FP16/BF16 训练"],
      pinyin: "hunhejingduxunlian",
      cat: "training",
      level: "core",
      def: "前向计算与梯度用半精度浮点换取算力与显存节省，同时保留高精度主权重并做累加，通常需要损失缩放来防止梯度下溢。",
      long: "收益来自三处：张量核心算力更高、激活值占显存更少、通信字节数更小。半精度可表示的动态范围窄，小梯度会直接变成零，所以要按缩放因子放大损失再还原。保留主权重副本的原因是单步更新量相对权重本身太小，在半精度下会被舍入吃掉，长期训练就停滞不动。",
      avoid: ["认为「混合精度就是全程用半精度」"],
      related: ["quantization", "gpu", "gradient-accumulation", "distributed-training", "checkpointing"],
      tags: ["训练效率", "数值精度"]
    },
    {
      id: "knowledge-distillation",
      en: "Knowledge Distillation",
      zh: "知识蒸馏",
      aka: ["蒸馏", "Teacher-Student"],
      pinyin: "zhishizhengliu",
      cat: "training",
      level: "core",
      def: "让小学生模型拟合大教师模型输出的软化概率分布而不只是硬标签，从而转移能力，比只用真实标签独立训练更省数据。",
      long: "价值集中在软标签里的类间相对关系，即教师告诉学生「卡车不像猫，但有点像公交车」，这些信息是独热标签给不了的。温度用来控制软标签的平滑程度，必须与学生损失一起调。它与正则化方向相反：先训一个大模型当知识源，再压缩进小模型，因此常与量化、剪枝串联使用而非互相替代。",
      avoid: ["把蒸馏等同于「用小模型训练大模型」"],
      related: ["quantization", "model-pruning", "lora", "regularization", "generalization"],
      tags: ["模型压缩", "训练策略"]
    },
    {
      id: "lora",
      en: "Low-Rank Adaptation",
      zh: "LoRA",
      aka: ["低秩自适应", "LoRA 微调"],
      pinyin: "",
      cat: "training",
      level: "advanced",
      def: "冻结原有权重，只在旁边训练两个低秩矩阵的乘积作为增量，可训练参数骤降，推理时还能把增量合并回原矩阵而不增加延迟。",
      long: "依据是微调引起的权重变化本身秩很低，用两个小矩阵就足以承载，因此不需要动全部权重。秩是主要超参数，取值过大就退化成全量微调，过小则学不动。它省下的是优化器状态与梯度显存，前向计算并不会变便宜；正因合并后与全量模型同构，一套基座可以同时挂多个适配器对外提供服务。",
      avoid: ["认为 LoRA 能加快推理速度", "把它当作一种量化方法"],
      related: ["peft", "hyperparameter", "knowledge-distillation", "mixed-precision", "checkpointing"],
      tags: ["高效微调", "显存"]
    },
    {
      id: "peft",
      en: "Parameter-Efficient Fine-Tuning",
      zh: "PEFT",
      aka: ["参数高效微调", "高效微调"],
      pinyin: "",
      cat: "training",
      level: "core",
      def: "参数高效微调的统称，只训练少量新增或被选中的参数来让大模型适配下游任务，包括低秩适配器、前馈层微调与提示微调等做法。",
      long: "共同出发点是冻结绝大多数权重，于是优化器状态和梯度的显存开销随可训练参数量骤降，多个任务也能共享同一基座。区别在于被训练的东西放在哪里：加旁路矩阵、只调个别层，还是直接学一段输入向量。它不保证效果一定追平全量微调，任务与基座差异大时，可训练参数太少会成为瓶颈。",
      avoid: ["把 PEFT 与 LoRA 当作两个互斥的方案"],
      related: ["lora", "hyperparameter", "knowledge-distillation", "checkpointing", "distributed-training"],
      tags: ["高效微调", "显存"]
    },
    {
      id: "gradient-accumulation",
      en: "Gradient Accumulation",
      zh: "梯度累积",
      aka: ["累积步", "Accumulation Steps"],
      pinyin: "tidileiji",
      cat: "training",
      level: "core",
      def: "连续若干个小批把梯度累加起来再执行一次参数更新，用有限显存模拟更大的批，代价是每次 epoch 的更新次数减少。",
      long: "它只解决显存问题，并不等价于真的大批：显存峰值仍按单批决定，只是数学上更接近大批的梯度估计。累积步数乘单批再乘卡数才是等效批大小，调学习率与预热长度要看这个等效值。注意把梯度清零的时机放在更新之后，放在每小批之后就等于白攒，这是最常见的实现错误。",
      avoid: ["认为梯度累积能提升单步吞吐"],
      related: ["batch-size", "data-parallelism", "warmup-schedule", "mixed-precision", "gradient-clipping"],
      tags: ["显存", "训练策略"]
    },
    {
      id: "adam-optimizer",
      en: "Adam Optimizer",
      zh: "Adam 优化器",
      aka: ["AdamW", "自适应矩估计"],
      pinyin: "youhuaqi",
      cat: "training",
      level: "core",
      def: "为每个参数维护梯度的一阶与二阶动量，按各自的自适应步长更新，对稀疏梯度友好，但泛化常略逊于带动量的随机梯度下降。",
      long: "二阶动量把梯度大的方向除以自身尺度，使各参数更新量趋于一致，因此对量纲差异和梯度稀疏都鲁棒，几乎不用精细调学习率就能跑。AdamW 的修正把权重衰减从梯度路径里剥离出来单独作用，才恢复了正则化原本的语义，这是它取代原式的真正原因。它要额外保存两份状态，显存开销随可训练参数量线性上升。",
      avoid: ["把 AdamW 说成「Adam 只是换了个默认学习率」"],
      related: ["sgd-optimizer", "batch-size", "warmup-schedule", "gradient-clipping", "l1-l2-regularization"],
      tags: ["优化器", "显存"]
    },
    {
      id: "sgd-optimizer",
      en: "Stochastic Gradient Descent",
      zh: "随机梯度下降",
      aka: ["SGD", "SGDM", "带动量的随机梯度下降"],
      pinyin: "suijitiduxiajiang",
      cat: "training",
      level: "core",
      def: "每次只用一个批次样本的梯度估计来更新参数，加上动量后能冲过平坦区域，简单稳健但需要认真地调学习率与调度。",
      long: "批内噪声在这里不纯是坏事，它帮助训练离开尖锐极小值，这被认为是它在许多任务上泛化更好的原因之一。动量项相当于低通滤波，抑制震荡方向、放大一致方向，代价是对学习率上限更敏感。由于不保存二阶信息，它的优化器显存远小于自适应方法，在超大参数规模下这一差别会左右能否训练。",
      avoid: ["把「随机」理解为随机初始化"],
      related: ["adam-optimizer", "batch-size", "warmup-schedule", "gradient-clipping", "data-parallelism"],
      tags: ["优化器", "泛化"]
    },
    {
      id: "warmup-schedule",
      en: "Learning Rate Warmup",
      zh: "学习率预热",
      aka: ["预热调度", "Warmup"],
      pinyin: "xuexilvyure",
      cat: "training",
      level: "core",
      def: "训练开头把学习率从零逐步升到目标值，之后再按余弦或线性策略衰减，避免早期更新过大，在大批量与大模型上尤其关键。",
      long: "初期梯度统计尚未建立，自适应优化器的二阶动量接近零，此时按目标学习率迈大步会把少数方向推得过猛，甚至触发发散。预热长度应与等效批大小一起考虑，批越大需要的预热步数越多。它常被误当作可有可无的调参技巧，实际在很多大模型训练里，去掉预热会直接导致损失爆炸而不可恢复。",
      avoid: ["把预热理解为「先冻结主干再解冻」"],
      related: ["hyperparameter", "gradient-accumulation", "adam-optimizer", "checkpointing", "batch-size"],
      tags: ["学习率", "训练稳定性"]
    },
    {
      id: "batch-size",
      en: "Batch Size",
      zh: "批次大小",
      aka: ["批大小", "Mini-batch", "全局批"],
      pinyin: "picidaxiao",
      cat: "training",
      level: "basic",
      def: "一次参数更新所使用的样本数量，同时决定梯度估计的噪声水平与硬件利用率，增大会减小噪声但可能损害泛化且需要同步调学习率。",
      long: "要区分单卡批、累积后批与全局等效批，论文里说的批大小常常指最后一个，直接照搬设置会得到完全不同的训练动态。批越大每步数据越多但更新次数越少，在固定数据量下过大的批等于少训练了很多步。它也是显存的主要决定项，多数情况下真正上限来自激活值而不是权重。",
      avoid: ["不说明口径就报「批大小」"],
      related: ["epoch", "gradient-accumulation", "data-parallelism", "hyperparameter", "gpu"],
      tags: ["训练配置", "显存"]
    },
    {
      id: "epoch",
      en: "Epoch",
      zh: "轮次",
      aka: ["Epoch", "训练轮数", "整轮"],
      pinyin: "lunci",
      cat: "training",
      level: "basic",
      def: "训练集被完整遍历一次的计数单位，大模型训练常按步而非轮来安排进度，一轮对应多少步取决于批大小与数据规模。",
      long: "在数据量远大于参数量的场景，走一遍就可能收敛，多轮反而过拟合；在语料巨大而参数相对小的预训练里，常见的反而是不到一轮，谈轮次便失去意义。它与更新步数是两个不同量纲，把「若干轮」的结论直接迁移到另一种批大小下必然出错。调度与早停若按轮设置，也要确认数据规模变化时它们是否还等价。",
      avoid: ["把「轮次」与「参数更新步数」混用"],
      related: ["batch-size", "early-stopping", "warmup-schedule", "hyperparameter", "checkpointing"],
      tags: ["训练流程", "计数口径"]
    },
    {
      id: "gradient-clipping",
      en: "Gradient Clipping",
      zh: "梯度裁剪",
      aka: ["梯度截断", "Clip Grad Norm"],
      pinyin: "tidicaidian",
      cat: "training",
      level: "core",
      def: "在反向传播完成后把梯度的整体范数或逐元素数值限制在设定上限内，防止偶发的巨大更新，在循环网络与分布式训练中常用。",
      long: "按范数裁剪是等比例缩小所有分量，保持方向不变，因此比逐元素截断更少破坏更新语义。它治的是「尖峰」，也就是少数批次产生的异常大梯度，而不是持续的训练发散；如果损失本身在漂，裁剪只会把问题藏起来。在多卡训练里，裁剪必须在梯度聚合之后执行一次，各卡分别裁剪会改变平均梯度的方向。",
      avoid: ["把梯度裁剪当作解决损失发散的主要手段"],
      related: ["gradient-accumulation", "adam-optimizer", "distributed-training", "warmup-schedule", "mixed-precision"],
      tags: ["训练稳定性", "优化器"]
    }
  );
})(window);
