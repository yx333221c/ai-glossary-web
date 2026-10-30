# AI 术语词典

人工智能领域术语的中英对照查询网页。**纯静态、零依赖、无构建步骤**——双击 `index.html` 就能用，也可以部署到任意静态托管。

在线版：<https://yx333221c.github.io/ai-glossary-web/>

收录 **195 条**术语，每条给出统一中文译名、英文原词、别名、一句话释义、机制说明、常见误译与相关术语。

## 页面

| 文件 | 作用 |
|---|---|
| `index.html` | 浏览：按分类分组列出全部条目，可切列表/卡片视图、按拼音首字母过滤、随机跳转 |
| `search.html` | 搜索：输入关键词按**关联程度**排序，显示相关度条与命中原因，可回车进详情 |
| `term.html?id=xxx` | 详情：一句话释义 + 展开说明 + 用法提醒 + 相关术语 + 上一条/下一条 |
| `about.html` | 关于：数据字段说明、完整译名对照表、排序权重表、已知局限 |

## 怎么用

```bash
# 方式一：直接打开（file:// 完全可用，脚本都是普通 <script>，没有 ES module 与 fetch）
双击 index.html

# 方式二：本地服务器
node tools/serve.js 8137      # 然后访问 http://127.0.0.1:8137
```

搜索支持四种输入，任选：

| 输入 | 例 | 命中 |
|---|---|---|
| 中文名 | `键值缓存` | KV cache |
| 英文名 | `embedding` | 嵌入 |
| 拼音全拼 | `jianzhihuancun` | 键值缓存 |
| 拼音首字母 | `jzhc` | 键值缓存 |
| 释义内文 | `多付` | KL 散度 |

快捷键：`/` 聚焦搜索框、输入即出结果、`↑` `↓` 在结果间移动、`Esc` 清空。

在线版由 GitHub Pages 从 `main` 分支根目录直接构建（无 CI、无构建步骤）。全站链接都是相对路径，
所以子路径部署与 `file://` 双击用的是同一份文件，不需要任何 base path 配置。

## 排序是怎么算的

`assets/engine.js` 是唯一逻辑内核，对每条术语的多个字段分别打分：

- **命中层级优先**：名称完全等于查询词 > 名称前缀 > 名称子串 > 只在释义/标签/分类里撞到。层级不同就先比层级，避免「名字里带这个词」的条目压过「就叫这个名字」的条目。
- **多字段加权**：英文名、中文名、别名 `aka`、拼音全拼、拼音首字母、`id`、释义、长文、标签、分类、难度名、关联术语名，各自有独立权重（见 `about.html` 的权重表，数值实时从引擎读取）。
- **多词查询是 AND 语义**：每有一个主查询词完全没命中，总分乘一次惩罚系数 `missFactor`，所以「注意力 机制」比只命中一个词的条目排得高。
- **中文二字滑窗只加分不惩罚**：让「注意力机制」也能被「注意」召回，但不会因为拆词而误伤。
- **正文命中封顶**：`defCap` / `longCap` / `relCap` 防止长文本靠出现次数刷分。
- **相关度百分比是相对值**：把最高分归一为 100，只表示「与第一名相比有多相关」。

想调排序倾向，改 `engine.js` 里的 `W` 权重表即可，页面与 `about.html` 会同步反映。

## 目录结构

```
ai-glossary-web/
├── index.html  search.html  term.html  about.html
├── assets/
│   ├── engine.js       检索内核（打分、拼音音节切分、分类元数据）
│   ├── ui.js           顶栏、主题、卡片渲染等共享 UI
│   ├── site.css        全站样式（含深色主题与响应式）
│   ├── browse.js       浏览页逻辑
│   ├── search-page.js  搜索页逻辑
│   └── term-page.js    详情页逻辑
├── data/               术语数据，按分片加载（顺序即 id 冲突时的优先级）
│   ├── data-core.js    55 条：参考术语表的译名与释义 + 补充
│   ├── data-llm.js     语言模型 / NLP / 解码
│   ├── data-systems.js 经典机器学习 / 视觉 / 训练与部署系统
│   ├── data-extra.js   补齐被引用概念（Transformer、过拟合等）
│   └── data-agents.js  智能体 / 多模态 / 前沿争议 / 推理工程
├── tests/              4 个测试套件（见下）
├── tools/              维护脚本（链接检查、去重、改名、本地服务器）
└── package.json        仅用于 `npm test` / `npm start`，无第三方依赖
```

## 数据格式

一个条目长这样，往任一 `data/*.js` 的 `T.push(...)` 里加即可：

```js
{
  id: "kv-cache",                 // 全小写短横线，全局唯一
  en: "KV cache",                 // 英文原词
  zh: "键值缓存",                  // 统一中文译名
  aka: ["KV Cache", "键值对缓存"], // 别名/缩写
  pinyin: "jian zhi huan cun",    // 中文全拼，按音节空格分隔（推荐）
  cat: "inference",               // 见下方分类
  level: "core",                  // basic | core | advanced
  def: "复用历史词元的键与值以避免重复计算。",
  long: "补充说明：机制、边界、常见误解。",
  avoid: ["把它当作「模型的记忆」"], // 不采用的写法 / 常见误解
  related: ["qkv", "context-window"], // 只填存在的 id
  tags: ["优化", "显存"]
}
```

`pinyin` 也可以连写（`jianzhihuancun`），引擎会自己切音节；`pyFull` 与首字母 `py1` 由引擎在索引时派生，**不要手写 `py1`**。

分类取值：`math` `ml` `dl` `nlp` `training` `inference` `multimodal` `agent` `safety` `infra` `frontier`。

## 测试

```bash
npm test              # 跑全部（后两项需要本机装有 Chrome 或 Edge）
npm run test:logic    # 65 项：数据完整性、译名一致性、检索排序、拼音自洽
npm run test:pages    # 39 项：页面脚本装配、内联脚本语法、引用无悬空
npm run test:browser  # 41 项：无头 Chrome 实渲染，检查控制台错误与关键内容
npm run test:responsive # 88 项：CDP 强制 1400/1024/820/560/390px 视口，检查横向溢出
npm run links         # 列出 related 里指向不存在 id 的引用
```

无浏览器环境下 `test:browser` 与 `test:responsive` 会自动跳过并返回 0，逻辑层测试仍会执行。

> `--window-size` 在 headless Chrome 下会被夹到固定尺寸，截出来的「移动端」其实还是桌面宽度。
> 所以响应式测试走 DevTools Protocol 的 `Emulation.setDeviceMetricsOverride`，
> 并且直接测量 `documentElement.scrollWidth` 与元素边界，而不是靠肉眼看截图。

## 加一条术语的流程

1. 找合适的分片，往 `T.push(...)` 里加条目（新主题可另建 `data-xxx.js`，并在四个页面的 `<script>` 列表里加一行）。
2. `related` 只填已经存在的 `id`。
3. `npm run links && npm test`。
4. 若新增了分类，记得同步 `engine.js` 的 `CATEGORIES`。

## 数据来源与边界

- 核心 **55 条**的译名与释义参考自另一项目 `ai-principles-web` 的术语表（`docs/glossary.md`）。该项目对本仓库**只作参考，不运行、不修改**；本仓库是独立实现。
- 其余条目为补充，全部释义是为本站重写的，力求准确并刻意标注边界与反面提醒，但**不能替代论文与教材**——它是查「这个词该译成什么、大致指什么」的对照工具，不是可引用的定义出处。
- 存在争议的概念（涌现能力、对齐、pre-LN / post-LN 孰优）已归入 `frontier` 分类并在条目内标明争议，请把它当作「此处尚无共识」的信号，而不是结论。
- 不给具体论文页码或引文编号：条目多、更新快，写了反而容易过期或写错。

## 已知局限

- 拼音只覆盖中文名字段，释义里的中文没有拼音化；首字母有天然碰撞（`cy` 同时是「采样」与「词元」）。
- 纯线性扫描打分，没有倒排索引；当前条目量下是毫秒级，上千条以后需要换实现。
- 拼写容错只兜一次编辑距离，且要求查询词不短于 4 个字符。
- 无中文分词与英文词形还原，复数与动词化形式只靠子串联系。
- 覆盖面偏语言模型周边，语音、强化学习、传统 ML 只点到为止。

## License

MIT
