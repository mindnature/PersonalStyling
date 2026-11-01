import test from "node:test";
import assert from "node:assert/strict";
import { buildLocalPlan, normalizeProfile, normalizeAiPlan, DEFAULT_PROFILE } from "../src/engine.mjs";

test("默认设置可以生成三套完整方案", () => {
  const plan = buildLocalPlan(DEFAULT_PROFILE);
  assert.equal(plan.source, "offline");
  assert.equal(plan.looks.length, 3);
  for (const look of plan.looks) {
    for (const key of ["top", "bottom", "shoes", "accessories", "hair"]) {
      assert.ok(look.outfit[key], key + " 不能为空");
    }
  }
});
test("非法选择和过大输入会被规范化", () => {
  const p = normalizeProfile({ style: "不存在", youth: 999, notes: "a".repeat(900) });
  assert.equal(p.style, DEFAULT_PROFILE.style);
  assert.equal(p.youth, 100);
  assert.equal(p.notes.length, 500);
});
test("场景、季节和预算会改变输出", () => {
  const a = buildLocalPlan({ scene: "高校教学/科研会议", season: "春夏", budget: "500元以内" });
  const b = buildLocalPlan({ scene: "旅行休闲", season: "秋冬", budget: "2000元以上" });
  assert.notEqual(a.looks[0].outfit.top, b.looks[0].outfit.top);
  assert.match(a.analysis.observations.join(" "), /500元以内/);
});
test("无效 AI 返回拒绝使用", () => {
  assert.throws(() => normalizeAiPlan({ looks: [] }));
  assert.throws(() => normalizeAiPlan({ looks: [{ name: "1" }] }));
});
test("离线模式不会宣称分析照片", () => {
  const plan = buildLocalPlan({});
  assert.match(plan.analysis.limits, /离线建议不是照片分析/);
});
