# PersonalStyling / Agent 开发规约

当前 main 分支是 **Agent Skill**（非 Node.js App）。用户安装技能后应直接在 Codex/WorkBuddy 内聊天使用，不需要 API Key、Node.js 或本地服务。旧网页工程见 legacy-webapp 分支。

- 入口：.agents/skills/personal-styling/SKILL.md
- 参考：.agents/skills/personal-styling/references/
- 校验：python -m unittest discover -s tests -v
- 打包：python scripts/package_skill.py
- 安装方法：README.md

修改要求：
1. 保持 WorkBuddy 必填的 SKILL.md YAML 元字段，兼容 Agent Skills name/description。
2. 仍以中国大陆主流男性审美为默认、只适量参考日韩简约，不复制欧美模板，也不对人群作审美刻板评价。
3. 保证完整穿搭（上衣/裤子/鞋子/配饰/发型）、预算人民币、真实场景、优先复用旧衣。
4. 工具能力不齐时优雅降级；不编造商品链接、实测尺寸、真人试穿效果或照片内容。
5. 不引入安装即必须用的 API Key、服务器、数据库、脚本执行或模型订阅。
6. 对真实照片谨慎：不得写入仓库、生成公开 URL 或无授权转发第三方服务。
7. 增加或修改引用文档后同步检查 SKILL.md 的 @references 路径，运行静态测试。
8. 没有根据用户照片产生的可靠证据时，不作精准脸型、肤色或发量判断。
