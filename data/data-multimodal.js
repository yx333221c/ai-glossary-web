/*
 * AI 术语词典 · 分类数据：cat = "multimodal"
 * 由 tools/split-by-category.js 从原分片重切而来；条目正文保持原样。
 * 字段与写法约定见 README「数据格式」。
 */
(function (global) {
  var T = (global.AI_TERMS = global.AI_TERMS || []);

  T.push(
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
    {
      id: "vision-transformer", en: "Vision Transformer", zh: "视觉 Transformer", aka: ["ViT", "图像 Transformer"], pinyin: "shi jue transformer",
      cat: "multimodal", level: "core",
      def: "把图像切成若干固定大小的图像块，当作序列喂给标准 Transformer。",
      long: "它去掉了卷积的局部先验，换来全局注意力：每个块一开始就能看全图。代价是需要更大数据才有归纳偏置不足的补偿，小数据集上往往输给 CNN。这一视角也把图像变成了「一串词元」，是图文统一建模的关键一步。",
      avoid: ["把 ViT 当成「专为图像设计的网络」"],
      related: ["patch", "attention", "convolutional-network"], tags: ["视觉", "架构"]
    },
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
    }
  );
})(window);
