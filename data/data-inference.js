/*
 * AI 术语词典 · 分类数据：cat = "inference"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
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
    },
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
      id: "quantization",
      en: "Quantization",
      zh: "量化",
      aka: ["低比特量化", "INT8", "权重量化"],
      pinyin: "lianghua",
      cat: "inference",
      level: "core",
      def: "把权重或激活从高精度压成低位宽整数来存储与计算，显著节省显存和带宽，代价是精度损失以及标定流程的复杂度。",
      long: "推理阶段受益最大，因为生成过程受内存带宽限制，字节数减少几乎线性换来吞吐提升。训练后量化只需少量校准数据统计激活范围，量化感知训练则在训练中就模拟舍入噪声，低比特下更稳。要区分模型压缩意义上的量化与把连续向量映射到码本的向量量化，两者目标与做法都不同，中文里却共用同一个词。",
      avoid: ["与「向量量化」混为同一个概念", "认为量化必然导致无法接受的精度下降"],
      related: ["mixed-precision", "model-pruning", "inference-serving", "knowledge-distillation", "gpu"],
      tags: ["模型压缩", "推理效率"]
    },
    {
      id: "model-pruning",
      en: "Model Pruning",
      zh: "模型剪枝",
      aka: ["权重剪枝", "稀疏化"],
      pinyin: "moxingjianzhi",
      cat: "inference",
      level: "core",
      def: "删掉贡献小的权重或结构单元再微调，让网络变稀疏以减少参数与计算量，实际收益依赖硬件是否支持稀疏计算。",
      long: "非结构化剪枝压掉的是参数量，若稠密矩阵乘仍在跑，速度提升有限；结构化剪枝去掉整个通道或注意力头，能被通用算子直接加速但精度损失更大。「 Lottery 门票」式做法先找出稀疏子网再单独训练，说明剪枝更多是在做选择而非创造。它与量化叠加使用时要注意先后顺序，两者误差会互相放大。",
      avoid: ["认为剪枝比例高就一定能等比例加速"],
      related: ["quantization", "knowledge-distillation", "l1-l2-regularization", "inference-serving"],
      tags: ["模型压缩", "稀疏性"]
    },
    {
      id: "inference-serving",
      en: "Inference Serving",
      zh: "推理服务",
      aka: ["模型服务化", "在线推理", "Serving"],
      pinyin: "tuilifuwu",
      cat: "inference",
      level: "core",
      def: "把训好的模型包装成长期在线可用的接口，关注吞吐、首字延迟与显存复用，批处理与调度策略决定单位成本而非单纯看延迟。",
      long: "训练与推理的瓶颈完全不同：自回归生成逐词进行，受内存带宽限制，算力常常闲置，所以提升吞吐靠的是把多个请求的解码步骤拼起来。连续批处理让先结束的请求立刻让位，比静态批处理显著降低排队等待。缓存复用、量化与投机式解码都是这条链路上的手段，评估时必须同时报吞吐和延迟分位数，只报平均值会掩盖尾延迟。",
      avoid: ["用训练吞吐指标评估线上服务性能"],
      related: ["quantization", "knowledge-distillation", "model-pruning", "gpu", "mixed-precision", "batch-size"],
      tags: ["部署", "吞吐"]
    }
  );
})(window);
