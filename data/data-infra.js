/*
 * AI 术语词典 · 分类数据：cat = "infra"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
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
      id: "gpu",
      en: "Graphics Processing Unit",
      zh: "GPU",
      aka: ["显卡", "图形处理器"],
      pinyin: "",
      cat: "infra",
      level: "basic",
      def: "由大量简单计算单元组成的并行处理器，擅长把同一操作同时施加到海量元素上，因而成为深度学习训练与推理的主力硬件。",
      long: "深度学习需要的正是矩阵乘法这类高度规则的数据并行，与 GPU 的设计取向吻合，所以不是偶然而是结构匹配。真正制约训练的往往不是算力而是显存容量与内存带宽：批大小、序列长度和是否开启梯度检查点都由它决定。它与通用处理器不是替代关系，数据预处理与调度仍在通用处理器上跑。",
      avoid: ["用「核心数多」直接推断深度学习一定更快"],
      related: ["cuda", "mixed-precision", "batch-size", "distributed-training", "inference-serving"],
      tags: ["硬件", "算力"]
    },
    {
      id: "cuda",
      en: "Compute Unified Device Architecture",
      zh: "CUDA",
      aka: ["CUDA 生态", "GPU 计算平台"],
      pinyin: "",
      cat: "infra",
      level: "basic",
      def: "NVIDIA 显卡的编程平台与软件生态，提供内核启动、显存管理与算子库，深度学习框架的加速大多直接建立在其算子库之上。",
      long: "它之所以是护城河，关键不在并行编程接口，而在围绕它的编译器、矩阵运算库、通信库与调优工具链条完整。版本要区分驱动接口版本与工具链版本，二者不一致时报错信息常常误导人排查方向。其他厂商的兼容层能跑通多数代码，但算子覆盖度和性能仍与原生平台存在差距，选型时该以实测为准。",
      avoid: ["把 CUDA 说成「一种 GPU 硬件」"],
      related: ["gpu", "mixed-precision", "distributed-training", "flash-attention"],
      tags: ["软件栈", "硬件"]
    },
    {
      id: "distributed-training",
      en: "Distributed Training",
      zh: "分布式训练",
      aka: ["多卡训练", "大规模并行训练"],
      pinyin: "fenbushixunlian",
      cat: "infra",
      level: "advanced",
      def: "把训练任务拆到多张卡与多台机器上并行推进，通过集合通信同步梯度，目标是扩展总吞吐而不是提升单卡速度。",
      long: "扩展效率几乎总被通信和负载不均吃掉，所以衡量的是有效吞吐而不是卡数。常见组合是机器内做张量并行、机器间做数据并行，让最频繁的通信留在带宽最高的互联上。要警惕等效批大小随卡数放大，不调整学习率与预热就会看到收敛明显变差，这类现象常被误报成通信有 bug。",
      avoid: ["认为卡数翻倍训练时间就一定减半"],
      related: ["data-parallelism", "tensor-parallelism", "model-parallelism", "gradient-accumulation", "mixed-precision", "gpu"],
      tags: ["并行", "基础设施"]
    },
    {
      id: "data-parallelism",
      en: "Data Parallelism",
      zh: "数据并行",
      aka: ["DP", "DDP", "梯度同步"],
      pinyin: "shujubingxing",
      cat: "infra",
      level: "advanced",
      def: "每张卡持有完整模型副本、拿不同的数据算梯度，再把梯度求和平均后同步，扩展简单，但通信量随参数量与卡数增长。",
      long: "它能扩展的前提是单卡装得下模型、优化器状态与激活值，否则只能靠并行化切分来救。梯度分桶与通信计算重叠是效率关键，反向还没跑完就可以开始传已完成的部分。参数服务器与全归约两种同步拓扑在规模上去后表现差别明显，前者容易被服务器带宽卡住，后者需要高速互联支撑。",
      avoid: ["把数据并行说成「把模型切到多卡」"],
      related: ["distributed-training", "tensor-parallelism", "batch-size", "gradient-accumulation", "mixed-precision"],
      tags: ["并行", "通信"]
    },
    {
      id: "tensor-parallelism",
      en: "Tensor Parallelism",
      zh: "张量并行",
      aka: ["TP", "算子内并行"],
      pinyin: "zhangliangbingxing",
      cat: "infra",
      level: "advanced",
      def: "把单个矩阵运算按行或按列切到多张卡上并行计算，通信发生在层内每一次前向，用于单卡装不下权重或激活的场景。",
      long: "按列切分让后续层可以本地计算，按行切分则需要一次归约求和，两者成对使用才能把通信次数压到最低。因为每层都要同步，它对卡间带宽极其敏感，跨机器扩展通常不划算，所以一般限制在单机内部。它与流水并行组合成张量加流水的混合切分，是大参数模型训练的标准做法。",
      avoid: ["与流水并行、数据并行混称为同一种切分"],
      related: ["model-parallelism", "distributed-training", "data-parallelism", "gpu", "mixed-precision"],
      tags: ["并行", "通信"]
    },
    {
      id: "checkpointing",
      en: "Checkpointing",
      zh: "检查点",
      aka: ["断点保存", "Checkpoint", "梯度检查点"],
      pinyin: "jianchadian",
      cat: "infra",
      level: "basic",
      def: "周期性把参数、优化器状态与数据读取位置落盘，以便中断后恢复与回滚版本，规模变大后还要权衡保存耗时与存储量。",
      long: "真正可复现的恢复必须包含优化器动量、随机种子、学习率调度的步数和采样进度，只存权重会让续训表现明显异常。中文里「激活重计算」也常被称为检查点技术，它指反向时重新算前向中间值以省显存，与保存模型是两件事，混用最容易造成沟通事故。异步与分片写可以把保存开销从关键路径上挪走。",
      avoid: ["把「检查点」与「激活重计算省显存」当作同一件事而不加限定"],
      related: ["distributed-training", "mixed-precision", "peft", "inference-serving", "epoch"],
      tags: ["训练流程", "容错"]
    },
    {
      id: "flash-attention",
      en: "FlashAttention",
      zh: "FlashAttention",
      aka: ["Flash Attention", "分块注意力", "FA"],
      pinyin: "",
      cat: "infra",
      level: "advanced",
      def: "把注意力按分块在片上高速缓存里流水式算完，不写出庞大的完整注意力矩阵，因此省显存并加速长序列训练与推理。",
      long: "它优化的不是算的乘法次数，而是显存访问次数，把瓶颈从带宽一侧挪开，这正是注意力落地时真正的痛点。由于不存中间矩阵，反向传播时靠重算还原，用少量计算换大量显存。它是数学等价的精确注意力而非近似，常被误解为「牺牲精度换速度」；后续变体进一步放宽序列长度与并行切分的限制。",
      avoid: ["认为 FlashAttention 是一种近似注意力或注意力剪枝"],
      related: ["mixed-precision", "gpu", "cuda", "inference-serving", "distributed-training"],
      tags: ["算子优化", "显存"]
    },
    {
      id: "model-parallelism",
      en: "Model Parallelism",
      zh: "模型并行",
      aka: ["流水并行", "层间切分"],
      pinyin: "moxingbingxing",
      cat: "infra",
      level: "advanced",
      def: "当单卡容量不够时把模型本身切开跨设备摆放，可以是层间流水分段或层内算子切分，需要与数据并行组合使用。",
      long: "它是容量问题而非速度问题的解法：单卡装不下时，并行化切分是显存分摊的唯一手段，本身不会让单步更快。层间流水容易实现但会有设备空转，靠把微批切成多段来填满气泡；层内切分通信更频繁但负载均衡更好。选哪种取决于卡间互联带宽与模型结构，不是按「先进程度」排序。",
      avoid: ["把模型并行当作提升吞吐的首要手段"],
      related: ["tensor-parallelism", "distributed-training", "data-parallelism", "peft", "mixed-precision"],
      tags: ["并行", "显存"]
    }
  );
})(window);
