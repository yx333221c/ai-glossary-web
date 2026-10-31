/*
 * AI 术语词典 · 分类数据：cat = "math"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
    {
      id: "token", en: "token", zh: "词元", aka: ["词块", "token 单元"], pinyin: "ci yuan",
      cat: "math", level: "basic", src: "glossary",
      def: "模型处理文本的最小单位，既不是「词」也不是「字」。",
      plain: "打个比方，模型读句子就像我们看一串被剪碎的话，词元就是那些剪下来的小片。中文里一片常常是一个字或半个词，英文里一片短到两三个字母，也可能正好是一个常用词。同样一段话，换一种切法，剪出来的片数会差很多，所以「这篇文章有多长」在模型那里其实等于「有多少片」。片数既决定它一次能读多少内容，也决定这次对话要花多少钱。",
      long: "分词器把文本切成词元序列，模型看到的全部是词元编号。中文常见一字一到两词元，英文常见一个单词一到四个词元，因此「长度」在不同语言间不可直接类比。它决定了上下文窗口能装下多少内容，也直接决定计费与算力量级。",
      avoid: ["token（不加说明地裸用）", "字", "词"],
      related: ["embedding", "context-window", "perplexity"], tags: ["信息论", "文本"]
    },
    {
      id: "embedding", en: "embedding", zh: "嵌入", aka: ["向量表示", "embed"], pinyin: "qian ru",
      cat: "math", level: "core", src: "glossary",
      def: "把离散对象映射成连续向量，使「相似」变成可计算的远近。",
      plain: "可以这样理解：嵌入是给每个词、每段话发一串坐标，意思接近的东西，坐标就挨得近。好比把一批水果放到一张图上，苹果和梨会落在相邻的位置，离汽车很远。这样一来，「这两个说法像不像」就不用人来判断，算一下两点之间的距离或者两个箭头的夹角就有答案。要注意一点：坐标挨得近，可能是训练时特意要求的结果，也可能只是学着学着顺带形成的。这两种情况下，「近」的含义并不一样。",
      long: "度量方式决定「近」的含义：夹角余弦看方向，欧氏距离同时受模长影响。要特别注意：语义相近的对象「靠在一起」究竟是训练目标还是副产品，取决于训练方式——对比学习把拉近写进损失，而自回归语言模型的嵌入只是学预测时的副产品，聚拢只是倾向而非保证。",
      avoid: ["向量嵌入（泛用）", "词嵌入（除非特指词）"],
      related: ["vector-quantization", "attention", "rag"], tags: ["表示学习"]
    },
    {
      id: "surprise", en: "surprise / self-information", zh: "惊讶度", aka: ["自信息", "信息量"], pinyin: "jing ya du",
      cat: "math", level: "core", src: "glossary",
      def: "单个结果的意外程度，等于 −log p；越不可能越惊讶。",
      long: "概率为 1 的事件毫无信息（惊讶度 0），概率趋近 0 时惊讶度趋向无穷。把惊讶度按真实分布取期望，就得到信息熵；这是交叉熵与 KL 散度的共同起点。用它理解「模型在某个位置有多不确定」比单看概率更直观，因为是对数尺度。",
      avoid: ["惊喜度", "意外值"],
      related: ["cross-entropy", "perplexity", "kl-divergence"], tags: ["信息论"]
    },
    {
      id: "kl-divergence", en: "KL divergence", zh: "KL 散度", aka: ["相对熵", "Kullback-Leibler divergence"], pinyin: "kl san du",
      cat: "math", level: "advanced", src: "glossary",
      def: "用 q 代替 p 编码时多付的那部分码长，等于交叉熵减去熵。",
      long: "它衡量两个分布的不对称差异：KL(p‖q) 与 KL(q‖p) 一般不相等，因此严格说不是「距离」（距离要求对称且满足三角不等式）。方向选择很关键：前向 KL 惩罚「漏掉 p 的高概率区」，后向 KL 惩罚「在 p 的低概率区乱放重量」，变分推断与知识蒸馏的差别正源于此。",
      avoid: ["KL 距离（它不对称，不是距离）"],
      related: ["cross-entropy", "surprise", "rlhf"], tags: ["信息论", "优化"]
    },
    {
      id: "parameter", en: "parameter", zh: "参数", aka: ["模型参数", "theta"], pinyin: "can shu",
      cat: "math", level: "basic", src: "glossary",
      def: "模型内部可训练的数值。",
      long: "日常说的「千亿参数」指的是可训练数值的总个数，其中绝大多数是权重矩阵里的元素，也包含偏置与归一化系数。参数量粗略决定模型的显存占用（每参数 FP16 约 2 字节，FP32 约 4 字节），但推理速度更受激活值与访存带宽影响。",
      avoid: ["权重（除非特指可训练矩阵元素）"],
      related: ["weight", "fine-tuning", "lora"], tags: ["模型"]
    },
    {
      id: "weight", en: "weight", zh: "权重", aka: ["权值", "weight matrix"], pinyin: "quan zhong",
      cat: "math", level: "basic", src: "glossary",
      def: "网络里乘在输入上的系数。",
      long: "单个神经元的计算是「输入乘权重求和，再加偏置，过激活函数」。权重排列成矩阵后，一次前向传播就是一串矩阵乘法——这正是 GPU 适合深度学习的原因。注意「权重」在别处还有两个含义：注意力里的加权系数、损失里各类别的惩罚倍数，语境不同不要混用。",
      avoid: ["参数（除非特指线性组合系数）"],
      related: ["parameter", "backpropagation", "weight-decay"], tags: ["神经网络"]
    },
    {
      id: "loss", en: "loss / cost function", zh: "损失", aka: ["损失函数", "loss function"], pinyin: "sun shi",
      cat: "math", level: "basic", src: "glossary",
      def: "衡量预测与真实差多少的单一数值。",
      long: "训练的全部动作就是「让这一个数变小」。它必须可导，优化器才能算梯度。不同任务换不同的损失：回归用平方误差，分类用交叉熵，对比学习用 InfoNCE。看曲线时要区分训练损失与验证损失：只有后者下降才代表真的学到了东西。",
      avoid: ["代价函数", "误差（误差是单次差值，损失是聚合度量）"],
      related: ["cross-entropy", "gradient", "perplexity"], tags: ["优化"]
    },
    {
      id: "cross-entropy", en: "cross-entropy", zh: "交叉熵", aka: ["CE loss", "交叉熵损失"], pinyin: "jiao chao shang",
      cat: "math", level: "core", src: "glossary",
      def: "按真实分布 p 评分、却用另一套分布 q 编码时的总平均码长。",
      long: "它等于信息熵加 KL 散度。因为真实分布的熵是常数，最小化交叉熵与最小化 KL 散度等价——这就是分类任务用它的理由。语言模型里它就是下一词元预测的损失；对它取指数就得到困惑度。当预测完全错误时（概率趋 0）损失会爆炸，所以工程上常做标签平滑。",
      avoid: ["熵（熵是 p 自己的平均码长）"],
      related: ["kl-divergence", "surprise", "perplexity"], tags: ["信息论", "损失"]
    },
    {
      id: "perplexity", en: "perplexity", zh: "困惑度", aka: ["PPL", "exp 交叉熵"], pinyin: "kun huo du",
      cat: "math", level: "core", src: "glossary",
      def: "模型对文本的平均意外程度，是交叉熵的指数。",
      long: "可以直觉理解为「模型平均在多少个候选之间犹豫」：困惑度 10 大致相当于每个位置有 10 个势均力敌的选择。它随语言、词表大小、文本领域剧烈变化，因此只能用于同分布模型的横向比较，跨数据集比较没有意义。",
      avoid: ["复杂度", "混乱度"],
      related: ["cross-entropy", "language-model", "surprise"], tags: ["评估", "语言模型"]
    },
    {
      id: "gradient", en: "gradient", zh: "梯度", aka: ["gradient vector", "导数向量"], pinyin: "ti du",
      cat: "math", level: "basic", src: "glossary",
      def: "损失上升最快的方向；负梯度才是最速下降方向。",
      long: "「负梯度是下降最快方向」有两个隐含前提：度量是欧氏度量、步长无穷小。离开这两点结论就不成立——Adam 之所以比 SGD 走得更稳，正是换了一套等效度量（条件数不同，最陡方向就不同）。这也是「梯度大不等于重要」的原因。",
      avoid: ["斜率（单变量概念）", "导数（多变量时应说偏导/梯度）"],
      related: ["learning-rate", "backpropagation", "gradient-clipping"], tags: ["优化"]
    },
    {
      id: "learning-rate", en: "learning rate", zh: "学习率", aka: ["lr", "步长"], pinyin: "xue xi lv",
      cat: "math", level: "basic", src: "glossary",
      def: "每次沿负梯度方向挪多远。",
      long: "它是实践中最敏感的超参数：太大损失震荡甚至发散，太小训练慢且容易卡在坏区域。常见做法是先 warmup 再按余弦或倒数平方根退火。判断 lr 是否合适有个简单信号——训练早期损失的最低点是否出现在接近最优的位置。",
      avoid: ["步长（只在不涉及 lr 调度时用）"],
      related: ["gradient", "warmup-schedule", "adam-optimizer"], tags: ["超参数", "优化"]
    },
    {
      id: "backpropagation", en: "backpropagation", zh: "反向传播", aka: ["反向传播算法", "backprop"], pinyin: "fan xiang chuan bo",
      cat: "math", level: "core", src: "glossary",
      def: "按计算图从输出回推每个参数该负多少责任。",
      long: "本质是链式法则的一次系统性复用：先前向缓存中间结果，再从损失往回逐层算偏导。它的效率在于每个中间梯度只算一次并反复利用，否则计算量会指数爆炸。显存峰值也主要花在这里——存下的中间激活就是反向传播的「学费」，梯度检查点正是用重算换显存。",
      avoid: ["BP（首次出现不缩写）", "倒退传播"],
      related: ["gradient", "activation-function", "gradient-checkpointing"], tags: ["训练", "算法"]
    },
    {
      id: "activation-function", en: "activation function", zh: "激活函数", aka: ["激活", "非线性单元"], pinyin: "ji huo han shu",
      cat: "math", level: "basic", src: "glossary",
      def: "给网络加入非线性的逐元素开关。",
      long: "没有激活函数，多层线性变换折叠后仍等价于单层，深度就失去意义。ReLU 因计算便宜且不饱和而统治了深层网络，代价是负半边梯度为零（神经元可能永久「死掉」）；大模型时代 GELU、SwiGLU 用平滑过渡缓解这一点。",
      avoid: ["激励函数"],
      related: ["neuron", "residual-connection", "layernorm"], tags: ["神经网络"]
    },
    {
      id: "logit", en: "logit", zh: "未归一化得分", aka: ["logits", "原始分数"], pinyin: "wei gui yi hua de fen",
      cat: "math", level: "core", src: "glossary",
      def: "softmax 之前的实数分数。",
      long: "词元之间的相对大小决定归一化后的概率，因此温度、top-p、top-k 全都作用在 logit 上。两个 logit 的差才是信息量：同时加一个常数，softmax 结果不变——这解释了为何损失对 logit 的梯度具有良好的形式。",
      avoid: ["logits 裸用不译", "对数几率（数学语境可用，工程语境生硬）"],
      related: ["softmax", "temperature", "sampling"], tags: ["解码"]
    },
    {
      id: "infonce", en: "InfoNCE", zh: "InfoNCE", aka: ["InfoNCE loss", "对比损失"], pinyin: "",
      cat: "math", level: "advanced", src: "glossary",
      def: "对比学习的损失：把配对样本的相似度，从一批负样本里「考」出来。",
      long: "形式上是一个 softmax 交叉熵：把正样本当作「正确答案」，其余批次内样本当负例，要求正样本的得分在候选中最高。它给出的是互信息下界，负样本越多下界越紧，因此大 batch 对对比学习有实质帮助，而不只是快。",
      avoid: ["把 InfoNCE 与「三元组损失」混为一谈"],
      related: ["clip", "contrastive-learning", "cross-entropy"], tags: ["对比学习", "损失"]
    },
    {
      id: "vector-quantization", en: "vector quantization", zh: "向量量化", aka: ["VQ", "码本量化", "VQ-VAE"], pinyin: "xiang liang liang hua",
      cat: "math", level: "advanced", src: "glossary",
      def: "把连续向量硬映射到一本有限码本上，从而让图像也能表示成离散词元。",
      long: "选最近的码本条目这一步不可导，梯度需靠直通估计器绕过，码本本身用另一套更新规则。它的价值在于把「无限取值」压成「有限词表」，于是图像可以像文本一样自回归生成；代价是码本坍缩（大部分码字没被用到）与重构损失。",
      avoid: ["VQ（首次出现不缩写）", "量化（与推理加速的量化不是一回事）"],
      related: ["embedding", "diffusion-model", "quantization"], tags: ["表示", "生成"]
    },
    {
      id: "calibration", en: "calibration", zh: "校准", aka: ["置信度校准", "概率校准"], pinyin: "jiao zhun",
      cat: "math", level: "advanced", src: "glossary",
      def: "模型报出的置信度与实际正确率是否一致。",
      long: "一个「校准良好」的模型，在它自称 80% 确定的那些回答里，确实约有 80% 是对的。它与对齐是两回事：对齐管「做得对不对人想要」，校准管「说的数准不准」。大模型普遍过度自信，温度缩放是最便宜的修法，但它只改分布不改真实能力。",
      avoid: ["与 alignment 混用", "把「置信度」当作正确率"],
      related: ["alignment", "temperature", "confusion-matrix"], tags: ["评估", "不确定性"]
    },
    {
      id: "softmax", en: "softmax", zh: "softmax", aka: ["归一化指数函数", "软最大"], pinyin: "",
      cat: "math", level: "basic",
      def: "把一串实数变成和为 1 的概率分布，且保持大小顺序。",
      long: "先取指数放大差距，再归一化。温度就是它前面那道除法。它的软性质是训练友好的关键：所有类别都拿到非零概率，因此梯度能流到每一个候选，而 argmax 是常数、无法学习。缺点是对极端值敏感，工程上要用 max-subtraction 技巧防溢出。",
      avoid: ["把它等同于归一化（指数这步才制造对比度）"],
      related: ["logit", "temperature", "cross-entropy"], tags: ["函数", "概率"]
    },
    {
      id: "pca",
      en: "Principal Component Analysis",
      zh: "主成分分析",
      aka: ["PCA", "主元分析"],
      pinyin: "zhuchengfenfenxi",
      cat: "math",
      level: "core",
      def: "沿方差最大的正交方向建立新坐标系，通常用奇异值分解求解，只捕捉线性结构，是压缩与去相关的经典做法。",
      long: "它必须先中心化，各特征还要按需要标准化，否则量纲大的维度会抢到第一主成分。主成分是数据方差方向而非类别方向，所以按它降维可能恰好丢掉最具判别力的那条细微变化。方差解释比例看着漂亮不代表下游好用，有标签时更该考虑监督式的投影。",
      avoid: ["把主成分直接解释为「业务上的关键因素」"],
      related: ["dimensionality-reduction", "linear-regression", "regularization"],
      tags: ["线性代数", "特征工程"]
    }
  );
})(window);
