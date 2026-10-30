// Comprehensive AI Terminology Database
const aiTerms = [
    // ===== Basic Concepts (基础概念) =====
    {
        en: "Artificial Intelligence",
        zh: "人工智能",
        category: "model",
        definition: "使计算机系统能够执行需要人类智能的任务的技术，包括学习、推理、问题解决、感知和语言理解。"
    },
    {
        en: "Machine Learning",
        zh: "机器学习",
        category: "ml",
        definition: "通过数据训练算法，使计算机能够从经验中学习并改进性能，而无需显式编程的核心 AI 分支。"
    },
    {
        en: "Deep Learning",
        zh: "深度学习",
        category: "dl",
        definition: "机器学习的一个子领域，使用多层神经网络来学习数据的层次化表示，特别擅长处理图像、语音和文本。"
    },
    {
        en: "Neural Network",
        zh: "神经网络",
        category: "model",
        definition: "受生物神经系统启发的计算模型，由相互连接的节点（神经元）组成，能够学习复杂的模式和关系。"
    },

    // ===== Mathematical Foundations (数学基础) =====
    {
        en: "Token",
        zh: "词元",
        category: "math",
        definition: "模型处理文本的最小单位，既不是「词」也不是「字」，可以是单词的一部分或整个单词。",
        related: ["Embedding", "Vocabulary"]
    },
    {
        en: "Embedding",
        zh: "嵌入",
        category: "math",
        definition: "把离散对象映射成连续向量，使「相似」变成可计算的远近（夹角余弦或欧氏距离）。",
        related: ["Vector", "Similarity"]
    },
    {
        en: "Surprise / Self-information",
        zh: "惊讶度",
        category: "math",
        definition: "单个结果的意外程度，计算公式为 −log p；越不可能发生的事件，其惊讶度越高。",
        related: ["Entropy", "Probability"]
    },
    {
        en: "KL Divergence",
        zh: "KL 散度",
        category: "math",
        definition: "用 q 代替 p 编码时多付的那部分码长；交叉熵减去熵。也称为相对熵，衡量两个概率分布的差异。",
        related: ["Cross-Entropy", "Entropy"]
    },
    {
        en: "Parameter",
        zh: "参数",
        category: "math",
        definition: "模型内部可训练的数值，通过训练过程从数据中学习得到。",
        related: ["Weight", "Model"]
    },
    {
        en: "Weight",
        zh: "权重",
        category: "math",
        definition: "网络里乘在输入上的系数，决定每个输入对输出的贡献程度。",
        related: ["Parameter", "Bias"]
    },
    {
        en: "Loss / Cost Function",
        zh: "损失",
        category: "math",
        definition: "衡量预测与真实差多少的单一数值，用于指导模型优化的目标函数。",
        related: ["Gradient Descent", "Optimization"]
    },
    {
        en: "Cross-Entropy",
        zh: "交叉熵",
        category: "math",
        definition: "按真实分布 p 评分、却用另一套分布 q 编码时的总平均码长；分类任务中常用的损失函数。",
        related: ["KL Divergence", "Softmax"]
    },
    {
        en: "Perplexity",
        zh: "困惑度",
        category: "math",
        definition: "模型对文本的平均意外程度（交叉熵的指数），越低表示模型越好。",
        related: ["Language Model", "Cross-Entropy"]
    },
    {
        en: "Gradient",
        zh: "梯度",
        category: "math",
        definition: "损失上升最快的方向；负梯度才是每根轴的最速下降方向，用于优化算法。",
        related: ["Backpropagation", "Learning Rate"]
    },
    {
        en: "Learning Rate",
        zh: "学习率",
        category: "math",
        definition: "每次沿负梯度方向挪多远的重要超参数，太大导致不收敛，太小导致训练慢。",
        related: ["Gradient Descent", "Optimizer"]
    },
    {
        en: "Activation Function",
        zh: "激活函数",
        category: "math",
        definition: "给网络加入非线性的逐元素开关，如 ReLU、Sigmoid、Tanh，使神经网络能拟合复杂函数。",
        related: ["Neural Network", "Non-linearity"]
    },

    // ===== Neural Network Architecture (神经网络架构) =====
    {
        en: "Backpropagation",
        zh: "反向传播",
        category: "dl",
        definition: "按计算图从输出回推每个参数该负多少责任，高效计算梯度的核心算法。",
        related: ["Gradient", "Training"]
    },
    {
        en: "Convolutional Neural Network",
        zh: "卷积神经网络",
        category: "dl",
        definition: "专门处理网格结构数据（如图像）的神经网络，通过卷积层自动学习空间特征。",
        related: ["CNN", "Computer Vision"]
    },
    {
        en: "CNN",
        zh: "卷积网络",
        category: "dl",
        definition: "卷积神经网络的简称，在图像识别、目标检测等计算机视觉任务中表现卓越。",
        related: ["Convolutional Neural Network", "Pooling"]
    },
    {
        en: "Receptive Field",
        zh: "感受野",
        category: "dl",
        definition: "输出位置能看到多少输入范围，决定了网络能捕获多大区域的上下文信息。",
        related: ["Convolution", "Field of View"]
    },
    {
        en: "Residual Connection",
        zh: "残差连接",
        category: "dl",
        definition: "把输入直接加到输出上，保住梯度通路，使深层网络更容易训练的关键创新。",
        related: ["Skip Connection", "ResNet"]
    },
    {
        en: "BatchNorm",
        zh: "批归一化",
        category: "dl",
        definition: "沿 batch 维对每个特征做标准化，加速训练并提高模型稳定性的重要技术。",
        related: ["LayerNorm", "Normalization"]
    },
    {
        en: "LayerNorm",
        zh: "层归一化",
        category: "dl",
        definition: "对每个样本的特征维度做标准化，在Transformer等模型中广泛应用。",
        related: ["BatchNorm", "Normalization"]
    },

    // ===== Attention and Transformer (注意力与 Transformer) =====
    {
        en: "Attention",
        zh: "注意力机制",
        category: "model",
        definition: "按相关性为上下文各部分动态分配加权，让模型聚焦于最重要的信息。",
        related: ["Query", "Key", "Value", "Transformer"]
    },
    {
        en: "Query / Key / Value",
        zh: "查询 / 键 / 值",
        category: "model",
        definition: "想找什么 (Query) / 用来被比对的名片 (Key) / 比对后取走的内容 (Value)，是注意力机制的三个核心组件。",
        related: ["Attention", "Self-Attention"]
    },
    {
        en: "Self-Attention",
       zh: "自注意力",
        category: "model",
        definition: "序列中每个位置都与所有其他位置进行注意力计算，捕获长程依赖关系。",
        related: ["Attention", "Sequence Modeling"]
    },
    {
        en: "Multi-Head Attention",
        zh: "多头注意力",
        category: "model",
        definition: "并行运行多个注意力头，让模型在不同表示子空间中学习不同的关注模式。",
        related: ["Attention", "Transformer"]
    },
    {
        en: "Transformer",
        zh: "Transformer",
        category: "model",
        definition: "完全基于注意力机制的架构，摒弃循环和卷积，成为现代 NLP 和多项任务的基石。",
        related: ["Attention", "Encoder", "Decoder"]
    },
    {
        en: "Positional Encoding",
        zh: "位置编码",
        category: "model",
        definition: "把「第几个」信息注入词元表示，因为注意力机制本身对顺序不敏感。",
        related: ["Positional Embedding", "Sequence"]
    },
    {
        en: "RoPE",
        zh: "旋转位置编码",
        category: "model",
        definition: "用旋转角度表示相对位置的编码方案，在 LLaMA 等模型中得到广泛应用。",
        related: ["Positional Encoding", "Relative Position"]
    },
    {
        en: "Feed-Forward Network",
        zh: "前馈网络",
        category: "model",
        definition: "逐位置两层全连接，在注意力之后做非线性加工，通常包含上下文的压缩与展开。",
        related: ["FFN", "Dense Layer"]
    },

    // ===== Training Methods (训练方法) =====
    {
        en: "Pretraining",
        zh: "预训练",
        category: "process",
        definition: "在海量无标注数据上做下一词预测，学习通用的语言表示，是大模型训练的第一步。",
        related: ["Self-Supervised", "Foundation Model"]
    },
    {
        en: "Fine-Tuning",
        zh: "微调",
        category: "process",
        definition: "在特定数据上继续训练已训好的模型，使其适应下游具体任务。",
        related: ["Transfer Learning", "Adapter"]
    },
    {
        en: "Scaling Law",
        zh: "规模定律",
        category: "process",
        definition: "损失随参数/数据/算力呈幂律下降的经验规律，指导模型规模的决策依据。",
        related: ["Compute", "Data Scaling"]
    },
    {
        en: "Emergent Ability",
        zh: "涌现能力",
        category: "process",
        definition: "规模跨过某阈值后才出现的能力，如推理、指令跟随等，小模型不具备。",
        related: ["Scale", "Capability"]
    },
    {
        en: "Alignment",
        zh: "对齐",
        category: "process",
        definition: "使模型行为符合人类意图与价值，通过 RLHF 等技术实现安全有用的 AI。",
        related: ["RLHF", "Human Preference"]
    },
    {
        en: "Calibration",
        zh: "校准",
        category: "process",
        definition: "模型报出的置信度与实际正确率是否一致；与 alignment 是不同的概念。",
        related: ["Confidence", "Accuracy"]
    },
    {
        en: "RLHF",
        zh: "基于人类反馈的强化学习",
        category: "process",
        definition: "SFT→奖励模型→策略优化的三段后训练流程，实现人类价值观对齐的主流方法。",
        related: ["Alignment", "Reward Model", "PPO"]
    },
    {
        en: "Reward Model",
        zh: "奖励模型",
        category: "process",
        definition: "学习人类偏好、给回答打分的模型，在 RLHF 中指导策略优化。",
        related: ["RLHF", "Preference Learning"]
    },

    // ===== Inference and Generation (推理与生成) =====
    {
        en: "Inference",
        zh: "推理",
        category: "process",
        definition: "用训好的模型生成输出，区别于训练阶段的前向传播，强调实际应用时的预测。",
        related: ["Generation", "Prediction"]
    },
    {
        en: "Hallucination",
        zh: "幻觉",
        category: "process",
        definition: "生成流畅但与事实/上下文不符的内容，是大模型的常见缺陷之一。",
        related: ["Factuality", "Consistency"]
    },
    {
        en: "Temperature",
        zh: "温度",
        category: "process",
        definition: "采样前对 logits 的缩放系数，控制分布平坦度；高温更随机，低温更确定。",
        related: ["Sampling", "Logits"]
    },
    {
        en: "Logit",
        zh: "未归一化得分",
        category: "math",
        definition: "softmax 之前的实数分数，表示每个可能词元的相对优先级。",
        related: ["Softmax", "Probability"]
    },
    {
        en: "Sampling",
        zh: "采样",
        category: "process",
        definition: "按概率分布挑下一个词元的过程，决定了生成文本的多样性和质量。",
        related: ["Top-K", "Top-P", "Beam Search"]
    },
    {
        en: "Top-p / Nucleus",
        zh: "核采样",
        category: "process",
        definition: "只保留累计概率达 p 的最小词元集合，动态调整候选范围。",
        related: ["Sampling", "Top-K"]
    },
    {
        en: "Context Window",
        zh: "上下文窗口",
        category: "process",
        definition: "一次推理能「看到」的词元上限，决定模型能处理多长的文档或对话。",
        related: ["Token Limit", "Memory"]
    },
    {
        en: "KV Cache",
        zh: "键值缓存",
        category: "process",
        definition: "复用历史词元的 K/V 以避免重复计算，显著提升自回归生成的速度。",
        related: ["Attention", "Efficiency"]
    },
    {
        en: "Prompt Engineering",
        zh: "提示工程",
        category: "process",
        definition: "设计和优化输入提示以获得更好输出的技术和实践，包括 Few-shot、CoT 等方法。",
        related: ["Instruction Tuning", "Zero-shot"]
    },
    {
        en: "Chain-of-Thought",
        zh: "思维链",
        category: "process",
        definition: "引导模型生成中间推理步骤，提升复杂问题的解决能力。",
        related: ["Prompt Engineering", "Reasoning"]
    },

    // ===== Evaluation and Benchmark (评估与基准) =====
    {
        en: "Benchmark",
        zh: "基准测试",
        category: "ml",
        definition: "标准化任务集，用于横向比较不同模型的性能，如 GLUE、SuperGLUE。",
        related: ["Evaluation", "Performance"]
    },
    {
        en: "Saturation",
        zh: "（基准）饱和",
        category: "ml",
        definition: "模型分数逼近上限导致区分度消失，基准失去进化意义。",
        related: ["Benchmark", "Performance Ceiling"]
    },
    {
        en: "Zero-shot Classification",
        zh: "零样本分类",
        category: "ml",
        definition: "该任务一个标注都不给、不加分类头，只靠候选文本描述来分类的能力。",
        related: ["Few-shot", "Transfer Learning"]
    },

    // ===== Multimodal (多模态) =====
    {
        en: "Multimodal",
        zh: "多模态",
        category: "ml",
        definition: "同一模型处理文本 + 图像等多种输入形态，实现跨模态理解和生成。",
        related: ["Vision-Language", "CLIP"]
    },
    {
        en: "CLIP",
        zh: "图文对比模型",
        category: "ml",
        definition: "图像、文本各一个编码器，训练时把配对的拉近、不配对的推开，使两者落入同一空间比方向。",
        related: ["Contrastive Learning", "Image Recognition"]
    },
    {
        en: "Patch",
        zh: "图像块",
        category: "ml",
        definition: "ViT 把图像切成的固定小块，作为视觉 token 输入网络。",
        related: ["Vision Transformer", "Image"]
    },
    {
        en: "InfoNCE",
        zh: "InfoNCE",
        category: "math",
        definition: "对比学习的损失：把配对样本的相似度，从一批负样本里「考」出来。",
        related: ["Contrastive Learning", "CLIP"]
    },
    {
        en: "Vector Quantization",
        zh: "向量量化",
        category: "math",
        definition: "把连续向量硬映射到一本有限码本上，从而让图像也能被表示成离散 token。",
        related: ["VQ-VAE", "Codebook"]
    },

    // ===== Advanced Topics (进阶主题) =====
    {
        en: "Agent",
        zh: "智能体",
        category: "model",
        definition: "能规划、调工具、观察结果的模型系统，具备自主完成复杂任务的能力。",
        related: ["Tool Use", "Planning"]
    },
    {
        en: "Tool Use / Function Calling",
        zh: "工具调用",
        category: "model",
        definition: "模型输出结构化请求让外部执行，扩展模型能力的有效方式。",
        related: ["Agent", "API"]
    },
    {
        en: "RAG",
        zh: "检索增强生成",
        category: "model",
        definition: "先检索资料再让模型基于资料作答，解决幻觉和知识时效性问题的方案。",
        related: ["Retrieval", "Knowledge Base"]
    },
    {
        en: "Jailbreak",
        zh: "越狱",
        category: "ml",
        definition: "用特殊输入绕过安全限制，测试和挑战模型的安全边界。",
        related: ["Prompt Injection", "Safety"]
    },
    {
        en: "Prompt Injection",
        zh: "提示注入",
        category: "ml",
        definition: "把指令藏进被处理的数据里劫持模型，导致意外行为的攻击手段。",
        related: ["Jailbreak", "Security"]
    },
    {
        en: "Red Teaming",
        zh: "红队测试",
        category: "ml",
        definition: "主动攻击式地寻找失效模式，提前发现并修复安全问题。",
        related: ["Security", "Adversarial Testing"]
    },
    {
        en: "Scalable Oversight",
        zh: "可扩展监督",
        category: "ml",
        definition: "如何用较弱的人监督较强的模型，解决超级智能对齐挑战的关键问题。",
        related: ["Alignment", "Governance"]
    },
    
    // ===== Additional Common Terms (其他常用术语) =====
    {
        en: "Supervised Learning",
        zh: "监督学习",
        category: "ml",
        definition: "使用带标签数据进行训练的学习范式，包括分类和回归任务。",
        related: ["Unsupervised Learning", "Semi-supervised"]
    },
    {
        en: "Unsupervised Learning",
        zh: "无监督学习",
        category: "ml",
        definition: "从无标签数据中学习模式，如聚类、降维、生成模型。",
        related: ["Clustering", "Dimensionality Reduction"]
    },
    {
        en: "Reinforcement Learning",
        zh: "强化学习",
        category: "ml",
        definition: "通过与环境交互获得奖励信号来学习最优策略的学习方法。",
        related: ["Policy", "Value Function"]
    },
    {
        en: "Overfitting",
        zh: "过拟合",
        category: "ml",
        definition: "模型在训练集上表现过好但在未见数据上表现差，泛化能力低的问题。",
        related: ["Regularization", "Underfitting"]
    },
    {
        en: "Generalization",
        zh: "泛化",
        category: "ml",
        definition: "模型在训练数据之外的新数据上表现良好的能力，是机器学习的核心目标。",
        related: ["Overfitting", "Validation"]
    },
    {
        en: "Feature Extraction",
        zh: "特征提取",
        category: "ml",
        definition: "从原始数据中自动或手工提取有用信息的過程，影响模型性能的关键步骤。",
        related: ["Embedding", "Representation Learning"]
    },
    {
        en: "Classifier",
        zh: "分类器",
        category: "ml",
        definition: "将输入分配到 predefined 类别的模型，如逻辑回归、SVM、神经网络分类头。",
        related: ["Classification", "Predictor"]
    },
    {
        en: "Regression",
        zh: "回归",
        category: "ml",
        definition: "预测连续值的任务类型，与分类任务相对，如房价预测、温度预测。",
        related: ["Classification", "Linear Regression"]
    },
    {
        en: "Epoch",
        zh: "轮次",
        category: "process",
        definition: "训练过程中整个数据集被完整使用一次的计数单位。",
        related: ["Iteration", "Batch"]
    },
    {
        en: "Batch Size",
        zh: "批次大小",
        category: "process",
        definition: "每次梯度更新使用的样本数量，影响训练速度和稳定性的超参数。",
        related: ["Mini-batch", "Gradient"]
    },
    {
        en: "Optimizer",
        zh: "优化器",
        category: "process",
        definition: "实现梯度下降变种的算法，如 SGD、Adam、RMSprop，决定参数更新策略。",
        related: ["Gradient Descent", "Learning Rate"]
    }
];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const glossaryGrid = document.getElementById('glossaryGrid');

// Display all terms on page load
function displayAllTerms() {
    renderTerms(aiTerms);
}

// Render terms to the grid
function renderTerms(terms, isSearchResult = false) {
    glossaryGrid.innerHTML = '';
    
    if (isSearchResult) {
        const resultsTitle = document.createElement('h3');
        resultsTitle.style.cssText = 'color: white; margin-bottom: 1rem;';
        resultsTitle.textContent = `找到 ${terms.length} 个相关术语:`;
        glossaryGrid.appendChild(resultsTitle);
    }
    
    terms.forEach(term => {
        const card = createTermCard(term);
        glossaryGrid.appendChild(card);
    });
    
    if (!isSearchResult && terms.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color: white; text-align: center; font-size: 1.2rem;';
        emptyMsg.textContent = '没有找到相关术语';
        glossaryGrid.appendChild(emptyMsg);
    }
}

// Create term card HTML
function createTermCard(term) {
    const card = document.createElement('div');
    card.className = 'term-card';
    
    const categoryLabel = getCategoryLabel(term.category);
    
    card.innerHTML = `
        <div class="term-header">
            <div>
                <span class="term-en">${term.en}</span>
                ${term.zh ? `<span class="term-zh">${term.zh}</span>` : ''}
            </div>
            <span class="term-category category-${term.category}">${categoryLabel}</span>
        </div>
        <div class="term-definition">${term.definition}</div>
        ${term.related && term.related.length > 0 ? 
            `<div class="related-terms"><strong>相关：</strong>${term.related.join(', ')}</div>` : 
            ''}
    `;
    
    return card;
}

// Get Chinese label for categories
function getCategoryLabel(category) {
    const labels = {
        'math': '数学基础',
        'ml': '机器学习',
        'dl': '深度学习',
        'nlp': '自然语言处理',
        'model': '模型架构',
        'process': '训练流程'
    };
    return labels[category] || category;
}

// Search function with relevance scoring
function searchTerms(query) {
    if (!query.trim()) {
        renderTerms(aiTerms);
        return;
    }
    
    const queryLower = query.toLowerCase();
    
    const scored = aiTerms.map(term => {
        let score = 0;
        const matchParts = [];
        
        // Exact matches get highest scores
        if (term.en.toLowerCase() === queryLower) {
            score += 100;
            matchParts.push('英文全称精确匹配');
        } else if (term.en.toLowerCase().includes(queryLower)) {
            score += 50;
            matchParts.push('英文包含关键词');
        }
        
        if (term.zh && term.zh.includes(query)) {
            score += 80;
            matchParts.push('中文包含关键词');
        }
        
        if (term.definition && term.definition.includes(query)) {
            score += 40;
            matchParts.push('定义包含关键词');
        }
        
        if (term.related) {
            const relatedMatch = term.related.some(r => 
                r.toLowerCase().includes(queryLower) || r.includes(query)
            );
            if (relatedMatch) {
                score += 20;
                matchParts.push('相关术语匹配');
            }
        }
        
        // Category bonus - exact category match
        const categoryScores = {
            '数学': 30, 'math': 30,
            '机器学习': 25, 'ml': 25,
            '深度学习': 25, 'dl': 25,
            '模型': 20, 'model': 20
        };
        
        if (categoryScores[queryLower]) {
            score += categoryScores[queryLower];
            matchParts.push('类别匹配');
        }
        
        return { term, score, matchParts };
    });
    
    // Filter out zero-score items and sort by score
    const filtered = scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
    
    const results = filtered.map(item => ({...item.term, _score: item.score, _matchParts: item.matchParts}));
    
    // Show only top results in search box
    showSearchResults(filtered.slice(0, 10), true);
    
    // If we have matches, display them; otherwise show nothing
    if (results.length > 0) {
        renderTerms(results, true);
    } else {
        renderTerms([], true);
    }
}

// Show mini results in search dropdown
function showSearchResults(items, truncated = false) {
    searchResults.innerHTML = '';
    
    if (items.length === 0) {
        searchResults.classList.remove('active');
        return;
    }
    
    searchResults.classList.add('active');
    
    const maxToShow = truncated ? Math.min(items.length, 8) : items.length;
    
    for (let i = 0; i < maxToShow; i++) {
        const item = items[i];
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const percentage = Math.round((item._score / 100) * 100);
        resultItem.innerHTML = `
            <span class="result-score">${percentage}% 匹配度</span>
            <strong>${item.en}</strong>
            ${item.zh ? ` - ${item.zh}` : ''}
            <div style="margin-top: 0.3rem; color: #666; font-size: 0.85rem;">${item._matchParts.join(' · ')}</div>
        `;
        
        // Click to jump to the term in the full list
        resultItem.onclick = () => {
            const searchTerm = item.en; // or item.zh if available
            searchInput.value = searchTerm;
            searchTerms(searchTerm);
            searchResults.classList.remove('active');
        };
        
        searchResults.appendChild(resultItem);
    }
    
    if (truncated && items.length > 8) {
        const moreLink = document.createElement('div');
        moreLink.className = 'result-item';
        moreLink.style.textAlign = 'center';
        moreLink.style.color = '#667eea';
        moreLink.innerHTML = `显示全部 ${items.length} 个结果 →`;
        moreLink.onclick = () => {
            showSearchResults(items, false);
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        };
        searchResults.appendChild(moreLink);
    }
}

// Event listeners
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchTerms(query);
});

// Hide search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        searchResults.classList.remove('active');
    }
});

// Initialize on page load
displayAllTerms();

console.log('AI Glossary loaded successfully!');
console.log(`Total terms: ${aiTerms.length}`);
