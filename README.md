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

## 🚀 快速开始

### 本地运行
```bash
# 方式 1：直接在浏览器打开
双击 index.html 文件

# 方式 2：使用本地服务器（推荐）
python -m http.server 8000
# 访问 http://localhost:8000
```

### 部署到 GitHub Pages
```bash
# 1. 创建新的 GitHub 仓库
git remote add origin https://github.com/YOUR_USERNAME/ai-glossary-web.git
git branch -M main

# 2. 推送到 GitHub
git push -u origin main

# 3. 启用 GitHub Pages
# Settings → Pages → Source → main branch → Save
```

## 📖 使用方法

1. **打开页面**：直接双击 `index.html` 或在浏览器中打开
2. **搜索术语**：在顶部搜索框输入关键词（支持中文或英文）
   - 示例："attention"、"注意力"、"embedding"、"微调"
3. **查看结果**：搜索结果按匹配度自动排序，百分比越高越相关
4. **查看详情**：点击任意术语卡片查看详细定义和相关术语

## 🔍 搜索技巧

- **精确匹配**: 输入完整术语名称获得最准确结果（如 "Chain-of-Thought"）
- **部分匹配**: 输入关键词的一部分也能找到相关术语
- **中英文混搜**: 同时支持中文和英文关键词
- **定义搜索**: 搜索定义描述中的关键词也能找到对应术语

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
