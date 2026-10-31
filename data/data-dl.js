/*
 * AI 术语词典 · 分类数据：cat = "dl"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
    {
      id: "receptive-field", en: "receptive field", zh: "感受野", aka: ["有效感受野"], pinyin: "gan shou ye",
      cat: "dl", level: "core", src: "glossary",
      def: "输出位置能看到多少输入范围。",
      long: "卷积逐层堆叠时感受野近似线性甚至二次增长，理论上很深的网络每个位置都能「看到全图」。但有效感受野远小于理论值：高斯状的权重分布使中心区域的贡献压倒性地大，这正是现代架构重新引入全局注意力（以及大 kernel）的动机。",
      avoid: ["视野", "感受域"],
      related: ["convolutional-network", "long-context"], tags: ["卷积", "架构"]
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
      id: "decoder-only",
      en: "Decoder-Only Architecture",
      zh: "仅解码器架构",
      aka: ["Decoder-Only", "单向自回归架构", "GPT 式架构"],
      pinyin: "jinjiemaqijiagou",
      cat: "dl",
      level: "core",
      def: "只保留 Transformer 解码器堆栈、用因果掩码做单向建模的结构，因目标统一、易规模化而成为主流大模型形态。",
      long: "GPT 系列把它推广开来：输入与输出共用同一条词元序列，没有编码器与交叉注意力，同样参数预算下把全部容量用于自回归建模，扩规模时表现更稳。与之对照的编码器-解码器在需要显式读取长源序列的任务上仍有效。仅解码器不等于「只能生成」，判别任务也可写成生成，或用末位置的表示接分类头。",
      avoid: ["单塔模型", "生成器网络"],
      related: ["encoder-decoder", "causal-mask", "self-attention", "language-model", "ffn"],
      tags: ["架构", "Transformer"]
    },
    {
      id: "encoder-decoder",
      en: "Encoder-Decoder",
      zh: "编码器-解码器架构",
      aka: ["Seq2Seq", "序列到序列", "Enc-Dec"],
      pinyin: "bianmaqijiemaqijiagou",
      cat: "dl",
      level: "core",
      def: "源序列先由双向编码器编成表示，再由自回归解码器经交叉注意力读取该表示逐词元输出，适合输入输出不对齐的转换任务。",
      long: "源自神经机器翻译与 seq2seq 传统：编码器可一次看全文，解码器保持单向生成，二者用交叉注意力连接。T5、Whisper 与多数摘要、翻译模型沿用此结构。相比仅解码器，它把「读」与「写」分离，源序列表示可复用、编码一次的键值不必随生成重复参与，但双向预训练目标与统一自回归目标难以同时最优化。",
      avoid: ["双向解码器", "编解码同构"],
      related: ["cross-attention", "decoder-only", "self-attention", "language-model", "attention"],
      tags: ["架构", "Transformer"]
    },
    {
      id: "mixture-of-experts",
      en: "Mixture of Experts",
      zh: "专家混合",
      aka: ["MoE", "稀疏专家混合", "MoE 架构"],
      pinyin: "zhuanjiahunhe",
      cat: "dl",
      level: "advanced",
      def: "在前馈层旁并列多个专家、由门控网络只激活其中少数几个，用稀疏路由把总参数量与单词元计算量解耦，代价是显存与训练不稳。",
      long: "Switch Transformer 与 GShard 把路由简化为每词元只送一两个专家，并加负载均衡损失纠正专家被使用得极不均的现象。参数量随专家数增长而每词元前向算力近似不变，因此能以较低训练成本换更大容量；但全部专家权重都需常驻显存，跨设备分发还带来通信开销与吞吐抖动。路由是把词元分流到不同子网络，与多头注意力、模型集成都不是一回事。",
      avoid: ["多模型集成", "多头注意力"],
      related: ["ffn", "scaling-law", "parameter", "inference", "token"],
      tags: ["架构", "稀疏计算"]
    },
    {
      id: "positional-interpolation",
      en: "Position Interpolation",
      zh: "位置插值",
      aka: ["PI 位置插值", "线性位置插值", "RoPE 插值"],
      pinyin: "weizhichazhi",
      cat: "dl",
      level: "advanced",
      def: "把旋转位置编码的角度索引按比例压缩，使预训练长度之外的位置仍落在已学过的数值区间，以低成本扩展上下文窗口。",
      long: "直接把超出训练范围的位置号送进模型，会遇上从未见过的旋转角度而严重退化；把位置索引除以缩放系数，相当于把更长的序列压回训练时的角度范围。插值后相邻词元的角度差变小，短程分辨力下降，通常还要少量长文本继续训练才能恢复质量。它是后续一系列长上下文改进的起点，相比重训位置方案代价小得多。",
      avoid: ["位置外推", "无损扩窗"],
      related: ["rope", "positional-encoding", "long-context", "context-window"],
      tags: ["位置编码", "长上下文"]
    },
    {
      id: "dropout",
      en: "Dropout",
      zh: "随机失活",
      aka: ["Dropout 正则化", "丢弃法"],
      pinyin: "suijishihuo",
      cat: "dl",
      level: "core",
      def: "训练时按概率随机屏蔽一部分激活值，迫使网络不敢依赖单个神经元，代价是需要更多轮次收敛，推理时必须关闭。",
      long: "它等价于对指数多套子网络做加权平均，是一种便宜的隐式集成。机制上是缩放而不是剪权重，参数并没有变少，只是有效容量下降。推理时要用全部神经元并按比例补偿，因此训练与推理的前向计算并不相同，忘记切换模式会拿到明显异常的分数。在带残差的深层网络与归一化同用时，它的收益已大幅下降。",
      avoid: ["把失活率当作「剪枝比例」", "推理阶段仍保持开启"],
      related: ["regularization", "l1-l2-regularization", "data-augmentation", "generalization"],
      tags: ["正则化", "训练动态"]
    },
    {
      id: "object-detection",
      en: "Object Detection",
      zh: "目标检测",
      aka: ["物体检测", "检测"],
      pinyin: "mubiaojiance",
      cat: "dl",
      level: "core",
      def: "同时回答图里有什么以及在哪里，输出带类别的边界框，评估把定位与分类联合起来算，不能只看分类准确率。",
      long: "从两阶段的先提议框再精修，到一阶段直接在网格上回归框，核心演进是去掉昂贵的候选生成。交并比阈值决定了什么算命中，所以同一模型换个交并比设定分数会大幅变化，比较结果时必须核对协议。密集小目标与遮挡一直是难点，因为定位误差对小子目标的交并比影响被放大。",
      avoid: ["用图像分类指标评估检测性能"],
      related: ["convolutional-network", "image-segmentation", "classification", "vision-transformer"],
      tags: ["计算机视觉", "定位"]
    },
    {
      id: "image-segmentation",
      en: "Image Segmentation",
      zh: "图像分割",
      aka: ["语义分割", "实例分割", "像素级分类"],
      pinyin: "tuxiangfenge",
      cat: "dl",
      level: "core",
      def: "给每个像素或区域打上标签，粒度比检测更细，分为只区分物体类别的语义分割与进一步区分个体实例的实例分割。",
      long: "语义分割不区分同类的两个物体，实例分割要分开，全景分割再额外处理背景，三者任务难度和标注成本逐级上升。逐像素分类存在类别极不均衡的问题，天空占据大半画面而小目标只占几行，损失必须重加权。编码器解码器结构里下采样丢失的细节要靠跳跃连接找回来，否则边界会糊。",
      avoid: ["把语义分割与实例分割当作同一任务"],
      related: ["object-detection", "convolutional-network", "classification", "vision-transformer"],
      tags: ["计算机视觉", "像素级"]
    },
    {
      id: "generative-adversarial-network",
      en: "Generative Adversarial Network",
      zh: "生成对抗网络",
      aka: ["GAN", "对抗生成网络"],
      pinyin: "shengchengduikangwangluo",
      cat: "dl",
      level: "advanced",
      def: "生成器造样本、判别器辨真假，两者交替训练形成对抗，样本逼真但训练不稳定且容易模式坍缩，覆盖度难以评估。",
      long: "它优化的是两个网络之间的极小极大问题，与最小化一个固定损失完全不同，因此没有「损失下降就是变好」这种直观信号。判别器过强会让生成器拿不到梯度，过弱则一起停在毫无意义的平衡点上，平衡靠工程经验维持。模式坍缩指生成器只覆盖真实分布的少数几个模式，用单一样本质量根本看不出来，这也是它在高质量可控生成上让位于扩散模型的直接原因。",
      avoid: ["把 GAN 的损失曲线当作收敛与否的判断依据"],
      related: ["diffusion-model", "convolutional-network", "unsupervised-learning"],
      tags: ["生成模型", "对抗训练"]
    },
    {
      id: "diffusion-model",
      en: "Diffusion Model",
      zh: "扩散模型",
      aka: ["扩散生成模型", "去噪扩散概率模型", "DDPM"],
      pinyin: "kuosanmoxing",
      cat: "dl",
      level: "advanced",
      def: "训练时一步步加噪并学会反向去噪，生成时从纯高斯噪声反复去噪得到样本，损失简单稳定，但采样需要多轮迭代。",
      long: "它把复杂的密度建模拆成一连串很容易的小去噪步骤，因此优化远比对抗式生成稳定，代价是推理要跑很多次前向。噪声调度决定了各步难度分布，也决定了采样能否用更少步数近似。与对抗式生成的根本区别在目标函数是否明确可算：前者有变分下界可以监控，后者只有对抗平衡，这也是它更适合大规模训练的原因。",
      avoid: ["认为扩散模型「不需要训练目标」", "把步数多误说成训练慢"],
      related: ["generative-adversarial-network", "vision-transformer", "convolutional-network", "data-augmentation"],
      tags: ["生成模型", "采样"]
    }
  );
})(window);
