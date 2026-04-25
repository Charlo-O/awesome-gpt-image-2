<p align="center"><img src="./data/images/banner.svg" alt="GPT-Image2 Prompt System" width="800" /></p>

<h3 align="center">Prompt as Code | GPT-Image2 工业级提示词引擎与模板库</h3>

<p align="center">
  <a href="https://github.com/canghe/awesome-gpt-image-2"><img src="https://img.shields.io/github/stars/canghe/awesome-gpt-image-2?style=flat-square&color=rgb(25%2C%20121%2C%20255)" alt="Stars"></a>
  <a href="https://github.com/canghe/awesome-gpt-image-2"><img src="https://img.shields.io/github/forks/canghe/awesome-gpt-image-2?style=flat-square&color=green" alt="Forks"></a>
  <a href="https://github.com/canghe/awesome-gpt-image-2"><img src="https://img.shields.io/badge/Cases-329-blueviolet?style=flat-square" alt="Cases"></a>
  <a href="https://github.com/canghe/awesome-gpt-image-2"><img src="https://img.shields.io/badge/100%25-Original_AI_Rewritten-green?style=flat-square" alt="Original"></a>
</p>

> GitHub 首页已做精简适配，完整案例与长文内容已拆分到 `docs/`，避免 GitHub 对超大 README 的截断。

<a name="section-vision"></a>

## ⚡️ 项目愿景

GPT-Image2 全量开放后，AI 画图从“能不能出图”变成了“能不能稳定、可控、可复用地出图”。这个项目做的不是单纯收集提示词，而是把零散案例逆向整理成一套更适合 Agent 和自动化工作流调用的 Prompt-as-Code 资产。

核心目标只有一个：把“散文式提示词”压缩成“结构化协议”。当你需要批量出图、做模板系统、接进生产流程时，这种整理方式比单纯堆案例更有价值。

- 🧱 原子化 Schema：把主体、光影、材质、排版等视觉要素拆成可组合组件
- ⚙️ 工作流友好：面向 Agent、脚本和自动化系统，而不是只给人肉复制
- 🧬 结构化控制：尽量提高版式、文案、信息层级的可控性

## 📖 快速入口

- [完整案例总览](docs/gallery.md)
- [案例画廊 Part 1：例 1-165](docs/gallery-part-1.md)
- [案例画廊 Part 2：例 166-329](docs/gallery-part-2.md)
- [工业级提示词模板与防坑指南](docs/templates.md#section-templates)
- [完整声明页](docs/disclaimer.md#section-disclaimer)

## 🗂️ 分类概览

- UI与界面：65
- 图表与信息可视化：46
- 海报与排版：58
- 商品与电商：15
- 品牌与标志：16
- 建筑与空间：25
- 摄影与写实：28
- 插画与艺术：23
- 人物与角色：10
- 场景与叙事：7
- 历史与古风题材：6
- 文档与出版物：6
- 其他应用场景：18

需要按案例细看，直接进：

- [按册浏览完整画廊](docs/gallery.md)
- [提示词模板总表](docs/templates.md)

<a name="section-gallery"></a>

## 🖼️ 首页精选

### 例 1：信息图可视化设计

[![城市生命系统图谱 / Urban Metabolism Atlas](data/images/case1.jpg)](docs/gallery-part-1.md#case-1)

工程白皮书气质的信息图案例，适合看结构化信息图如何组织模块、层级和双语标签。  
[查看完整案例](docs/gallery-part-1.md#case-1)

### 例 2：社媒界面截图

[![Ailln AI](data/images/case2.jpg)](docs/gallery-part-1.md#case-2)

偏“产品界面 + 社媒内容截图”的混合场景，适合看文字区域、UI 框架和内容卡片的控制方式。  
[查看完整案例](docs/gallery-part-1.md#case-2)

### 例 6：插画艺术创作图

[![参考图是角色人设图，为参考图的少女绘制一副日系唯美奇幻风格插画](data/images/case6.jpg)](docs/gallery-part-1.md#case-6)

日系奇幻插画范例，适合观察氛围、色彩和大场景构图的描述方式。  
[查看完整案例](docs/gallery-part-1.md#case-6)

### 例 17：界面交互设计图

[![type](data/images/case17.jpg)](docs/gallery-part-1.md#case-17)

典型的“结构分解图 + 说明排版”场景，适合做产品示意图、海报化技术讲解图。  
[查看完整案例](docs/gallery-part-1.md#case-17)

### 例 166：十二黄金圣斗士卡牌合集

[![十二黄金圣斗士卡牌合集](data/images/case166.jpg)](docs/gallery-part-2.md#case-166)

多卡面、多元素统一风格的案例，适合参考批量生成与系列化设计。  
[查看完整案例](docs/gallery-part-2.md#case-166)

### 例 310：零食品牌技术分解图

[![零食品牌技术分解图](data/images/case310.jpg)](docs/gallery-part-2.md#case-310)

品牌叙事、分解结构和商业化呈现结合得比较完整，适合作为“信息图 + 品牌视觉”混合参考。  
[查看完整案例](docs/gallery-part-2.md#case-310)

<a name="section-templates"></a>

## 🧩 模板入口

完整模板已移到 [`docs/templates.md`](docs/templates.md)。这里保留最核心的使用方式：

1. 先明确任务类型：UI、海报、电商、信息图、角色设定、出版物。
2. 再锁定结构约束：比例、布局、模块数量、镜头语言、文字要求。
3. 最后补风格和材质：色彩、光线、笔触、氛围、材质、质感。

如果是给 Agent 或脚本调用，优先看：

- [UI 与界面模板](docs/templates.md#tpl-ui)
- [信息图模板](docs/templates.md#tpl-infographic)
- [海报模板](docs/templates.md#tpl-poster)
- [摄影模板](docs/templates.md#tpl-photo)

## 🚀 怎么用这个库

1. 先在精选案例里确定你要模仿的输出类型。
2. 再去完整画廊里找相近案例，抄结构，不要只抄风格词。
3. 最后回到模板页，把你的业务变量填进通用模板或 JSON 模板。

<a name="section-disclaimer"></a>

## 📄 声明与补充

## 致谢与来源说明

本项目在整理与研究过程中，参考并使用了 [YouMind](https://youmind.com/) 与 [OpenNana](https://opennana.com/) 的公开提示词库内容，仅用于学习、归纳与方法论研究。相关内容版权归原作者或原平台所有，如有侵权或不当使用请联系处理，我们将第一时间修正或下线。

## 声明 (Disclaimer)

本项目仅整理公开可访问的社区提示词与示例图片，默认用于学习与研究，不主张对第三方原创内容的任何所有权。

本项目里的所有提示词案例和生成的图片，最初的灵感和数据来源均来自公开社区，特别是 [YouMind](https://youmind.com/) 与 [OpenNana](https://opennana.com/)。我们做这个项目，主要是想把好看的案例拆解成可复用的结构化协议，用于学习、归纳和大模型 Agent 接入的自动化测试。

- 我们尽最大努力保留原始来源，包括作者主页、原帖链接与原仓库链接。
- 涉及第三方内容时，遵循来源仓库声明、`CC BY 4.0` 等许可及对应平台规则。
- 若你是原作者或权利人，认为某条内容不应展示，请在本仓库发起 Issue 并附上条目链接，我们将在核验后快速下架。
- 本仓库不保证第三方内容可用于商业用途；商业使用前请自行取得原权利方授权。

**如果你觉得这个库帮到了你，请点亮右上角的 Star ⭐。**

## Star 趋势图

[![Star History Chart](https://api.star-history.com/svg?repos=canghe/awesome-gpt-image-2&type=Date)](https://star-history.com/#canghe/awesome-gpt-image-2&Date)

## 公众号

微信搜 **苍何** 或扫描下方二维码关注苍何的原创公众号，回复 **AI** 即可获取更多 AI 提示词学习资源。

![苍何微信公众号](https://cdn.tobebetterjavaer.com/stutymore/%E6%89%AB%E7%A0%81_%E6%90%9C%E7%B4%A2%E8%81%94%E5%90%88%E4%BC%A0%E6%92%AD%E6%A0%B7%E5%BC%8F-%E6%A0%87%E5%87%86%E8%89%B2%E7%89%88.png)

补充版本仍保留在 [`docs/disclaimer.md`](docs/disclaimer.md)。
