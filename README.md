# PersonalStyling · 衣品选衣工作台

**中国大陆主流男性审美 × 少量日韩简约风** 的本地优先私人形象与穿搭工作台。可上传正面人脸照和全身照，选风格/场景/季节/预算，生成三套完整上衣、裤子、鞋子、配饰、发型方案。

> 注意：未配置 API Key 时运行的是**基于表单的离线规则推荐**，不会分析照片。配置自己的 OpenAI API Key 并主动点击「AI 看图分析」后，可发送图片进行视觉辅助分析。当前版本**不是**真实虚拟试穿、电商实时检索或精准身材测量工具。

## 30 秒启动

需要 Node.js **20+**，不依赖第三方 npm 包。

    git clone https://github.com/mindnature/PersonalStyling.git
    cd PersonalStyling
    npm start

浏览器打开 http://127.0.0.1:3000。Windows PowerShell、macOS、Linux 均可。

## 可选：启用 AI 看图

复制 .env.example 为 .env：

- Windows PowerShell：Copy-Item .env.example .env
- macOS/Linux：cp .env.example .env

编辑 .env，在 OPENAI_API_KEY= 后填写你自己的密钥（**不要**发给别人或提交仓库）。重启 npm start。前端会显示 AI 已启用。

- 调用 OpenAI Responses API；模型默认 gpt-4.1-mini，可在 .env 修改 OPENAI_MODEL。
- 只有主动点击「AI 看图分析」后，上传的照片才会被发送给外部 API。
- 图片在浏览器压缩，服务端只转发并返回分析结果，不存盘；API 调用可能产生费用。
- 请求配置 store:false；提供商仍可能依照自身政策处理或保留数据，请自行评估。
- 未提供密钥时，全部功能仍可本地运行（不包括真实看图分析）。

## 已实现

- 中文响应式工作台，双照片上传与本地预览
- 个人资料：身高体重、尺码、目标气质、成熟/少年感、季节、场景、预算、已有衣服、发型诉求
- 离线规则引擎输出 A日常、B提升、C年轻 三套搭配
- 可选的 OpenAI 图像理解分析，结构化输出三套建议
- 方案下载为 Markdown / JSON；清除本地偏好数据
- 本机默认监听 127.0.0.1，不保存原始照片，不在浏览器存储照片
- 中文提示、错误处理、自动化测试

## 暂未实现

- AI 换装图 / 精准同脸虚拟试穿
- 真人身高、围度自动测量
- 电商实时库存/价格/购买链接核验
- 用户账号、云端衣橱、移动 App

## Codex / WorkBuddy 快速接管

将仓库克隆到本地，然后让 Agent 阅读 **AGENTS.md**、**README.md**、**docs/STYLE_STANDARD.md**。通用首条指令见 [docs/WORKBUDDY.md](docs/WORKBUDDY.md)。

    npm test
    npm run dev

## 架构

- public/index.html：网页结构
- public/style.css：视觉样式
- public/app.js：交互、上传、结果展示、下载
- src/engine.mjs：规则化方案与 AI 返回结果校验
- server.mjs：Node 原生静态服务与私钥代理
- tests/engine.test.mjs：Node 原生单元测试
- docs/STYLE_STANDARD.md：风格原则与伦理/隐私边界

## 隐私提醒

仓库不含任何示例真人照片。上传的人像仅在浏览器当前会话用于预览；选择 AI 模式时才会从本机发送到你配置的服务商。请勿把真实照片放进公开仓库、代码提交或 bug 报告。

## 开源许可

MIT。欢迎提交 Issue 与 Pull Request。
