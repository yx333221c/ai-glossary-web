/*
 * AI 术语词典 · 核心数据分片
 * 来源：另一项目 docs/glossary.md 的 51 条统一译名表（仅参考其译名与释义，本项目独立实现）
 * 字段：id / en / zh / aka / pinyin / py1 / cat / level / def / long / avoid / related / tags / src
 * src: "glossary" 表示该条目的译名与释义取自参考术语表
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  function add(list) { for (var i = 0; i < list.length; i++) T.push(list[i]); }

  add([
    /* ---------------- 数学与信息论 ---------------- */
    {
      id: "token", en: "token", zh: "词元", aka: ["词块", "token 单元"], pinyin: "ci yuan",
      cat: "math", level: "basic", src: "glossary",
      def: "模型处理文本的最小单位，既不是「词」也不是「字」。",
      long: "分词器把文本切成词元序列，模型看到的全部是词元编号。中文常见一字一到两词元，英文常见一个单词一到四个词元，因此「长度」在不同语言间不可直接类比。它决定了上下文窗口能装下多少内容，也直接决定计费与算力量级。",
      avoid: ["token（不加说明地裸用）", "字", "词"],
      related: ["embedding", "context-window", "perplexity"], tags: ["信息论", "文本"]
    },
    {
      id: "embedding", en: "embedding", zh: "嵌入", aka: ["向量表示", "embed"], pinyin: "qian ru",
      cat: "math", level: "core", src: "glossary",
      def: "把离散对象映射成连续向量，使「相似」变成可计算的远近。",
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

    /* ---------------- 神经网络与架构 ---------------- */
    {
      id: "receptive-field", en: "receptive field", zh: "感受野", aka: ["有效感受野"], pinyin: "gan shou ye",
      cat: "dl", level: "core", src: "glossary",
      def: "输出位置能看到多少输入范围。",
      long: "卷积逐层堆叠时感受野近似线性甚至二次增长，理论上很深的网络每个位置都能「看到全图」。但有效感受野远小于理论值：高斯状的权重分布使中心区域的贡献压倒性地大，这正是现代架构重新引入全局注意力（以及大 kernel）的动机。",
      avoid: ["视野", "感受域"],
      related: ["convolutional-network", "long-context"], tags: ["卷积", "架构"]
    },
    {
      id: "attention", en: "attention", zh: "注意力", aka: ["注意力机制", "attention mechanism"], pinyin: "zhu yi li",
      cat: "nlp", level: "core", src: "glossary",
      def: "按相关性为上下文各部分动态分配加权。",
      long: "与固定权重的卷积不同，注意力的权重是由内容当场算出来的，所以能建模任意距离的关系。「注意力」一词常被夸大成「模型在思考什么」：它只是一次加权求和，权重高不等于人类意义上的重要，把注意力图直接解释成因果理由是常见误读。",
      avoid: ["关注机制", "把注意力权重当作可解释性的证据"],
      related: ["qkv", "self-attention", "multi-head-attention", "ffn"], tags: ["架构", "Transformer"]
    },
    {
      id: "qkv", en: "query / key / value", zh: "查询 / 键 / 值", aka: ["Q/K/V", "query-key-value"], pinyin: "cha xun jian zhi",
      cat: "nlp", level: "core", src: "glossary",
      def: "想找什么 / 用来被比对的名片 / 比对后取走的内容。",
      long: "查询与键做点积得到打分，softmax 归一化后作为权重去加权取值。三者的角色由三个独立投影矩阵决定，不是同一个向量的三种叫法。要警惕：这里的「键」是连续打分用的表征，不同于数据库或向量检索里「精确命中」的键。",
      avoid: ["Q/K/V（正文首次不缩写）", "把 key 理解成检索索引"],
      related: ["attention", "kv-cache", "multi-head-attention"], tags: ["Transformer"]
    },
    {
      id: "permutation-equivariant", en: "permutation equivariant", zh: "排列等变", aka: ["等变性"], pinyin: "pai lie deng bian",
      cat: "dl", level: "advanced", src: "glossary",
      def: "输入行的顺序变了，输出行跟着变同样的顺序，但每行内容不变。",
      long: "自注意力是排列等变的：换一下输入顺序，输出只是同样换个顺序，每个位置的向量本身不变。这解释了为什么必须额外注入位置信息。注意它与「排列不变」（invariant）不是一回事——池化才是不变，打乱输入后输出的集合完全一样。",
      avoid: ["排列不变（那是另一回事，池化才不变）"],
      related: ["positional-encoding", "self-attention", "attention"], tags: ["性质", "Transformer"]
    },
    {
      id: "ffn", en: "feed-forward network", zh: "前馈网络", aka: ["FFN", "逐位置前馈层", "MLP 层"], pinyin: "qian kui wang luo",
      cat: "nlp", level: "core", src: "glossary",
      def: "逐位置两层全连接，注意力之后做非线性加工。",
      long: "在每个位置独立地把表征升维（通常 4 倍）、过非线性、再降回来，参数量常占 Transformer 的一半以上。有研究把它看作「键值记忆」：注意力负责把信息搬到位，前馈层负责按模式查表变换。它逐位置独立，所以不含跨位置信息流。",
      avoid: ["FFN（首次不缩写）", "全连接层（泛用易混）"],
      related: ["attention", "mixture-of-experts", "activation-function"], tags: ["Transformer", "架构"]
    },
    {
      id: "batchnorm", en: "BatchNorm", zh: "批归一化", aka: ["BN", "批量归一化"], pinyin: "pi gui yi hua",
      cat: "dl", level: "core", src: "glossary",
      def: "沿 batch 维对每个特征做标准化。",
      long: "同一个特征跨样本求均值方差，因此它的统计量依赖 batch：batch 很小时噪声大，训练与推理还需切换成累积统计量，这两者的不一致正是 BN 容易出问题的地方。序列任务里每个样本长度不一、且推理时不能跨样本统计，所以改用层归一化。",
      avoid: ["BN（首次不缩写）", "把它当正则化手段"],
      related: ["layernorm", "pre-ln-post-ln", "mini-batch"], tags: ["归一化", "训练"]
    },
    {
      id: "layernorm", en: "LayerNorm", zh: "层归一化", aka: ["LN", "层标准化"], pinyin: "ceng gui yi hua",
      cat: "dl", level: "core", src: "glossary",
      def: "对每个样本的特征维度做标准化。",
      long: "统计量只在单个 token 的特征维内计算，与其他样本、与其他位置无关，因此对 batch 大小和序列长度都不敏感，天然适合自回归生成。RMSNorm 进一步省掉减均值，只做尺度归一，效果接近且更便宜，已成为大模型默认选择。",
      avoid: ["LN（首次不缩写）"],
      related: ["batchnorm", "pre-ln-post-ln", "rmsnorm"], tags: ["归一化", "Transformer"]
    },
    {
      id: "pre-ln-post-ln", en: "pre-LN / post-LN", zh: "前接式 / 后接式", aka: ["Pre-LN", "Post-LN", "归一化位置"], pinyin: "qian jie shi hou jie shi",
      cat: "dl", level: "advanced", src: "glossary",
      def: "层归一化放在子层之前还是之后。",
      long: "后接式（原始 Transformer）训练末期效果更好，但深层时梯度幅度剧烈，需要 warmup 才敢训。前接式让残差主干保持近似恒等，深层更稳定、可以少做 warmup，代价是最终质量常略逊，且容易出现「层冗余」。孰优本站标注为争议：结论强依赖深度、lr 调度与任务。",
      avoid: ["把它说成有定论的取舍"],
      related: ["layernorm", "residual-connection", "warmup-schedule"], tags: ["架构", "训练"]
    },
    {
      id: "residual-connection", en: "residual connection", zh: "残差连接", aka: ["跳跃连接", "skip connection", "恒等映射"], pinyin: "can cha lian jie",
      cat: "dl", level: "core", src: "glossary",
      def: "把输入直接加到输出上，保住梯度通路。",
      long: "层只需学「在原有基础上改一点」，目标从拟合映射变成学增量，优化难度大幅下降；同时梯度可沿恒等路径直达底层，百层网络才成为可能。副作用是主干幅度随深度累积增长，因此需要归一化来稳定尺度。",
      avoid: ["跳跃连接（易与残差混淆，严格说不同）"],
      related: ["layernorm", "pre-ln-post-ln", "activation-function"], tags: ["架构", "优化"]
    },
    {
      id: "positional-encoding", en: "positional encoding", zh: "位置编码", aka: ["位置信息注入", "绝对位置编码"], pinyin: "wei zhi bian ma",
      cat: "nlp", level: "core", src: "glossary",
      def: "把「第几个」信息注入词元表示。",
      long: "自注意力本身排列等变，不加位置信息则「猫追狗」与「狗追猫」无法区分。正弦编码用不同频率的三角函数提供多尺度相对关系；可学习编码更灵活但外推差。现代模型普遍转向相对位置方案，因为它直接编码「相隔多远」而非「我在哪」。",
      avoid: ["位置嵌入（与词元嵌入混淆）"],
      related: ["rope", "permutation-equivariant", "attention"], tags: ["Transformer"]
    },
    {
      id: "rope", en: "RoPE", zh: "旋转位置编码", aka: ["Rotary Position Embedding", "旋转编码"], pinyin: "xuan zhuan wei zhi bian ma",
      cat: "nlp", level: "advanced", src: "glossary",
      def: "用旋转角度表示相对位置的编码方案。",
      long: "把查询与键按位置乘上一个旋转矩阵，点积之后结果只依赖两者位置差——绝对位置被注入到表示里，而打分天然变成相对。由于是乘性而非加性，外推行为比绝对编码好，配合位置插值还能把窗口拉长。缺点是长距离维度旋转极快，需 YaRN 类方法修正。",
      avoid: ["把它称作绝对位置编码"],
      related: ["positional-encoding", "attention", "qkv"], tags: ["Transformer", "长上下文"]
    },
    {
      id: "convolutional-network", en: "Convolutional Neural Network", zh: "卷积神经网络", aka: ["CNN", "卷积网", "ConvNet"], pinyin: "juan ji shen jing wang luo",
      cat: "dl", level: "core",
      def: "用卷积核在网格数据上滑动、以局部连接与权重共享提取特征的架构。",
      long: "两个先验让它比全连接高效得多：局部性（相邻像素相关）与平移等变（同一模式出现在哪里都一样）。卷积核在空间上共享同一组权重，参数量与图尺寸无关。它在图像领域统治了近十年，随后在多数任务上被视觉 Transformer 取代，但在低算力与流式场景仍不过时。",
      avoid: ["把 CNN 说成只能处理图像（1D 卷积常用于时序与音频）"],
      related: ["receptive-field", "vision-transformer", "patch"], tags: ["架构", "视觉"]
    },
    {
      id: "neuron", en: "artificial neuron", zh: "人工神经元", aka: ["神经元", "单元", "node"], pinyin: "ren gong shen jing yuan",
      cat: "dl", level: "basic",
      def: "对输入做加权求和、加偏置、再过激活函数的最小计算单元。",
      long: "单个神经元只能画出一次线性划分，「多层感知器」的表达能力来自成百上千个神经元划分叠加后再做非线性弯曲。所谓「神经元识别猫」是过度简化：单个神经元通常对许多不相关概念都有反应（超定位现象），可靠的信息更多分布在群体中。",
      avoid: ["用生物神经元的行为类比深度学习单元"],
      related: ["activation-function", "weight", "multilayer-perceptron"], tags: ["神经网络"]
    },
    {
      id: "vision-transformer", en: "Vision Transformer", zh: "视觉 Transformer", aka: ["ViT", "图像 Transformer"], pinyin: "shi jue transformer",
      cat: "multimodal", level: "core",
      def: "把图像切成若干固定大小的图像块，当作序列喂给标准 Transformer。",
      long: "它去掉了卷积的局部先验，换来全局注意力：每个块一开始就能看全图。代价是需要更大数据才有归纳偏置不足的补偿，小数据集上往往输给 CNN。这一视角也把图像变成了「一串词元」，是图文统一建模的关键一步。",
      avoid: ["把 ViT 当成「专为图像设计的网络」"],
      related: ["patch", "attention", "convolutional-network"], tags: ["视觉", "架构"]
    },

    /* ---------------- 训练与对齐 ---------------- */
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
      id: "emergent-ability", en: "emergent ability", zh: "涌现能力", aka: ["涌现", "emergence"], pinyin: "yong xian neng li",
      cat: "frontier", level: "advanced", src: "glossary",
      def: "规模跨过某阈值后才出现的能力。",
      long: "多步算术、思维链带来的推理提升常被视为涌现。本站标注此为争议概念：有研究指出，若用连续指标（如逐步正确率）替代「答对与否」的跳变指标，所谓涌现只是度量方式造成的错觉，能力其实在平滑增长。写作时建议保留英文原词并注明争议。",
      avoid: ["把涌现说成已被证实的现象", "神秘化表述（「量变引起质变」不算解释）"],
      related: ["scaling-law", "chain-of-thought", "benchmark"], tags: ["争议", "大模型"]
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
      id: "calibration", en: "calibration", zh: "校准", aka: ["置信度校准", "概率校准"], pinyin: "jiao zhun",
      cat: "math", level: "advanced", src: "glossary",
      def: "模型报出的置信度与实际正确率是否一致。",
      long: "一个「校准良好」的模型，在它自称 80% 确定的那些回答里，确实约有 80% 是对的。它与对齐是两回事：对齐管「做得对不对人想要」，校准管「说的数准不准」。大模型普遍过度自信，温度缩放是最便宜的修法，但它只改分布不改真实能力。",
      avoid: ["与 alignment 混用", "把「置信度」当作正确率"],
      related: ["alignment", "temperature", "confusion-matrix"], tags: ["评估", "不确定性"]
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
      id: "in-context-learning", en: "in-context learning", zh: "上下文学习", aka: ["ICL", "示例提示"], pinyin: "shang wen xue xi",
      cat: "nlp", level: "core",
      def: "不改一个参数，仅靠提示里给的示范就学会新任务。",
      long: "与微调的根本区别是「知识进的是上下文而不是权重」：换一次提示就换一次行为，关掉会话就消失。它使模型表现出惊人的适应性，但也很脆——示范顺序、标签分布不均、示例长度都会显著影响效果，这些敏感性与「真的学会了」并不相容。",
      avoid: ["把它称为在线学习（in-context 与 online learning 不是一回事）"],
      related: ["few-shot", "zero-shot-prompting", "chain-of-thought"], tags: ["提示", "能力"]
    },

    /* ---------------- 推理与生成 ---------------- */
    {
      id: "inference", en: "inference", zh: "推理", aka: ["推断", "前向计算", "预测"], pinyin: "tui li",
      cat: "inference", level: "basic", src: "glossary",
      def: "用训好的模型生成输出。",
      long: "中文「推理」在这里承担双重含义：一是工程上的部署预测（相对训练），二是认知意义上的逻辑推演。日常讨论中两者常混，写清楚是必要的。工程视角关心的是延迟、吞吐、显存；认知视角关心的是多步分解，二者优化的对象完全不同。",
      avoid: ["推断（易与逻辑推断混）"],
      related: ["sampling", "kv-cache", "serving-latency"], tags: ["部署"]
    },
    {
      id: "hallucination", en: "hallucination", zh: "幻觉", aka: ["虚构", "编造"], pinyin: "huan jue",
      cat: "inference", level: "core", src: "glossary",
      def: "生成流畅但与事实或上下文不符的内容。",
      long: "根源在训练目标：模型被优化成「像样地续写」，而不是「说真话」。它没有内建的事实校验通路，当训练分布里缺少答案时，最像样的高概率续写往往是一个具体但错误的说法——拒答反而是低概率行为。因此加事实提示、给检索材料能缓解，但不能根除。",
      avoid: ["胡说八道（口语可用，正文用「幻觉」）", "把它归因于「模型故意骗人」"],
      related: ["rag", "calibration", "language-model"], tags: ["缺陷", "事实性"]
    },
    {
      id: "temperature", en: "temperature", zh: "温度", aka: ["采样温度", "temp"], pinyin: "wen du",
      cat: "inference", level: "core", src: "glossary",
      def: "采样前对 logits 的缩放系数，控制分布平坦度。",
      long: "把 logits 除以 T 再 softmax：T→0 退化为总选最大分（贪心），T 增大则分布变平、冷门候选更容易被选中。名字来自统计物理，但这是借来的直觉而非同一机制。要注意 T 不改变候选之间的相对顺序，也不修正模型本身的过度自信。",
      avoid: ["把它当作「创造力开关」的因果解释"],
      related: ["logit", "sampling", "top-p"], tags: ["解码"]
    },
    {
      id: "sampling", en: "sampling", zh: "采样", aka: ["抽样", "解码"], pinyin: "cai yang",
      cat: "inference", level: "core", src: "glossary",
      def: "按概率分布挑下一个词元的过程。",
      long: "同一前向结果，采样与否决定输出是否可复现。采样把模型的概率信念转成具体文本，因此「模型有多确信」和「这次挑中谁」是两个层面的问题。工程上常用低温加核采样平衡稳定与多样；需要精确答案的场景（代码、抽取）应降低随机性。",
      avoid: ["把 sampling 译成「抽样调查」义"],
      related: ["top-p", "temperature", "beam-search"], tags: ["解码"]
    },
    {
      id: "top-p", en: "top-p / nucleus sampling", zh: "核采样", aka: ["Nucleus", "top-p 采样"], pinyin: "he cai yang",
      cat: "inference", level: "core", src: "glossary",
      def: "只保留累计概率达到 p 的最小词元集合。",
      long: "候选集合的大小随当前分布的尖锐程度动态变化：模型确信时只留几个，模型犹豫时留下一大批——这正是它优于固定 top-k 的地方。局限在于集合是按概率从高到低取的，一旦排序本身错（比如一个高概率但有害的续写），后续无法挽救。",
      avoid: ["与 top-k 混用（那是固定候选数）"],
      related: ["sampling", "top-k", "temperature"], tags: ["解码"]
    },
    {
      id: "context-window", en: "context window", zh: "上下文窗口", aka: ["上下文长度", "最大长度", "window"], pinyin: "shang wen xia chuang kou",
      cat: "inference", level: "core", src: "glossary",
      def: "一次推理能看到的词元上限。",
      long: "它是同时约束输入与输出的总预算，不是「只看输入」。窗口越长，自注意力的计算量按平方增长、键值缓存按线性增长，成本与延迟都会上升。厂商标称的窗口长度也不等于有效使用长度：中段信息在长上下文中容易被忽视（lost in the middle）。",
      avoid: ["语境长度", "把标称窗口当作可靠可用长度"],
      related: ["kv-cache", "long-context", "needle-in-haystack"], tags: ["限制", "成本"]
    },
    {
      id: "kv-cache", en: "KV cache", zh: "键值缓存", aka: ["KV Cache", "键值对缓存"], pinyin: "jian zhi huan cun",
      cat: "inference", level: "core", src: "glossary",
      def: "复用历史词元的键与值以避免重复计算。",
      long: "自回归生成时每步都会为新词元算出全部历史位置的键值；缓存之后只算新增的那一份，把每步的注意力从平方降到线性。代价是省算力不省内存：缓存要常驻显存，长度翻倍即占用翻倍，这也是长上下文推理最紧的瓶颈。量化、分页、张量并行都围绕它展开。",
      avoid: ["把它当作「模型的记忆」", "以为缓存也省下内存"],
      related: ["qkv", "context-window", "attention"], tags: ["优化", "显存"]
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
      id: "language-model", en: "language model", zh: "语言模型", aka: ["LM", "生成式模型"], pinyin: "yu yan mo xing",
      cat: "nlp", level: "basic",
      def: "给一段文本（或下一词元）估概率的模型。",
      long: "几乎所有现代大模型都建立在「下一词元预测」这一个目标上：把联合概率分解成一串条件概率逐词生成。理解这一点，就能理解幻觉、能力涌现与规模定律——它们都是同一个目标的副产物。区分「能预测下一词」与「理解语言」的争论也由此而来。",
      avoid: ["把 LM 等同于聊天机器人", "随机鹦鹉（这只是立场，不是定义）"],
      related: ["pretraining", "perplexity", "token"], tags: ["基础", "NLP"]
    },
    {
      id: "chain-of-thought", en: "Chain-of-Thought", zh: "思维链", aka: ["CoT", "推理链"], pinyin: "si wei lian",
      cat: "nlp", level: "core",
      def: "让模型先把中间步骤写出来再给答案。",
      long: "有效的直接原因很朴素：每个写下的词元都会进入后续的条件，等于把一次前向的容量摊到多步上去，也给了模型自我校正的落脚点。因此它的收益依赖基座能力——在够大的模型上有用，在小模型上可能反而引入错误步骤。要注意「步骤写出来」不等于「模型真的这样思考」。",
      avoid: ["把 CoT 输出当作模型内部过程的忠实记录"],
      related: ["in-context-learning", "emergent-ability", "reasoning-token"], tags: ["提示", "推理"]
    },

    /* ---------------- 多模态 ---------------- */
    {
      id: "multimodal", en: "multimodal", zh: "多模态", aka: ["跨模态", "多模态模型"], pinyin: "duo mo tai",
      cat: "multimodal", level: "core", src: "glossary",
      def: "同一模型处理文本与图像等多种输入形态。",
      long: "关键不在于「都支持」，而在于不同模态被映射进同一表征空间，从而可以互相指称与推理。早期做法是各模态一个编码器再拼接，现在更多是把图像离散成词元后与文本一起自回归。这带来一个实际后果：图像分辨率越高，占用的上下文词元越多。",
      avoid: ["把「多模态」与「多任务」混用"],
      related: ["clip", "patch", "vector-quantization"], tags: ["多模态"]
    },
    {
      id: "clip", en: "CLIP", zh: "图文对比模型", aka: ["CLIP", "对比语言图像预训练"], pinyin: "tu wen dui bi mo xing",
      cat: "multimodal", level: "core", src: "glossary",
      def: "图像与文本各一个编码器，训练时把配对的拉近、不配对的推开。",
      long: "用海量网络图文对做弱监督，不需人工标签就得到共享语义空间：比较两个向量的方向即可判断「图与这句话搭不搭」。它的直接产品是零样本分类——把类别名写成句子当候选。弱点是分布外泛化不稳，且对计数、空间关系、文字识别等结构化内容先天薄弱。",
      avoid: ["把它当作 OCR 工具", "以为它「看懂」了图像"],
      related: ["infonce", "zero-shot", "multimodal"], tags: ["对比学习", "视觉"]
    },
    {
      id: "patch", en: "patch", zh: "图像块", aka: ["图像小块", "patch embedding"], pinyin: "tu xiang kuai",
      cat: "multimodal", level: "core", src: "glossary",
      def: "视觉 Transformer 把图像切成的固定大小小块。",
      long: "每张图被切成若干块并线性投影成向量，从而当作词元参与注意力。这一步把视觉问题「语言化」了，是图文统一建模的接口。需要说明它在模型中充当词元（本站不造「图像块词元」这类复合词）；块越小、序列越长、细节越清楚，代价是计算量上升。",
      avoid: ["方块", "图块（口径不一）"],
      related: ["vision-transformer", "clip", "multimodal"], tags: ["视觉", "架构"]
    },
    {
      id: "zero-shot", en: "zero-shot classification", zh: "零样本分类", aka: ["零样本", "zero-shot"], pinyin: "ling yang ben fen lei",
      cat: "ml", level: "core", src: "glossary",
      def: "该任务一个标注都不给、不加分类头，只靠候选文本描述来分类。",
      long: "定义要点在「没有这个任务的训练数据」，而**不等于**「模型从没见过这个概念」——类别词很可能早就出现在预训练语料里。机制上把类别名写成句子，用图文相似度选最大。因此它的性能上限受文本编码器对类别描述的理解支配，换个提示措辞结果就可能变。",
      avoid: ["把它解释成「完全陌生的概念也能识别」"],
      related: ["clip", "few-shot", "in-context-learning"], tags: ["评估", "范式"]
    },

    /* ---------------- 智能体与应用 ---------------- */
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

    /* ---------------- 安全与评估 ---------------- */
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
      id: "scalable-oversight", en: "scalable oversight", zh: "可扩展监督", aka: ["可扩展的监督", "weak-to-strong"], pinyin: "ke kuo zhan jian du",
      cat: "frontier", level: "advanced", src: "glossary",
      def: "如何用较弱的人监督较强的模型。",
      long: "当模型输出超出人类可核验范围（几百页证明、复杂代码库）时，逐条人工审核在成本上已经不可行，但 RLHF 式偏好标注恰好不需要标注者比模型更强——这本身可能是个隐患。围绕这个问题的思路包括分层抽查、模型互评、弱到强泛化，都还没有公认答案。",
      avoid: ["把它简化为「加人工审核」"],
      related: ["red-teaming", "rlhf", "alignment"], tags: ["对齐", "前沿"]
    },

    /* ---------------- 训练补充（与参考表配套） ---------------- */
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
    }
  ]);
})(window);
