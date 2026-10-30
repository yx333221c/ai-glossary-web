/*
 * AI 术语词典 · 数据分片三：补齐被引用但尚未收录的概念
 * pinyin 一律按音节空格分隔（引擎可直接使用，无需再猜切分）
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
    {
      id: "transformer", en: "Transformer", zh: "Transformer",
      aka: ["Transformer 架构", "注意力架构", "变换器架构"], pinyin: "",
      cat: "nlp", level: "core",
      def: "完全依靠注意力机制做序列建模的架构，用并行训练取代循环结构，是现代大模型的共同底座。",
      long: "2017 年论文《Attention Is All You Need》提出，编码器与解码器各由多层「多头自注意力 + 前馈网络」堆叠，配合残差连接、层归一化与位置编码。相比循环网络，它在训练时可对整个序列并行计算，因而能吃下海量数据；代价是自注意力带来序列长度的平方级计算量，长上下文成本随之陡增。今天的 GPT、LLaMA、Claude 等大多是它的仅解码器变体。",
      avoid: ["把 Transformer 与「大语言模型」当同义词（前者是架构，后者由它实现）"],
      related: ["attention", "self-attention", "multi-head-attention", "ffn", "positional-encoding", "residual-connection", "language-model", "decoder-only"],
      tags: ["架构", "里程碑"]
    },
    {
      id: "overfitting", en: "Overfitting", zh: "过拟合",
      aka: ["超拟合", "过学习"], pinyin: "guo ni he",
      cat: "ml", level: "basic",
      def: "模型把训练集里的噪声与个例也学了进去，在新数据上的表现明显差于在训练集上的表现。",
      long: "典型信号是训练损失一路下降、验证损失先降后升。成因通常是模型容量相对数据量过大、或数据分布太窄。对策是加数据、做正则化（L1/L2、Dropout、权重衰减）、早停、简化模型。它与欠拟合构成偏差-方差权衡的两端，因此「更小的模型」不总是解药。大模型时代出现过相反现象：规模足够大时，即使插值拟合噪声也能保持良好泛化。",
      avoid: ["欠拟合（那是相反现象）", "把训练损失低当作模型好的证据"],
      related: ["underfitting", "regularization", "generalization", "early-stopping", "dropout", "validation-split"],
      tags: ["泛化", "训练动态"]
    },
    {
      id: "top-k", en: "top-k sampling", zh: "Top-K 采样",
      aka: ["top-k", "前 K 采样"], pinyin: "qian k ge cai yang",
      cat: "inference", level: "core",
      def: "只保留概率最高的 K 个候选词元，在这 K 个里重新归一化后采样。",
      long: "它是最直白的截断手段：K 小则稳定，K 大则多样。问题是 K 固定而分布的尖锐程度会变——模型很确信时 K=50 会引入不该出现的噪声，模型很犹豫时 K=5 又太死板。核采样（top-p）正是为了解决这一点而改成按累计概率截断，两者也常叠加使用。",
      avoid: ["与 top-p 混用（top-k 固定候选数，top-p 固定累计概率）"],
      related: ["top-p", "sampling", "temperature", "logit"],
      tags: ["解码"]
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
      id: "contrastive-learning", en: "contrastive learning", zh: "对比学习",
      aka: ["对比式自监督", "contrastive self-supervised learning"], pinyin: "dui bi xue xi",
      cat: "ml", level: "core",
      def: "不靠人工标签，而是让模型学会「把配对的样本拉近、把不配对的推开」。",
      long: "配对通常由增广（同一图像两次裁剪）或天然共现（图文对）构成，负样本则取自同批次其他样本。损失形如 InfoNCE，本质是一个多类分类：在自己的正例与一批负例中把它认出来。负样本数量越多任务越难、表征越好，所以大 batch 对它有实质意义，而不只是提速。",
      avoid: ["把「对比学习」当成仅是「度量学习」的新名字"],
      related: ["infonce", "clip", "self-supervised-learning", "embedding"],
      tags: ["自监督", "表示学习"]
    },
    {
      id: "rmsnorm", en: "RMSNorm", zh: "RMSNorm",
      aka: ["均方根归一化", "Root Mean Square Layer Normalization"], pinyin: "jun fang gen gui yi hua",
      cat: "dl", level: "advanced",
      def: "只做尺度归一、不减均值的层归一化简化版，用向量长度的均方根做除数。",
      long: "层归一化里「减均值」这一步被认为贡献有限，去掉后省去一次规约与一个偏移参数，速度更快、显存更省，效果基本不变。因此 LLaMA 等主流大模型都改用它。它是「归一化的位置比归一化的形式更重要」这一经验结论的典型例子。",
      avoid: ["把它叫作「另一种批归一化」"],
      related: ["layernorm", "batchnorm", "pre-ln-post-ln"],
      tags: ["归一化", "效率"]
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
      id: "gradient-checkpointing", en: "gradient checkpointing", zh: "梯度检查点",
      aka: ["激活重算", "activation recomputation"], pinyin: "ti du jian cha dian",
      cat: "infra", level: "advanced",
      def: "只缓存少数关键层的中间激活，反向传播时再重算其余部分，用算力换显存。",
      long: "反向传播需要前向的中间结果，全存下来显存随深度线性增长，长序列大模型往往先卡在显存上。选择性缓存后，显存大幅下降，代价是多跑一遍前向，实测常见 overhead 约两到三成。它是长上下文训练与单卡推理能否落地的关键开关之一。",
      avoid: ["与「检查点保存模型权重」（checkpointing）混为一谈"],
      related: ["checkpointing", "backpropagation", "mixed-precision", "memory-bandwidth"],
      tags: ["显存", "训练"]
    },
    {
      id: "multilayer-perceptron", en: "Multilayer Perceptron", zh: "多层感知机",
      aka: ["MLP", "全连接网络", "前馈神经网络（狭义）"], pinyin: "duo ceng gan zhi ji",
      cat: "dl", level: "basic",
      def: "层与层之间全连接、中间夹激活函数的网络，是深度网络最朴素的形态。",
      long: "只要有一层非线性激活，它在理论上就能逼近任意连续函数（通用近似定理），但「能表示」与「好训练」是两回事：全连接参数随宽度平方增长，也没有利用局部性与共享，图像等大尺寸输入很快失控。今天它仍以逐位置前馈网络的形式活在每个 Transformer 层里。",
      avoid: ["用 MLP 泛指所有前馈网络（Transformer 也属于前馈）"],
      related: ["neuron", "ffn", "activation-function", "deep-learning"],
      tags: ["架构", "基础"]
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
      id: "serving-latency", en: "serving latency", zh: "服务延迟",
      aka: ["推理延迟", "首字延迟", "TTFT"], pinyin: "fu wu yan chi",
      cat: "infra", level: "core",
      def: "从请求到达至输出完成所需的时间，在自回归模型里要拆成两段看。",
      long: "处理提示的阶段算力密集、决定首字延迟（TTFT）；逐词元生成的阶段主要卡在把权重和键值缓存搬进计算单元，是访存受限，决定字间延迟。两者瓶颈不同、优化手段也不同：前者靠批处理与前缀缓存，后者靠量化、投机解码与更大的批量。只看「平均延迟」会掩盖体验问题。",
      avoid: ["用一个数字概括延迟", "把延迟与吞吐混为一谈"],
      related: ["throughput", "inference-serving", "kv-cache", "inference"],
      tags: ["部署", "性能"]
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
      id: "validation-split", en: "validation split", zh: "验证集",
      aka: ["开发集", "dev set", "held-out set"], pinyin: "yan zheng ji",
      cat: "ml", level: "basic",
      def: "训练时被留出、用于挑超参与判断是否过拟合的那部分数据。",
      long: "它与测试集的区别在于用途：验证集允许你反复看、据此调参，因此它的分数会随调参次数被间接优化掉；测试集只在最后用一次。多次拿验证集调到底，验证集事实上就变成了训练数据，这也是需要交叉验证与独立保留集的原因。切分时还必须保证同一条样本的不同片段不跨集合。",
      avoid: ["拿测试集调超参", "把验证集分数当作无偏估计"],
      related: ["cross-validation", "overfitting", "generalization", "benchmark"],
      tags: ["评估", "方法"]
    },
    {
      id: "compute", en: "compute", zh: "算力",
      aka: ["计算量", "FLOPs", "训练算力"], pinyin: "suan li",
      cat: "infra", level: "core",
      def: "完成一次训练或推理所需的浮点运算量，通常以 FLOPs 计。",
      long: "经验公式是训练总算力约等于 6 乘参数量乘训练 token 数，因此「模型多大」与「喂了多少数据」共同决定成本，单看参数量会低估。规模定律把损失写成算力的幂函数，于是算力成为可预测投入的依据。但要留意：算力充足不等于有效算力，显存带宽、通信与利用率常是真正的上限。",
      avoid: ["只看参数量就推断成本", "把 FLOPs 与显存占用混用"],
      related: ["scaling-law", "gpu", "mixed-precision", "throughput"],
      tags: ["成本", "基础设施"]
    },
    {
      id: "deep-learning", en: "deep learning", zh: "深度学习",
      aka: ["深度神经网络", "DL"], pinyin: "shen du xue xi",
      cat: "dl", level: "basic",
      def: "用多层可训练网络自动学习层次化表示的机器学习方法，省去人工设计特征。",
      long: "「深度」的收益在于逐层组合出抽象特征：低层看边缘，高层看语义。它成立的前提是数据量与算力同时到位，外加可导的激活与稳定的归一化技巧，这三件事在 2010 年前后才凑齐。它是手段而非目标，与「机器学习」的区别主要在表示如何被学到。",
      avoid: ["把深度学习当成机器学习的同义词", "以为深度必然更好"],
      related: ["machine-learning", "neural-network", "multilayer-perceptron", "parameter"],
      tags: ["基础"]
    },
    {
      id: "neural-network", en: "neural network", zh: "神经网络",
      aka: ["人工神经网络", "ANN"], pinyin: "shen jing wang luo",
      cat: "dl", level: "basic",
      def: "由大量可训练单元按连接图组成的计算模型，前向算输出、反向调参数。",
      long: "单个单元只能做「加权求和后过一次非线性」，能力来自规模化的组合与梯度可训练这两点。生物启发的说法只到比喻层面：真实神经元远比这复杂，且网络的训练方式与大脑不同，用生物类比解释深度学习行为往往误导。",
      avoid: ["以生物神经元的行为论证模型性质"],
      related: ["neuron", "deep-learning", "backpropagation", "weight"],
      tags: ["基础"]
    },
    {
      id: "machine-learning", en: "machine learning", zh: "机器学习",
      aka: ["ML"], pinyin: "ji qi xue xi",
      cat: "ml", level: "basic",
      def: "让程序从数据中改进表现，而不是靠人把规则逐条写死。",
      long: "形式化一点说：在某类任务 T 上，用度量 P 评价，由经验 E 改进的程序就在学习。核心难点从来不是「怎么拟合」而是「怎么保证在新数据上还成立」，因此泛化、验证集与数据分布这些概念比模型花样更决定成败。它是方法集合，不是单一算法。",
      avoid: ["把机器学习等同于深度学习", "用训练集成绩论成败"],
      related: ["deep-learning", "supervised-learning", "generalization", "overfitting"],
      tags: ["基础"]
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
    },
    {
      id: "memory-bandwidth", en: "memory bandwidth", zh: "显存带宽",
      aka: ["访存带宽", "HBM 带宽"], pinyin: "xian cun dai kuan",
      cat: "infra", level: "advanced",
      def: "单位时间内能在显存与计算单元之间搬运多少数据，常比算力更早成为瓶颈。",
      long: "自回归逐词元生成时，每产出一个词元都要把整个模型权重读一遍，运算量小、搬运量大，属于访存受限；此时堆再多算力也用不上，除非把多个请求批量合并。这解释了为什么量化与批量大小对生成速度影响巨大，也解释了长上下文下键值缓存搬运同样吃带宽。",
      avoid: ["用参数量或 FLOPS 单独预测推理速度"],
      related: ["serving-latency", "quantization", "gpu", "kv-cache", "batch-size"],
      tags: ["性能", "硬件"]
    },
    {
      id: "throughput", en: "throughput", zh: "吞吐率",
      aka: ["吞吐量", "QPS", "tokens/s"], pinyin: "tun tu lv",
      cat: "infra", level: "core",
      def: "单位时间内系统处理的请求数或生成词元数，衡量「能服务多少人」，与单个请求的延迟是两套目标。",
      long: "把多个请求拼成一批一起算，权重只需读一遍就服务更多请求，吞吐率随之上升——这正是访存受限的生成阶段最管用的杠杆。但批量加大会让每个请求排队更久、尾延迟变差，所以吞吐率与延迟是明确的取舍关系，不是「都越大越好」。评估时应当同时报出两者的分布（尤其 P99），只报平均吞吐率最容易掩盖体验问题。",
      avoid: ["用吞吐率替代延迟作为唯一指标", "把 QPS 与 tokens/s 混用（前者按请求计，后者按生成量计）"],
      related: ["serving-latency", "batch-size", "memory-bandwidth", "inference-serving", "compute"],
      tags: ["部署", "性能"]
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
