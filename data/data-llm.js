// AI 术语词典数据分片：大语言模型 / NLP / 生成
(function () {
  var T = (window.AI_TERMS = window.AI_TERMS || []);

  /* ---------------- 语言模型与整体架构 ---------------- */
  T.push(
    {
      id: "autoregressive-generation",
      en: "Autoregressive Generation",
      zh: "自回归生成",
      aka: ["AR 生成", "逐词元生成", "自回归解码"],
      pinyin: "zhuiguishengcheng",
      cat: "nlp",
      level: "core",
      def: "把序列概率分解为逐位置条件概率的连乘，生成时输出一个词元就把它拼回输入再预测下一个，因此推理天然串行。",
      long: "条件 p(x_t | x_小于 t) 靠因果掩码在训练时一次性并行算完整条序列，却与推理时逐步生成完全一致。与之相对的是扩散模型等非自回归方案，可并行去噪整段输出。自回归的串行特性让延迟随输出长度线性增长，这正是键值缓存、连续批处理与投机解码等优化存在的原因。",
      avoid: ["并行生成", "自回归编码"],
      related: ["language-model", "causal-mask", "kv-cache", "decoder-only", "greedy-decoding"],
      tags: ["生成", "序列模型"]
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
    }
  );

  /* ---------------- 注意力机制 ---------------- */
  T.push(
    {
      id: "self-attention",
      en: "Self-Attention",
      zh: "自注意力",
      aka: ["内部注意力", "缩放点积自注意力"],
      pinyin: "zizhuyili",
      cat: "nlp",
      level: "core",
      def: "序列内部每个位置都与所有位置计算相关性并加权聚合信息的机制，让任意两个词元以常数路径长度直接交互。",
      long: "对查询、键、值做投影后计算 softmax(QK^T/除以根号 d) 再乘 V，路径长度为常数而计算量随序列长度平方增长。它取代了循环网络的时序传递，把顺序信息完全交给位置编码承担——去掉位置编码后这个算子本身是置换等变的。常见误解是把它当外部检索：权重只是在当前表示上的一次动态加权，不保证能找到正确来源。",
      avoid: ["自相关", "内部检索"],
      related: ["attention", "qkv", "multi-head-attention", "softmax", "cross-attention", "permutation-equivariant"],
      tags: ["注意力", "机制"]
    },
    {
      id: "multi-head-attention",
      en: "Multi-Head Attention",
      zh: "多头注意力",
      aka: ["MHA", "多路注意力", "多头自注意力"],
      pinyin: "duotouzhuyili",
      cat: "nlp",
      level: "core",
      def: "把查询、键、值投影到多个子空间并行做注意力，再拼接经线性变换，让不同头分担句法、指代等不同的匹配模式。",
      long: "多头不等于多个模型：所有头共享同一份输入输出维度，只是把它切成若干 head_dim。实践中不少头彼此冗余，剪掉一部分对质量影响很小；键值头共享（GQA、MQA）正是利用这一点把注意力头共享同一份 K/V 投影，以降低解码期的缓存显存。头数与每头维度要一起看，总维度不变而头数增多时每个子空间的表达力反而下降。",
      avoid: ["多头即多个模型", "专家混合"],
      related: ["self-attention", "attention", "qkv", "ffn", "mixture-of-experts"],
      tags: ["注意力", "架构"]
    },
    {
      id: "cross-attention",
      en: "Cross-Attention",
      zh: "交叉注意力",
      aka: ["编码器注意力", "条件注意力", "外部注意力"],
      pinyin: "jiaochazhuyili",
      cat: "nlp",
      level: "core",
      def: "查询来自一侧序列、键与值来自另一侧序列的注意力，用于解码器读取编码器输出，也是多模态注入外部特征的常见接口。",
      long: "在编码器-解码器里它是「读源文本」的通道；在文生图与视觉语言模型里则把图像特征或文本条件注入主干。与自注意力的差别只在 K/V 的来源，公式一致，代价是 K/V 侧长度直接决定计算与缓存量。把检索到的文档拼进前缀、或把上下文压成少量记忆槽再接回去，本质上是在替代或压缩这种读取。",
      avoid: ["自注意力", "互注意力"],
      related: ["self-attention", "attention", "encoder-decoder", "multimodal", "rag"],
      tags: ["注意力", "条件注入"]
    },
    {
      id: "causal-mask",
      en: "Causal Mask",
      zh: "因果掩码",
      aka: ["单向掩码", "下三角掩码", "autoregressive mask"],
      pinyin: "yinguoyanma",
      cat: "nlp",
      level: "core",
      def: "在注意力分数矩阵上把未来位置置为负无穷，使每个词元只能看见左侧历史，是自回归训练得以并行的关键技巧。",
      long: "训练时整条序列一次前向，靠掩码保证位置 t 的预测不依赖 t 之后的词元，从而与推理时逐步生成的条件分布完全一致。它必须与位置编码配合：加了掩码后算子仍是加权聚合，只是限制可见范围。要区分两种掩码——因果掩码规定「能不能看未来」，填充掩码处理「补齐的零不该参与」，二者可以叠加。",
      avoid: ["双向掩码", "填充掩码"],
      related: ["attention", "self-attention", "autoregressive-generation", "attention-mask", "decoder-only"],
      tags: ["掩码", "自回归"]
    },
    {
      id: "attention-mask",
      en: "Attention Mask",
      zh: "注意力掩码",
      aka: ["mask 矩阵", "填充掩码", "padding mask"],
      pinyin: "zhuyiliyanma",
      cat: "nlp",
      level: "core",
      def: "标记哪些键位置可以参与注意力计算的布尔张量，常见形态有因果掩码与屏蔽补零词元的填充掩码，二者可叠加使用。",
      long: "实现上通常是在 softmax 之前给分数加上零或负无穷，而不是把词元真的删掉。批量训练把不等长句子补齐时必须靠它，否则补零位置会分走真实词元的注意力质量。填充掩码写错一般不报错、只让输出变差，属于难排查的静默 bug；推理阶段的续写与前缀缓存也依赖掩码与已有键值正确拼接。",
      avoid: ["注意力遮罩", "蒙版"],
      related: ["causal-mask", "attention", "self-attention", "token", "eos-token"],
      tags: ["掩码", "工程实现"]
    }
  );

  /* ---------------- 分词与词表 ---------------- */
  T.push(
    
    {
      id: "tokenizer",
      en: "Tokenizer",
      zh: "分词器",
      aka: ["切词器", "词元化器", "tokenizer 模型"],
      pinyin: "fenciqi",
      cat: "nlp",
      level: "basic",
      def: "把原始文本切成词元序列并映射为整数编号的模块，决定模型能看见什么粒度，也直接影响多语言、数字与代码的处理难度。",
      long: "现代大模型多用子词方案：文本先经 UTF-8 编码成字节，再按学到的合并规则切成落在有限词表内的片段。分词器与模型一同确定，换分词器基本等于换一个模型族；词元边界会改变数字、拼写与短串的表示方式。此处的「分词」不是语言学意义的成词切分，中文常按字或字节切，英文反而把高频词留成整词元。",
      avoid: ["分词即语言学切词", "向量化"],
      related: ["token", "bpe", "wordpiece", "sentencepiece", "vocabulary", "out-of-vocabulary"],
      tags: ["分词", "输入表示"]
    },
    {
      id: "bpe",
      en: "Byte-Pair Encoding",
      zh: "字节对编码",
      aka: ["BPE", "子词合并算法", "byte-level BPE"],
      pinyin: "zijieduibianma",
      cat: "nlp",
      level: "core",
      def: "从字符或字节出发，反复合并语料中最高频的相邻对以构造子词词表的切分算法，被 GPT 系列广泛采用。",
      long: "学习词表时用频率统计挑选合并规则，编码时按规则优先级依次套用；它与 WordPiece 的差别只在合并判据——BPE 看相邻对计数，WordPiece 看语料上的似然增益。字节级 BPE 从 256 个字节符号起步，任何文本都能编码，因此不再有严格意义的未登录词，但词元边界不再对应语言单位，数字与长符号串会被切成碎块。",
      avoid: ["双字节编码", "字节序"],
      related: ["tokenizer", "wordpiece", "vocabulary", "token", "sentencepiece"],
      tags: ["分词", "子词"]
    },
    {
      id: "wordpiece",
      en: "WordPiece",
      zh: "词片切分",
      aka: ["WordPiece", "词片模式", "子词切分"],
      pinyin: "cipianqiefen",
      cat: "nlp",
      level: "core",
      def: "BERT 采用的子词构造方法，按合并后对语料覆盖增益最大的原则生长词表，切分结果称词片而不是完整词。",
      long: "与 BPE 同属子词族：都用高频片段缩短序列长度，都用「##」一类续接标记表示非首片段。差别在合并判据——WordPiece 以训练语料上的似然增益选择合并，倾向保留真实出现过的片段，BPE 则纯按相邻对计数。词表规模与最大词元长度共同决定信息密度；同一段文本在不同分词器下的困惑度数值不可直接比较。",
      avoid: ["词向量分片", "词干提取"],
      related: ["bpe", "tokenizer", "vocabulary", "token"],
      tags: ["分词", "子词"]
    },
    {
      id: "sentencepiece",
      en: "SentencePiece",
      zh: "SentencePiece",
      aka: ["SP 分词器", "Unigram 分词", "Google 子词工具"],
      pinyin: "",
      cat: "nlp",
      level: "core",
      def: "谷歌开源的跨语言子词工具，直接读入原始文本、无需先按语言分词，提供 BPE 与 Unigram 两种词表并可多语言共用。",
      long: "它解决的是「不同语言要先做不同分词」的麻烦：把整段文本当字符或字节序列学习子词，中文、日文、英文可共用一张词表。Unigram 模式先造大候选集再按概率逐步剪枝，与 BPE 自底向上合并的方向相反，剪枝比例可调出更小的词表。它常与 T5、ALBERT 系列一起出现。别与 Sentence-BERT 混淆：后者是句向量嵌入模型，与分词无关。",
      avoid: ["句向量模型", "Sentence-BERT"],
      related: ["bpe", "tokenizer", "vocabulary", "wordpiece", "out-of-vocabulary"],
      tags: ["分词", "多语言"]
    },
    {
      id: "vocabulary",
      en: "Vocabulary",
      zh: "词表",
      aka: ["Vocab", "词表大小", "vocabulary size"],
      pinyin: "cibiao",
      cat: "nlp",
      level: "basic",
      def: "分词器可输出的全部词元及其编号的集合，规模决定输出层矩阵大小，也影响序列长度、稀有词切分与多语言之间的均衡。",
      long: "词表与嵌入矩阵、输出投影一起构成参数量的大头，扩词表往往需要额外的初始化与继续训练。大词表把常见词压成整词元，缩短序列、在同样上下文预算下装下更多信息，代价是低频词元训练样本稀薄、参数更多。跨模型比较词元数或困惑度之前必须先确认词表，否则「同一句话多少词元」没有可比性。",
      avoid: ["词汇知识库", "训练语料"],
      related: ["token", "embedding", "bpe", "out-of-vocabulary", "tokenizer"],
      tags: ["词表", "分词"]
    },
    {
      id: "out-of-vocabulary",
      en: "Out-of-Vocabulary",
      zh: "未登录词",
      aka: ["OOV", "未知词", "词表外词"],
      pinyin: "weidengluci",
      cat: "nlp",
      level: "basic",
      def: "分词器词表覆盖不到、需要退回未知标记或逐字节拆开的输入；在字节级子词方案下严格 OOV 几乎消失，但稀有片段问题仍在。",
      long: "传统按词切分时 OOV 是硬伤，只能归入唯一的 unk 标记并丢失形状信息。字节级 BPE 与 SentencePiece 让任意字符序列都可编码，问题从「能不能表示」变成「表示得好不好」：冷门人名与专业术语被切成一串碎词元，序列变长、嵌入训练不足，效果仍逊于常见词。中文与代码常见的其实是词元爆炸，而不是真正无法输入。",
      avoid: ["幻觉", "无法输入"],
      related: ["token", "vocabulary", "bpe", "hallucination", "tokenizer"],
      tags: ["分词", "边界情况"]
    }
  );

  /* ---------------- 长上下文 ---------------- */
  T.push(
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
      id: "long-context",
      en: "Long Context",
      zh: "长上下文",
      aka: ["长窗口", "长上下文能力", "超长输入"],
      pinyin: "zhangshangxiawen",
      cat: "inference",
      level: "core",
      def: "模型可一次接收并能有效利用的输入长度；窗口标称值变长并不等于远距离信息都能被稳定读取，位置方案与训练数据才是关键。",
      long: "上限由位置方案、注意力平方复杂度与键值缓存的线性增长共同决定，需要结构与系统两层改造来压成本。评测常观察到「中间丢失」：关键信息位于长序列中部时命中率明显下降，说明有效长度通常小于标称长度。长上下文与检索增强既可互相替代也可组合，前者更灵活、成本随长度上升，后者便宜但受检索质量限制。",
      avoid: ["长记忆", "无限上下文"],
      related: ["context-window", "kv-cache", "needle-in-haystack", "positional-interpolation", "rope", "rag"],
      tags: ["长上下文", "推理"]
    },
    {
      id: "needle-in-haystack",
      en: "Needle In A Haystack",
      zh: "大海捞针测试",
      aka: ["NIAH", "捞针评测", "单针检索测试"],
      pinyin: "dahailaozhenceshi",
      cat: "inference",
      level: "advanced",
      def: "在很长的无关文本中插入一处细节再要求模型复述的评测法，用于检查长上下文的定位能力，但它只测检索、不测推理。",
      long: "通常把「针」插入不同深度并扫描总长度，观察命中率变化，从而暴露中间丢失这类位置相关的失效。多针版本要求跨段汇总，难度陡增。它衡量的是能否找到并原样复述，无法说明模型能否在长文本上做比较、规划或全局归纳；因此通过捞针测试就宣称长上下文能力强属于过度推断，也常与基准饱和一并讨论。",
      avoid: ["长文本推理测试", "记忆容量指标"],
      related: ["benchmark", "long-context", "context-window", "rag", "saturation"],
      tags: ["评测", "长上下文"]
    }
  );

  /* ---------------- 提示与上下文学习 ---------------- */
  T.push(
    
    {
      id: "few-shot",
      en: "Few-Shot",
      zh: "少样本提示",
      aka: ["few-shot prompting", "小样本示例", "K 示例"],
      pinyin: "shaoyangbentishi",
      cat: "nlp",
      level: "basic",
      def: "在提示里给出若干输入输出示例、不做任何参数更新就要求模型照此完成的设定，示例质量往往比数量更关键。",
      long: "它是上下文内学习的典型用法，与机器学习里「用极少样本训练模型」的少样本学习不是一回事：这里参数不动，示例只作为条件。示例的标签分布、顺序、格式甚至标点都会影响结果，当示例标签与常识冲突时模型常跟随示例。规模足够大时才明显有效，小模型上示例近似噪声，这一差距也常被当作涌现能力的证据。",
      avoid: ["少样本微调", "元学习"],
      related: ["zero-shot-prompting", "in-context-learning", "prompt-template", "emergent-ability", "fine-tuning"],
      tags: ["提示", "评测设定"]
    },
    {
      id: "zero-shot-prompting",
      en: "Zero-Shot Prompting",
      zh: "零样本提示",
      aka: ["zero-shot 提示", "无示例提问", "直接提问"],
      pinyin: "lingyangbentishi",
      cat: "nlp",
      level: "basic",
      def: "不提供任何任务示例、只用自然语言描述任务就要求模型作答；能力来自预训练见过的表述方式与后续的指令跟随训练。",
      long: "可行是因为自然语言本身就描述了任务，模型把指令当作条件分布的一部分。与少样本的差别是没有输入输出对，与微调的差别是不改参数。零样本表现对措辞极为敏感，同一意图换个说法差距明显，这正是提示工程存在的理由。也别把它理解成「没有训练代价」：指令跟随能力通常已靠大量标注指令数据付出过成本。",
      avoid: ["零成本推理", "无监督预训练"],
      related: ["zero-shot", "few-shot", "instruction-tuning", "pretraining", "in-context-learning"],
      tags: ["提示", "评测设定"]
    },
    
    {
      id: "prompt-template",
      en: "Prompt Template",
      zh: "提示模板",
      aka: ["对话模板", "chat template", "序列化模板"],
      pinyin: "tishimoban",
      cat: "nlp",
      level: "basic",
      def: "把系统说明、多轮历史与用户输入组装成固定词元序列的拼接规则；模板与训练时不一致会让行为退化甚至无法终止。",
      long: "指令微调后的模型学到的是特定角色标记与分隔词元的分布，例如每轮包成「角色加内容」再追加助手起始标记。用错模板等于把输入移出训练分布，典型症状是拒绝停止、复述角色标记、格式混乱。模板属于模型而不属于框架，跨模型迁移必须替换。提示注入类攻击能否生效，也与模板如何划分可信文本与不可信文本直接相关。",
      avoid: ["系统提示词", "安全护栏"],
      related: ["system-prompt", "stop-token", "eos-token", "token", "prompt-injection"],
      tags: ["提示", "工程实现"]
    },
    {
      id: "system-prompt",
      en: "System Prompt",
      zh: "系统提示词",
      aka: ["系统指令", "System Prompt", "角色设定"],
      pinyin: "xitongtishici",
      cat: "nlp",
      level: "basic",
      def: "在对话模板中标为系统角色、最先呈现的一段指令，用来设定身份、风格与边界；它影响输出但并不构成硬性约束。",
      long: "训练时系统角色位于序列最前，它与后续所有内容的条件关系被反复强化，因此零样本下也有较强的引导力。但它本质仍是文本，不是权限机制：足够长的对话、编码变形或精心构造的指令都可能削弱它，把敏感规则只写在这里通常不安全。真正的边界要靠输出过滤、工具权限与检索来源限制共同保证。",
      avoid: ["安全护栏", "不可见指令"],
      related: ["prompt-template", "prompt-injection", "jailbreak", "alignment", "instruction-tuning"],
      tags: ["提示", "安全"]
    }
  );

  /* ---------------- 指令训练 ---------------- */
  

  /* ---------------- 解码策略 ---------------- */
  T.push(
    {
      id: "greedy-decoding",
      en: "Greedy Decoding",
      zh: "贪心解码",
      aka: ["Greedy Search", "逐步取最大值", "argmax 解码"],
      pinyin: "tanxinjiema",
      cat: "inference",
      level: "basic",
      def: "每一步都取当前条件分布里概率最高的词元，确定且可复现，但不保证整句联合概率最优，长文本容易陷入重复循环。",
      long: "它是束宽为一的束搜索特例，也等价于温度趋近零的采样，因此常被当作默认与基线。贪心只做局部最优，可能在整体概率上输给某条次优前缀，尤其当后文强烈依赖早期选择时。重复循环并非贪心独有，但确定性输出没有随机性帮助跳出吸引子，于是长回答要么截断、要么靠重复惩罚压制——「温度设为零就更准」的说法并不成立。",
      avoid: ["全局最优解码", "零风险输出"],
      related: ["beam-search", "sampling", "temperature", "logit", "repetition-penalty"],
      tags: ["解码", "推理"]
    },
    {
      id: "beam-search",
      en: "Beam Search",
      zh: "束搜索",
      aka: ["Beam Search", "集束搜索", "束宽解码"],
      pinyin: "shusousuo",
      cat: "inference",
      level: "core",
      def: "解码时保留得分最高的若干条前缀并行扩展的近似搜索，束宽为一即退化为贪心；在翻译任务有效，开放式对话常弃用。",
      long: "它优化的是整句联合概率，而采样给出的是按分布抽出的句子，两者的典型输出并不相同。束宽越大越接近全局最优但仍是启发式，并且偏好短而保守的句子，通常需要配合长度惩罚。对话与创作场景里束搜索容易产出重复、平淡的回答，所以现代大模型更多用温度与核采样；把「束搜索等于更聪明」当默认直觉已经过时。",
      avoid: ["最优解码保证", "宽度优先遍历"],
      related: ["greedy-decoding", "sampling", "logit", "language-model", "top-p"],
      tags: ["解码", "搜索"]
    },
    {
      id: "repetition-penalty",
      en: "Repetition Penalty",
      zh: "重复惩罚",
      aka: ["重复惩罚系数", "presence penalty", "frequency penalty"],
      pinyin: "zhongfuchengfa",
      cat: "inference",
      level: "core",
      def: "对已经出现过的词元下调其分数后再归一化生成，用以抑制复读；系数过大会连正常复现一起惩罚，伤害术语与结构一致性。",
      long: "常见实现是把已出现词元的分数除以或减去一个系数，其中正分数除以惩罚、负分数乘以惩罚，效果并非线性；存在惩罚只看是否出现过，频率惩罚与出现次数成正比，二者语义不同。它掩盖而不是解决成因：贪心解码、多样性不足或模型本身陷入循环时，强行惩罚会扭曲分布并诱发无关注水。它与温度、核采样调节的东西也不是一回事。",
      avoid: ["温度调节", "上下文裁剪"],
      related: ["greedy-decoding", "sampling", "temperature", "top-p", "logit", "token"],
      tags: ["解码", "采样技巧"]
    },
    {
      id: "stop-token",
      en: "Stop Token",
      zh: "停止词元",
      aka: ["stop token", "终止词元", "序列终止符"],
      pinyin: "tingzhiciyuan",
      cat: "inference",
      level: "basic",
      def: "推理时约定一旦生成就立刻截断输出的词元，由采样循环逐个检查；它与结束词元相关，但服务层常配置成不止一个编号。",
      long: "服务端一般维护一组停止词元：既有模型学到的 EOS，也有对话分隔符，以防模型越界续写对方的台词。词元编号与具体词表绑定，同一个字符串在不同模型下编号不同，把编号硬编码进配置会造成错误截断或根本不截断。模板写错时的典型症状是停止词元概率始终极低、输出一直顶到上下文上限，问题出在格式而非采样温度。",
      avoid: ["EOS 与它必然同一", "标点即终止"],
      related: ["eos-token", "token", "sampling", "prompt-template", "inference"],
      tags: ["解码", "工程实现"]
    },
    {
      id: "eos-token",
      en: "EOS Token",
      zh: "结束词元",
      aka: ["EOS", "end-of-sequence", "序列结束符"],
      pinyin: "jieshuciyuan",
      cat: "nlp",
      level: "basic",
      def: "表示一条序列结束的特殊词元，训练时作为目标参与监督，推理时可用作停止信号；数据拼装漏标会让模型不懂何时该停。",
      long: "词表里 EOS 通常只有一个编号，但多轮对话中每轮结束是否都要补上、拼接文档时边界如何标注，都是直接影响行为细节的选择。刻意压低 EOS 的概率会让输出冗长不停，这类操作常见于偏好训练与截断处理。它也常被借用作分隔符或填充符，此时与补齐符号混用容易引出掩码错误；分清它与停止词元配置的差别，才便于排查生成异常。",
      avoid: ["填充词元", "换行符"],
      related: ["stop-token", "token", "attention-mask", "sampling", "inference"],
      tags: ["词元", "特殊标记"]
    }
  );

  /* ---------------- 经典对照 ---------------- */
  T.push(
    {
      id: "ngram",
      en: "N-gram",
      zh: "N 元语法",
      aka: ["n-gram", "N-gram 语言模型", "字组模型"],
      pinyin: "yuanyufa",
      cat: "nlp",
      level: "basic",
      def: "用前若干个词元的联合统计频率估计下一词元概率的经典语言模型，靠马尔可夫假设换取可估性，是神经网络方案的前身。",
      long: "阶数越高可用上下文越长，但参数随词表呈指数增长，长尾组合几乎没有样本，于是需要 Good-Turing、Kneser-Ney 这类平滑。它是现代方案的对照物：神经语言模型在连续空间里泛化，N-gram 只记录字面共现。今天它仍活跃在拼写纠正、检索重排、文本指纹与查重里，也被用来快速估计文本的可压缩性与语料质量。",
      avoid: ["神经网络语言模型", "分词模型"],
      related: ["language-model", "perplexity", "vocabulary", "token", "cross-entropy"],
      tags: ["统计语言模型", "历史方法"]
    }
  );
})();
