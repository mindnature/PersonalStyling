# PersonalStyling · Agent 维护与开发规约

当前 `main` 是**无需额外 API 的纯 Agent Skill V2.1**；旧网页代码保存在 `legacy-webapp`。普通使用者只需在支持的宿主安装 `.agents/skills/personal-styling`，无需 Node/数据库/独立服务。

目录：入口 `.agents/skills/personal-styling/SKILL.md`；按需参考 `references/`；验收 `evals/cases.json`；结构测试 `tests/test_skill.py`。

维护原则：
1. 默认中国大陆主流男性审美＋少量日韩简约元素，接受用户明确的风格覆盖。
2. 必须将照片结论建立在可见证据之上，附试穿验证建议；看不到照片就明确说。
3. A/B/C 有至少两个实质差异；包括上衣/裤装/鞋/配饰/发型和适用场景。
4. 预算默认为本次新增采购总额，衣柜已有单品计 0 元新增，去重后不能超预算。
5. 用户反馈后只局部修改、保存已确认约束；禁止重新索要已有图片。
6. 不编造商家链接、价格、库存、精准尺寸、已生成的效果图。
7. 不把个人照片、密钥、隐私信息写入仓库；使用宿主本来具备的工具，不额外要求 API Key。
8. 更新 SKILL.md 或引用文件后，检查引用与 V2.1 版本一致、运行 `python -m unittest discover -s tests -v`。
9. 自动化测试只验证 Skill 结构/内容完整性，模型搭配质量需使用 `evals/cases.json` 进行真人/人工评估。

打包：`python scripts/package_skill.py`，生成 `dist/personal-styling.zip`；GitHub Actions 同样会生成压缩包。
