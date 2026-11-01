import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 30000 + Math.floor(Math.random() * 20000);
const origin = "http://127.0.0.1:" + port;
let child;
async function launch() {
  child = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1", OPENAI_API_KEY: "" },
    stdio: "ignore"
  });
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const r = await fetch(origin + "/api/status");
      if (r.ok) return;
    } catch {}
    if (child.exitCode !== null) throw new Error("服务提前退出");
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("服务启动超时");
}
test("无需密钥也可启动本地工作台、拒绝泄露配置与未授权 AI 调用", async () => {
  await launch();
  try {
    const status = await (await fetch(origin + "/api/status")).json();
    assert.equal(status.aiEnabled, false);
    const homepage = await fetch(origin + "/");
    assert.equal(homepage.status, 200);
    assert.match(await homepage.text(), /中国本土审美/);
    const engine = await fetch(origin + "/engine.mjs");
    assert.equal(engine.status, 200);
    const env = await fetch(origin + "/.env");
    assert.equal(env.status, 404);
    const bad = await fetch(origin + "/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json", "Origin": origin },
      body: JSON.stringify({ photos: { full: "x" }, profile: {} })
    });
    assert.equal(bad.status, 503);
    const crossSite = await fetch(origin + "/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json", "Origin": "https://other.example" },
      body: JSON.stringify({ photos: {}, profile: {} })
    });
    assert.equal(crossSite.status, 403);
  } finally {
    child.kill();
  }
});
