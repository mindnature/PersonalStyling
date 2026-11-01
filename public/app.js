import { DEFAULT_PROFILE, buildLocalPlan, normalizeProfile, normalizeAiPlan } from "/engine.mjs";

const $ = id => document.getElementById(id);
const STORAGE_KEY = "personalstyling.profile.v1";
let photos = { full: null, face: null };
let lastPlan = null;
let activeProfile = null;
let aiEnabled = false;
let busy = false;

function make(tag, cls, value) {
  const element = document.createElement(tag);
  if (cls) element.className = cls;
  if (value !== undefined && value !== null) element.textContent = String(value);
  return element;
}
function append(parent, ...children) { for (const child of children) parent.append(child); return parent; }
function message(text, success = false) {
  $("message").textContent = text;
  $("message").className = "message" + (success ? " success" : "");
  $("message").hidden = !text;
}
function getFormProfile() {
  const form = new FormData($("profileForm"));
  return normalizeProfile(Object.fromEntries(form.entries()));
}
function savePreferences() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormProfile())); }
  catch { /* Private browsing may disable storage; app remains usable. */ }
}
function setProfile(profile) {
  const p = normalizeProfile(profile);
  for (const key of ["name", "height", "weight", "size", "scene", "season", "budget", "hair", "wardrobe", "notes", "youth"]) {
    $(key).value = p[key];
  }
  const radio = document.querySelector('input[name="style"][value="' + p.style + '"]');
  if (radio) radio.checked = true;
  updateBalance();
}
function updateBalance() {
  const youth = Number($("youth").value);
  $("balanceText").textContent = "成熟 " + (100 - youth) + "% / 少年 " + youth + "%";
}
function setBusy(value) {
  busy = value;
  $("offlineBtn").disabled = value;
  $("aiBtn").disabled = value || !aiEnabled;
  $("offlineBtn").firstChild.textContent = value ? "正在生成方案… " : "生成本地穿搭建议 ";
  $("aiBtn").firstChild.textContent = value ? "正在分析图片… " : "AI 看图分析 ";
}
async function refreshStatus() {
  try {
    const r = await fetch("/api/status");
    if (!r.ok) throw new Error("服务状态异常");
    const status = await r.json();
    aiEnabled = Boolean(status.aiEnabled);
    $("aiStatusText").textContent = aiEnabled ? "AI 看图功能已就绪" : "本地规则模式 · 免费";
    $("aiStatusHint").textContent = aiEnabled ? "模型：" + status.model + " · 按需调用" : "配置本机 API Key 后可启用 AI 分析";
  } catch {
    aiEnabled = false;
    $("aiStatusText").textContent = "本地规则模式";
    $("aiStatusHint").textContent = "无法检查 AI 状态，仍可生成离线建议";
  }
  $("aiBtn").disabled = !aiEnabled || busy;
}
async function preparePhoto(file) {
  if (!file) return null;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("请选择 JPG、PNG 或 WebP 图片");
  if (file.size > 10 * 1024 * 1024) throw new Error("单张照片需小于 10 MB");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("图片无法打开"));
      image.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("图片尺寸无效");
    const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("浏览器不支持图片处理");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", .79);
    if (data.length > 6_000_000) throw new Error("压缩后的图片仍过大，请重新选择");
    return data;
  } finally { URL.revokeObjectURL(url); }
}
function refreshPhoto(kind) {
  const key = kind === "full" ? "full" : "face";
  const img = $(key + "Preview");
  const placeholder = $(key + "Placeholder");
  const zone = $(key + "Zone");
  if (photos[key]) {
    img.src = photos[key];
    img.hidden = false;
    placeholder.hidden = true;
    zone.setAttribute("title", "点击更换照片");
  } else {
    img.removeAttribute("src");
    img.hidden = true;
    placeholder.hidden = false;
    zone.removeAttribute("title");
  }
}
async function onPhoto(kind, file) {
  try {
    photos[kind] = await preparePhoto(file);
    refreshPhoto(kind);
    message("");
  } catch (e) {
    photos[kind] = null;
    refreshPhoto(kind);
    message(e.message);
  }
}
const colorMap = {
  "藏蓝": "#203d57", "米白": "#f1e7d2", "深灰": "#515a5b", "炭灰": "#444b4d",
  "白色": "#ffffff", "黑色": "#282b30", "奶白": "#f8f0de",
  "浅蓝": "#b4d4e9", "牛仔蓝": "#4b7caa", "灰色": "#888c8c", "卡其": "#b5a07b"
};
function showAnalysis(plan) {
  $("analysisSummary").textContent = plan.analysis.summary;
  const list = $("analysisObservations");
  list.replaceChildren();
  for (const note of plan.analysis.observations) append(list, make("li", "", note));
  $("analysisLimits").textContent = "重要说明：" + (plan.analysis.limits || "照片评估具有不确定性。");
}
function lookCard(look, index) {
  const card = make("article", "look-card");
  const cover = make("div", "look-cover");
  append(cover, make("span", "look-number", ["A", "B", "C"][index]), make("small", "", "PERSONAL STYLING / 0" + (index + 1)));
  const body = make("div", "look-body");
  append(body, make("h3", "", look.name), make("p", "look-style", look.style), make("p", "look-description", look.description));
  const palette = make("div", "palette");
  for (const name of look.colors) {
    const swatch = make("span", "palette-swatch");
    swatch.style.backgroundColor = colorMap[name] || "#b8c5bc";
    swatch.title = name;
    append(palette, swatch);
  }
  append(palette, make("span", "palette-label", look.colors.join(" · ")));
  append(body, palette);
  const dl = make("dl", "outfit-details");
  const sections = [["上装", "top"], ["裤装", "bottom"], ["鞋履", "shoes"], ["配饰", "accessories"], ["发型", "hair"]];
  for (const [label, key] of sections) {
    append(dl, append(make("div", "outfit-row"), make("dt", "", label), make("dd", "", look.outfit[key] || "暂无建议")));
  }
  append(body, dl);
  const extra = make("div", "look-extra");
  append(extra, make("h4", "", "为什么推荐"), make("p", "", look.why));
  if (look.shoppingTips.length) {
    append(extra, make("h4", "", "选购与试穿提示"));
    const ul = make("ul");
    for (const tip of look.shoppingTips) append(ul, make("li", "", tip));
    append(extra, ul);
  }
  append(extra, make("p", "look-warning", look.caution));
  append(body, extra);
  append(card, cover, body);
  return card;
}
function renderPlan(plan) {
  lastPlan = plan;
  $("resultsEmpty").hidden = true;
  $("resultContent").hidden = false;
  $("resultSource").textContent = plan.source === "ai" ? "AI 照片辅助分析" : "离线规则推荐 · 不识别照片";
  showAnalysis(plan);
  const grid = $("lookGrid");
  grid.replaceChildren();
  plan.looks.forEach((look, index) => append(grid, lookCard(look, index)));
  $("resultDisclaimer").textContent = plan.disclaimer;
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
}
function formatMarkdown(plan, profile) {
  const lines = [
    "# PersonalStyling · 私人穿搭方案", "",
    "生成方式：" + (plan.source === "ai" ? "AI 照片辅助分析" : "离线规则推荐（未分析照片）"),
    "主导风格：" + profile.style,
    "场景：" + profile.scene + " | 季节：" + profile.season + " | 预算：" + profile.budget,
    "", "## 形象摘要", plan.analysis.summary, "",
    ...plan.analysis.observations.map(x => "- " + x),
    "", "> 注意：" + plan.analysis.limits, ""
  ];
  for (const look of plan.looks) {
    lines.push("## " + look.name, "", look.description, "",
      "- 上装：" + look.outfit.top,
      "- 裤装：" + look.outfit.bottom,
      "- 鞋履：" + look.outfit.shoes,
      "- 配饰：" + look.outfit.accessories,
      "- 发型：" + look.outfit.hair,
      "- 配色：" + look.colors.join(" / "),
      "", "推荐理由：" + look.why,
      "", "选购提示：", ...look.shoppingTips.map(x => "- " + x),
      "", "注意：" + look.caution, "");
  }
  lines.push("---", plan.disclaimer);
  return lines.join("\n");
}
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function clearAll() {
  const approved = window.confirm("清除本地文字偏好和当前页面照片？此操作无法恢复。");
  if (!approved) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  $("profileForm").reset();
  setProfile(DEFAULT_PROFILE);
  photos = { full: null, face: null };
  $("fullPhoto").value = "";
  $("facePhoto").value = "";
  refreshPhoto("full");
  refreshPhoto("face");
  lastPlan = null;
  activeProfile = null;
  $("resultContent").hidden = true;
  $("resultsEmpty").hidden = false;
  message("已清除本地偏好和当前页面的照片。", true);
}
async function runLocal() {
  if (busy) return;
  setBusy(true);
  try {
    activeProfile = getFormProfile();
    savePreferences();
    renderPlan(buildLocalPlan(activeProfile));
    message("已生成三套离线规则方案。注意：本次未分析照片。", true);
  } catch (e) { message("生成失败：" + e.message); }
  finally { setBusy(false); }
}
async function runAI() {
  if (busy) return;
  if (!aiEnabled) return message("请在本机 .env 配置 API Key，并重启服务后再使用。");
  if (!photos.full && !photos.face) return message("AI 看图分析需要至少上传一张全身照或正脸照。");
  setBusy(true);
  message("正在使用已配置的 AI 服务分析照片。图片将离开本机，结果仅在当前页面展示。", true);
  try {
    activeProfile = getFormProfile();
    savePreferences();
    const response = await fetch("/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: activeProfile, photos })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "服务暂时不可用");
    renderPlan(normalizeAiPlan(data));
    message("已生成 AI 照片辅助穿搭方案；图片分析不等于真实量体与虚拟试穿。", true);
  } catch (e) { message("AI 分析失败：" + e.message + "。你仍可使用离线规则推荐。"); }
  finally { setBusy(false); }
}
function init() {
  let previous = DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) previous = JSON.parse(raw);
  } catch {}
  setProfile(previous);
  $("profileForm").addEventListener("input", () => { updateBalance(); savePreferences(); });
  $("profileForm").addEventListener("change", savePreferences);
  $("profileForm").addEventListener("submit", event => event.preventDefault());
  $("fullPhoto").addEventListener("change", event => onPhoto("full", event.target.files?.[0]));
  $("facePhoto").addEventListener("change", event => onPhoto("face", event.target.files?.[0]));
  $("offlineBtn").addEventListener("click", runLocal);
  $("aiBtn").addEventListener("click", runAI);
  $("exportMarkdown").addEventListener("click", () => {
    if (lastPlan && activeProfile) downloadFile(formatMarkdown(lastPlan, activeProfile), "personal-styling-plan.md", "text/markdown;charset=utf-8");
  });
  $("exportJson").addEventListener("click", () => {
    if (lastPlan && activeProfile) {
      downloadFile(JSON.stringify({ profile: activeProfile, plan: lastPlan }, null, 2), "personal-styling-plan.json", "application/json;charset=utf-8");
    }
  });
  $("clearBtn").addEventListener("click", clearAll);
  refreshStatus();
}
init();
