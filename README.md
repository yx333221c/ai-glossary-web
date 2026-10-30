# AI 术语词典 | AI Glossary Webpage

一个精美的 AI 术语查询网页，涵盖机器学习、深度学习、自然语言处理等核心概念。

## 📚 功能特性

- **完整的术语库**: 包含 60+ 个 AI 领域核心术语
- **智能搜索**: 支持中英文搜索，按关联程度自动排序
- **精美界面**: 渐变色设计，响应式布局，卡片式展示
- **分类清晰**: 按数学基础、机器学习、深度学习、模型架构等分类
- **相关术语**: 每个词条显示相关链接，方便深入理解

## 🎯 术语覆盖范围

### 基础概念
- Artificial Intelligence (人工智能)
- Machine Learning (机器学习)
- Deep Learning (深度学习)
- Neural Network (神经网络)

### 数学基础
- Token (词元)
- Embedding (嵌入)
- Surprise / Self-information (惊讶度)
- KL Divergence (KL 散度)
- Parameter & Weight (参数与权重)
- Loss / Cost Function (损失函数)
- Cross-Entropy (交叉熵)
- Perplexity (困惑度)
- Gradient (梯度)
- Learning Rate (学习率)
- Activation Function (激活函数)

### 神经网络架构
- Backpropagation (反向传播)
- CNN (卷积神经网络)
- Receptive Field (感受野)
- Residual Connection (残差连接)
- BatchNorm / LayerNorm (批归一化/层归一化)

### 注意力与 Transformer
- Attention (注意力机制)
- Query / Key / Value (查询/键/值)
- Self-Attention (自注意力)
- Multi-Head Attention (多头注意力)
- Transformer
- Positional Encoding (位置编码)
- RoPE (旋转位置编码)
- Feed-Forward Network (前馈网络)

### 训练方法
- Pretraining (预训练)
- Fine-Tuning (微调)
- Scaling Law (规模定律)
- Emergent Ability (涌现能力)
- Alignment (对齐)
- RLHF (基于人类反馈的强化学习)

### 推理与生成
- Inference (推理)
- Hallucination (幻觉)
- Temperature (温度)
- Logit (未归一化得分)
- Sampling (采样)
- Top-p / Nucleus (核采样)
- Context Window (上下文窗口)
- KV Cache (键值缓存)
- Prompt Engineering (提示工程)
- Chain-of-Thought (思维链)

### 评估与基准
- Benchmark (基准测试)
- Zero-shot Classification (零样本分类)

### 多模态
- Multimodal (多模态)
- CLIP (图文对比模型)
- Patch (图像块)
- InfoNCE
- Vector Quantization (向量量化)

### 进阶主题
- Agent (智能体)
- Tool Use / Function Calling (工具调用)
- RAG (检索增强生成)
- Jailbreak (越狱)
- Prompt Injection (提示注入)
- Red Teaming (红队测试)

## 🚀 使用方法

1. 直接打开 `index.html` 文件即可在浏览器中查看
2. 在搜索框输入关键词（中文或英文）
3. 搜索结果会按匹配程度排序显示
4. 点击任意术语卡片可查看详细信息

## 🛠️ 技术栈

- HTML5
- CSS3 (Flexbox/Grid, CSS Variables, Animations)
- Vanilla JavaScript (ES6+)

## 📱 响应式设计

页面采用响应式布局，完美适配：
- 桌面端 (双列/三列布局)
- 平板 (单列/双列自适应)
- 移动端 (单列布局)

## 🔧 自定义

### 添加新术语
在 `app.js` 的 `aiTerms` 数组中添加：
```javascript
{
    en: "English Term",
    zh: "中文翻译",
    category: "ml", // math, ml, dl, nlp, model, process
    definition: "定义描述",
    related: ["相关术语 1", "相关术语 2"]
}
```

### 修改样式
编辑 `styles.css` 文件中的各个组件样式。

### 调整配色
在 `styles.css` 中修改以下渐变色：
- 背景渐变
- 分类标签颜色
- 按钮和交互元素颜色

## 📄 License

MIT License - 可自由用于学习和项目

---

Created for AI learning and knowledge sharing.
