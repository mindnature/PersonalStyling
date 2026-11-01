# 在 WorkBuddy / Codex 中复用 PersonalStyling

这是标准 Git 仓库，并不依赖任何特定 Agent 私有格式。只要 Agent 可以打开本地工程目录，就可以读取 README.md 与 AGENTS.md 接手开发。

## 一次性启动
1. 克隆：https://github.com/mindnature/PersonalStyling
2. 打开 PersonalStyling 文件夹。
3. 确保 Node.js >=20；执行 npm start。
4. 打开 http://127.0.0.1:3000。
5. 不需要账号、数据库、npm install 或付费 API 即可体验本地推荐。

## 启用 AI 看图分析（可选）
1. 将 .env.example 复制为 .env。
2. 写入自己的 OPENAI_API_KEY；不要放到聊天记录或仓库。
3. 重启 npm start。
4. 上传照片并主动点击「AI 看图分析」。
5. AI 调用可能产生 API 费用，模型访问权限取决于提供商账户。

## 给编码 Agent 的第一条指令（可复制）
请阅读本仓库 README.md、AGENTS.md 和 docs/STYLE_STANDARD.md。先执行 npm test，再启动项目并检查浏览器页面。遵循“国内主流审美 + 少量日韩简约风”和照片隐私原则。保持离线可用，修改后补测试，不要宣称未实现的虚拟试穿或实时商品推荐。

## 使用边界
Codex / WorkBuddy 是开发代理，不能替代应用实际使用的视觉模型。只克隆仓库并不能自动获得付费的图像理解 API 权限。离线模式与 AI 模式会在界面明确区分。
