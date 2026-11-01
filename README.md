# PersonalStyling · 衣品选衣 Skill

**给 Codex、WorkBuddy 等 AI Agent 安装后直接使用的中国本土审美私人形象顾问。**

不需要自己部署模型、安装 Node.js、启动网页、填 API Key，也不需要独立服务。把技能安装到你日常使用的 AI Agent 后，直接在对话里上传全身照/正脸照，描述想要的气质、场景和预算即可。

默认审美：**中国大陆主流男性审美为主，适度融合日韩简约风**。核心价值不是照搬穿搭博主，而是给本人制定上衣、裤子、鞋子、配饰、发型的完整方案。

> **能力说明**：Skill 是一套可复用工作流程，不是独立 AI 模型。照片分析取决于你使用的 Codex/WorkBuddy 版本是否支持读取图片。个人试穿效果图只有宿主提供生图/修图能力时才能生成。实时商品推荐需要宿主能搜索商家信息；否则输出款式与选购关键词。无需**额外** API Key，不代表 AI 平台没有账号、订阅或配额限制。

## 安装方式

### A. Codex（推荐：从 GitHub 安装）

在 Codex 对话里调用内置的 `$skill-installer`，告诉它：

```text
$skill-installer 请安装这个技能：
https://github.com/mindnature/PersonalStyling/tree/main/.agents/skills/personal-styling
```

或者将仓库克隆到本地，在该仓库目录启动 Codex；Codex 会从 `.agents/skills/personal-styling/` 发现仓库技能。若安装后没有显示，请重新启动 Codex。

明确调用：`$personal-styling`，然后附上照片与穿搭需求。

### B. WorkBuddy（上传 ZIP）

1. 从本项目的技能目录 [`.agents/skills/personal-styling`](.agents/skills/personal-styling) 获取完整技能文件夹；也可以直接使用维护者提供的同版本 **personal-styling.zip** 安装包。
2. 在 WorkBuddy 打开 **专家·技能·连接器 → 技能 → 添加技能 → 上传技能**，选择包含完整 `personal-styling/SKILL.md` 与 `references/` 的 ZIP。
3. 安装完成后，在对话里说“使用衣品选衣技能，给我搭配三套适合开会的衣服”，并上传照片。

不依赖 WorkBuddy 市场上架；这是**自己上传**的技能包，不要误认它已经在官方技能市场上线。具体界面名称以 WorkBuddy 客户端实际版本为准。

对于想自行打包的开发者：执行 `python scripts/package_skill.py`，会在 `dist/personal-styling.zip` 生成标准目录结构的安装包。打包 Python 仅用于发布，不是普通用户使用 Skill 的前置条件。

### C. 其他兼容 Agent Skills 的宿主

将完整的 `.agents/skills/personal-styling` 文件夹放到宿主支持的个人或项目 Skills 目录。不得只复制单独的 SKILL.md 并丢掉 `references/`；完整包能保留分析规范和使用示例。

## 安装后怎么说

```text
使用 PersonalStyling 帮我做私人形象分析。
我上传了全身照和正脸照。
希望 70% 成熟稳重 + 30% 清爽少年感。
场景：讲课 / 科研会议；季节：秋冬；整套预算：1000 元。
请先分析照片里实际可见的体型比例、发型和穿着效果，
再给我三套上衣、裤子、鞋子、配饰和发型的完整搭配，
说明版型、配色、原因、购买优先级和理发店沟通话术。
```

你也可以不提供照片，只问“这两件衣服怎么搭”“什么发型适合我”“用我已有的衣服组成三套造型”。

## 这是什么 / 不是什么

| 已经提供 | 取决于宿主或尚未提供 |
|---|---|
| 中国本土审美完整指导规则 | 主动读取/理解照片（需宿主视觉能力） |
| 个人风格 × 场景 × 预算工作流 | 本人虚拟试穿图片（需宿主生图/修图） |
| 三套可执行全身搭配及发型话术 | 京东/淘宝实时商品和价格（需搜索能力） |
| 衣橱优先复用、隐私与可靠性原则 | 独立 App、精确量体、自动下单 |

## 项目结构

```text
PersonalStyling/
├── .agents/skills/personal-styling/
│   ├── SKILL.md                 # 必需：技能入口
│   └── references/
│       ├── aesthetic-standard.md
│       ├── photo-analysis.md
│       ├── outfit-playbook.md
│       ├── capability-and-privacy.md
│       └── examples.md
├── scripts/package_skill.py     # 可选：发布者生成 WorkBuddy ZIP
├── tests/test_skill.py          # 静态检查
├── AGENTS.md                    # 开发本仓库的规则
└── README.md
```

## 维护与验证

仅维护者需要 Python 3（标准库），运行 `python -m unittest discover -s tests -v`。GitHub Actions 会验证技能目录、元信息和 ZIP 结构。普通安装者完全不需要运行此命令。

原先可选 API 的网页工作台保留在历史分支 [legacy-webapp](https://github.com/mindnature/PersonalStyling/tree/legacy-webapp)，**不属于本 Skill**。main 分支是无独立 API 的纯技能版本。

## 安全

个人照片不属于代码仓库。不要将真人照片、联系方式、敏感档案上传到公开 GitHub。Skill 不能替宿主承诺“照片永不上传/永不保存”；使用平台会按自己的服务规则处理输入。

MIT License · mindnature
