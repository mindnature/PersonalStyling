# PersonalStyling · 衣品选衣 Skill V2.2

**中国大陆主流男性审美 × 少量日韩简约风**。一个安装后直接对话使用的私人形象顾问技能，适配 Codex、WorkBuddy 以及支持 Agent Skills 的 AI Agent。

不需要自己部署模型、安装 Node.js、启动网页或填写**额外** API Key。直接上传照片、描述场景和预算，让宿主 AI 给出可落实的上衣、裤子、鞋履、配饰和发型建议。

> 它不是一个独立视觉模型：是否能直接分析图片、生成本人试穿图、搜索电商，取决于宿主工具与权限。宿主原有的账号、用量及订阅约束仍然存在。技能会在能力不足时明确告知，不会装作已经看图、下单或生成效果图。

## 为什么改成来源优先

上一版本给过度通用的搭配建议时，用户无法判断出处，也很难选出真正喜欢的穿搭。**V2.2 改为先看真实造型、校准喜好，再基于本人照片与生活场景做适配**：

- 默认先从真人 OOTD / 中国品牌官方 Lookbook 寻找 4–6 个**可核验原始链接**，有多少可靠案例就展示多少，不凑数。
- 预置一组**带网址与核验日期**的官方造型/图库种子：[穿搭素材来源目录](.agents/skills/personal-styling/references/lookbook-library.md) 和 [已核实案例索引](.agents/skills/personal-styling/references/curated-look-index.json)。它不是下载好的海量图片库；原图和版权归来源网站。
- 先让使用者判断“喜欢/不喜欢/只喜欢局部”；对不喜欢的结构停止重复推荐，之后才以照片分析调整衣长、鞋型、裤型。
- 浏览器或网页搜索能力不可用时，**不会伪称刚联网搜过**：可使用注明核验日期的有限种子参考，或请用户上传喜欢的参考图。
- 只有在确认具体风格后，才针对个人给出三套适配；不会一看脸照就武断地推荐“青年教师必须浅蓝衬衫/西装”。

可直接说：**“先不要给我买衣服建议。请拿真实国内男装 Lookbook 和素人 OOTD 的原始链接，展示五种不同风格让我挑；选定后再按我照片适配。”**

## V2.2 重点改进

1. **照片证据驱动**：通过「可见线索 → 影响 → 可试穿的修改」给出肩线、衣长、裤脚、鞋型、刘海等具体建议；不猜三围和真实尺码。
2. **三套有差异**：A 日常高频、B 形象升级、C 清爽年轻；至少在两处造型结构、正式度或鞋裤形态上不同，不只是换颜色。
3. **完整发型决策**：顶部、侧面、刘海、打理难度、备选发型和理发店沟通话术。
4. **预算与衣橱去重**：默认将预算视为本次全部新增采购的总额，旧衣优先，三套共享的裤鞋不会收费三次。
5. **反馈精准修订**：用户说显老、太韩、不合身、超预算时，只改必要项目并保留已确认条件。
6. **质量核对与样例**：七项出稿检查、19 种覆盖边界场景的评估用例，避免编造商品和伪装图片处理。

## 安装到 Codex

在 Codex 对话中使用技能安装器（若该版本提供）：

```text
$skill-installer 请安装这个技能目录：
https://github.com/mindnature/PersonalStyling/tree/main/.agents/skills/personal-styling
```

也可以克隆本仓库，在仓库目录中运行 Codex，项目下的 `.agents/skills/personal-styling/` 供其识别；按当前 Codex 版本的 Skill 目录规则操作。安装后可显式使用 `$personal-styling`。如果未出现，可重新启动客户端检查。

## 安装到 WorkBuddy

1. 打开本仓库 **Actions → Validate PersonalStyling Skill** 的最新成功运行，在 Artifacts 下载 **PersonalStyling-Skill** 压缩包。
2. GitHub 下载的是 GitHub Actions 外层 ZIP：**先解压一次**，得到里面的 `personal-styling.zip`（真正的技能安装文件）。
3. 在 WorkBuddy 的技能管理/上传入口导入这个内层 ZIP；具体入口名称以当前客户端版本为准。
4. 安装成功后直接说：“用衣品选衣技能分析我的全身照和正脸照”。

也可让维护者或开发者执行 `python scripts/package_skill.py` 自行生成 `dist/personal-styling.zip`。这个命令只用于发布包，普通使用者**不需要 Python 或 Node.js**。ZIP 内有 `personal-styling/SKILL.md` 和完整的 `references/` 文件夹。

## 示例对话

```text
请使用 PersonalStyling 技能。
我上传了全身照和正脸照。
希望成熟稳重 70%＋少年感 30%，主要用于高校讲课与会议。
本次新增采购总预算 800 元，已有深灰直筒裤和白鞋。
先说照片真正能看见的版型问题与适合尝试的发型，
再给我三套明显不同、实际能穿的完整穿搭。
列出旧衣复用、新购物品、预算上限和理发店沟通语。
```

不用上传照片也可以直接问“我这两件上衣如何搭”“理发师应该怎么剪”“预算不变，B 方案太显老，帮我局部修改”。

## 能力边界

| 已由 Skill 提供 | 取决于宿主工具 |
|---|---|
| 中国本土审美、个性化推理流程 | 用户照片的视觉理解 |
| 衣长/肩线/裤脚等具体检查方法 | 编辑本人试穿效果图 |
| 三套差异化造型与发型建议 | 当前电商商品、价格与库存 |
| 预算去重、旧衣复用、反馈修订 | 持久化个人衣橱 |
| 图片隐私与禁止瞎编规则 | 对照片做真实精确量体（不承诺） |

## 技能目录

```text
PersonalStyling/
├── .agents/skills/personal-styling/
│   ├── SKILL.md
│   └── references/
│       ├── aesthetic-standard.md
│       ├── photo-analysis.md
│       ├── lookbook-library.md
│       ├── curated-look-index.json
│       ├── style-discovery.md
│       ├── fit-and-hair.md
│       ├── outfit-playbook.md
│       ├── budget-and-wardrobe.md
│       ├── feedback-loop.md
│       ├── quality-review.md
│       ├── capability-and-privacy.md
│       └── examples.md
├── evals/cases.json           # 测试场景与期望行为（不是模型实际评分）
├── tests/test_skill.py        # 结构、规范及打包静态校验
├── scripts/package_skill.py   # 发布者打包脚本
└── AGENTS.md
```

## 验证与隐私

维护者执行 `python -m unittest discover -s tests -v` 检查元信息、引用文件与 ZIP 结构。GitHub Actions 自动测试**不代表真实宿主模型穿搭结果已经完成真人评测**，建议按 `evals/cases.json` 在 Codex/WorkBuddy 中逐条试用和反馈。

用户照片不属于公开代码仓库。勿把本人或他人人像加入 Git 提交。宿主对用户输入的处理遵从其产品规则，不承诺“照片绝不上传”。

此前网页版在 [legacy-webapp](https://github.com/mindnature/PersonalStyling/tree/legacy-webapp) 分支，与无需独立 API 的 Skill 主线分开。开源许可证为 MIT。
