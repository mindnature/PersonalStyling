/**
 * 零依赖本机 HTTP 服务；API Key 仅存在服务端环境变量。
 * 不保存图片；仅用户明确点击“AI 看图分析”时才将照片传给 API。
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { normalizeProfile, normalizeAiPlan } from "./src/engine.mjs";

const root = dirname(fileURLToPath(import.meta.url));
async function loadEnv() {
  try {
    const env = await readFile(join(root, ".env"), "utf8");
    for (const line of env.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !Object.hasOwn(process.env, m[1])) {
        let v = m[2];
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch (error) { if (error.code !== "ENOENT") throw error; }
}
await loadEnv();
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT 无效");
const host = process.env.HOST || "127.0.0.1";
const staticFiles = new Map([
  ["/", ["public/index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["public/index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["public/app.js", "text/javascript; charset=utf-8"]],
  ["/style.css", ["public/style.css", "text/css; charset=utf-8"]],
  ["/engine.mjs", ["src/engine.mjs", "text/javascript; charset=utf-8"]],
  ["/favicon.svg", ["public/favicon.svg", "image/svg+xml"]]
]);
function send(res, code, data, type = "application/json; charset=utf-8") {
  res.writeHead(code, {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data: blob:; connect-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'; frame-ancestors 'none'"
  });
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}
function inputError(message, status = 400) { const e = new Error(message); e.status = status; return e; }
async function readJson(req) {
  const maxBytes = 12 * 1024 * 1024;
  let size = 0, chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw inputError("图片体积过大。请上传较小的 JPG/PNG 图片。", 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw inputError("请求 JSON 格式不正确"); }
}
const systemRules = [
  "你是中国男性私人形象顾问，默认中国大陆主流男性审美为主，适度借鉴日韩简约穿搭。",
  "目标：清爽、精神、自然、得体、成熟但不显老、年轻但不装嫩；优先中国高校/办公室/通勤等真实情境。",
  "根据用户的正脸与全身照片，在可观察范围内谨慎分析面部轮廓、发型、身体视觉比例、衣物与气质。",
  "不得根据照片推断年龄、民族、健康、收入、职业、人格或其他敏感属性；不得将拍摄偏差当成真实身材参数。",
  "用户手动填写的身高、体重、尺码可作为参考，未填写则不要编造。",
  "优先推荐自然直筒、适度松量、合适肩线、合理裤长和中国市场常见的可购买衣物。",
  "输出三套完整搭配：A日常高频、B形象提升、C年轻清爽。包含上衣、裤子、鞋子、配饰与可落地发型。",
  "尊重预算，适度参考已有衣物；未做商品实时搜索，绝不编造品牌价格、链接、库存。",
  "若照片不完整或难以判断，明确承认局限。不能声称进行了虚拟试穿或精确量体。",
  "只返回一个 JSON 对象，不得使用 Markdown 代码块。结构：",
  '{"analysis":{"summary":"...", "observations":["..."], "limits":"..."},',
  '"looks":[{"name":"A · 日常最优款","style":"...","description":"...","colors":["..."],',
  '"outfit":{"top":"...","bottom":"...","shoes":"...","accessories":"...","hair":"..."},',
  '"why":"...","shoppingTips":["..."],"caution":"..."},',
  '{"name":"B · 形象提升款", "...":"字段同上"},',
  '{"name":"C · 清爽年轻款", "...":"字段同上"}],',
  '"disclaimer":"照片评估与穿着体验的局限说明"}'
].join("\n");
async function callAi(body) {
  if (!process.env.OPENAI_API_KEY) throw inputError("未配置 OPENAI_API_KEY。可继续使用本地规则方案。", 503);
  const photos = body?.photos;
  if (!photos || typeof photos !== "object" || Array.isArray(photos)) throw inputError("请上传照片");
  const selected = [photos.full, photos.face].filter(Boolean);
  if (selected.length === 0) throw inputError("请至少上传一张人像照片");
  if (selected.some(v => typeof v !== "string" || v.length > 6_000_000 ||
      !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v))) {
    throw inputError("仅支持压缩后的 JPG/PNG/WebP 图片，每张不超过规定大小");
  }
  const p = normalizeProfile(body.profile);
  const content = [{ type: "input_text", text: "请结合以下信息和所附照片制定建议。\n" + JSON.stringify(p) +
    "\n照片顺序：先全身照，后面部照（如果提供）。请不要推断照片未显示的属性。" }];
  if (photos.full) content.push({ type: "input_image", image_url: photos.full, detail: "low" });
  if (photos.face) content.push({ type: "input_image", image_url: photos.face, detail: "low" });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", signal: controller.signal,
      headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions: systemRules,
        input: [{ role: "user", content }],
        text: { format: { type: "json_object" } },
        max_output_tokens: 2600,
        store: false
      })
    });
    if (!upstream.ok) {
      if (upstream.status === 401) throw inputError("API Key 无效，请检查本机 .env。", 502);
      if (upstream.status === 429) throw inputError("模型请求受限或额度不足，请稍后重试。", 429);
      throw inputError("AI 服务暂时不可用（HTTP " + upstream.status + "）。", 502);
    }
    const response = await upstream.json();
    const output = (response.output || []).flatMap(m => m.content || []).filter(c => c.type === "output_text").map(c => c.text).join("");
    if (!output) throw inputError("AI 没有返回有效内容，请重试。", 502);
    let parsed;
    try { parsed = JSON.parse(output); }
    catch { throw inputError("AI 返回格式不正确，请重试。", 502); }
    try { return normalizeAiPlan(parsed); }
    catch (e) { throw inputError(e.message, 502); }
  } finally { clearTimeout(timer); }
}
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url || "/", "http://localhost").pathname;
    if (req.method === "GET" && path === "/api/status") {
      return send(res, 200, { aiEnabled: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL || "gpt-4.1-mini" });
    }
    if (req.method === "POST" && path === "/api/analyze") {
      const origin = req.headers.origin;
      if (origin && !["http://127.0.0.1:" + port, "http://localhost:" + port].includes(origin)) {
        throw inputError("跨站请求已拒绝", 403);
      }
      if (!String(req.headers["content-type"] || "").startsWith("application/json")) throw inputError("仅接收 JSON");
      const body = await readJson(req);
      const result = await callAi(body);
      return send(res, 200, result);
    }
    if (req.method === "GET" && staticFiles.has(path)) {
      const [file, type] = staticFiles.get(path);
      const bytes = await readFile(join(root, file));
      return send(res, 200, bytes, type);
    }
    return send(res, 404, { error: "未找到资源" });
  } catch (error) {
    const status = error.status || 500;
    const message = error.name === "AbortError" ? "AI 请求超时，请重试" :
      status === 500 ? "服务器发生错误，请检查终端输出" : error.message;
    if (status === 500) console.error("Server error:", error);
    return send(res, status, { error: message });
  }
});
server.listen(port, host, () => console.log("PersonalStyling 已启动：http://" + host + ":" + port));
