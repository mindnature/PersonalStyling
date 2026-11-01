/**
 * 离线穿搭引擎：只使用用户主动填写的数据，不会暗示已经“看懂”照片。
 * 此模块既能在浏览器导入，也可通过 node --test 直接测试。
 */
export const STYLES = ["成熟稳重", "清爽少年感", "知性书卷气", "都市高级感"];
export const SCENES = ["高校教学/科研会议", "日常通勤", "约会聚会", "旅行休闲"];
export const SEASONS = ["春夏", "秋冬"];
export const BUDGETS = ["500元以内", "500—1000元", "1000—2000元", "2000元以上"];
export const DEFAULT_PROFILE = {
  name: "", height: "", weight: "", size: "", style: STYLES[0],
  scene: SCENES[0], season: SEASONS[0], budget: BUDGETS[1],
  youth: 30, notes: "", hair: "", wardrobe: ""
};

function safeText(value, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function normalizeProfile(raw = {}) {
  const x = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const pick = (key, options, fallback) => options.includes(x[key]) ? x[key] : fallback;
  const n = Number(x.youth);
  const youth = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 30;
  return {
    name: safeText(x.name, 40),
    height: safeText(x.height, 12),
    weight: safeText(x.weight, 12),
    size: safeText(x.size, 40),
    style: pick("style", STYLES, DEFAULT_PROFILE.style),
    scene: pick("scene", SCENES, DEFAULT_PROFILE.scene),
    season: pick("season", SEASONS, DEFAULT_PROFILE.season),
    budget: pick("budget", BUDGETS, DEFAULT_PROFILE.budget),
    youth,
    notes: safeText(x.notes, 500),
    hair: safeText(x.hair, 180),
    wardrobe: safeText(x.wardrobe, 500)
  };
}

const item = (top, bottom, shoes, accessories, hair) =>
  ({ top, bottom, shoes, accessories, hair });

const recipes = {
  "成熟稳重": {
    spring: item("挺括牛津纺衬衫或轻薄针织 Polo，白色/浅蓝", "深灰或藏蓝直筒休闲西裤", "简洁德比鞋或低调皮质休闲鞋", "细皮带、简洁腕表", "自然侧分或轻纹理短发，露出部分额头"),
    winter: item("藏蓝短款外套＋浅色衬衫/细针织", "炭灰直筒毛呢感长裤", "素面皮鞋或简约短靴", "深色皮带、低调腕表", "干净侧分短发，侧区不过度铲青")
  },
  "清爽少年感": {
    spring: item("奶白色短袖或浅蓝宽松适度的衬衫", "中蓝直筒牛仔裤或浅灰休闲裤", "低帮简约帆布鞋或白色运动休闲鞋", "轻薄帆布包、低存在感手表", "自然纹理短发，轻薄刘海不过眉"),
    winter: item("米白针织衫＋短款休闲夹克", "深蓝直筒牛仔裤", "简约复古跑鞋或干净板鞋", "帆布单肩包、针织围巾可选", "蓬松但好打理的短层次发")
  },
  "知性书卷气": {
    spring: item("浅蓝衬衫＋轻薄针织开衫", "灰色单褶或无褶直筒长裤", "乐福鞋或简约皮鞋", "细框眼镜（如有需要）、皮质手表", "柔和侧分短发，保留自然发流"),
    winter: item("深棕/海军蓝针织开衫＋浅色衬衫", "深灰羊毛混纺直筒裤", "深棕乐福鞋或系带皮鞋", "皮质斜挎公文包、克制的眼镜框", "自然侧分，不用刻板油头")
  },
  "都市高级感": {
    spring: item("质感纯色 T 恤＋短款结构感衬衫外套", "炭灰或黑色自然直筒裤", "轻量德训鞋或低调皮鞋", "极简腕表、结构感小包", "干净微纹理短发，耳侧利落"),
    winter: item("深灰立领或翻领短外套＋简洁针织打底", "黑灰直筒长裤", "黑色简约短靴", "简洁金属表、低调皮带", "利落短发，避免过量定型产品")
  }
};

function makeLook(name, style, season, scene, youth, variant) {
  const base = recipes[style][season === "春夏" ? "spring" : "winter"];
  const outfit = { ...base };
  if (variant === 1) {
    outfit.top = scene === SCENES[0]
      ? "合身但不紧绷的深蓝休闲西装/薄外套＋纯色内搭"
      : "结构感短外套＋有质感的纯色打底";
    outfit.bottom = "深灰自然直筒长裤，注意腰线与裤脚长度";
    outfit.shoes = "简约皮鞋或深色乐福鞋";
  }
  if (variant === 2) {
    outfit.top = season === "春夏"
      ? "米白短袖＋浅蓝轻薄衬衫（可敞穿）"
      : "奶油白针织＋深蓝短夹克";
    outfit.bottom = "中蓝直筒牛仔裤，裤脚不堆积";
    outfit.shoes = "干净低帮休闲鞋";
    outfit.hair = "自然蓬松的短层次发型，具体长度需依据发质判断";
  }
  const palettes = variant === 0
    ? ["藏蓝", "米白", "深灰"]
    : variant === 1 ? ["炭灰", "白色", "黑色"] : ["奶白", "浅蓝", "牛仔蓝"];
  return {
    name, style,
    description: variant === 0 ? "以舒适和高频穿着为先，尽量不需要特殊打理。"
      : variant === 1 ? "强化轮廓与利落感，适合需要更正式形象的场景。"
      : "少量融入日韩简约配色与层次，但保留国内日常穿着的自然感。",
    colors: palettes, outfit,
    why: "依据所选的" + scene + "场景、" + season + "季节和" + youth + "%少年感偏好做的规则化推荐；尚未根据照片判断具体体型。",
    shoppingTips: [
      "预算：" + "按整套" + "购买优先级分配；先补缺少且高频穿的单品。",
      "试穿时核对肩线、衣长、腰围、臀围和裤脚长度；图片不能代替实际尺码。"
    ],
    caution: "版型与发型需结合本人照片、真实尺码及试穿再校准。"
  };
}

export function buildLocalPlan(raw) {
  const p = normalizeProfile(raw);
  return {
    source: "offline",
    analysis: {
      summary: "已依据你填写的风格、场景与预算生成初步穿搭方案。离线模式不识别照片，也不会推断面部特征或身材比例。",
      observations: [
        "默认审美：中国大陆主流男性审美为主，适度融合日韩简约风。",
        "主风格：" + p.style + "；成熟感 " + (100 - p.youth) + "%，少年感 " + p.youth + "%。",
        "使用场景：" + p.scene + "；季节：" + p.season + "；整套预算：" + p.budget + "。",
        p.wardrobe ? "已有衣物：" + p.wardrobe : "尚未录入已有衣物；建议优先考虑旧衣复用。",
        p.notes ? "额外需求：" + p.notes : "尚未提供需要避开的款式或特殊需求。"
      ],
      limits: "离线建议不是照片分析，不能识别脸型、肤色、发际线或精确尺码。请配置 API Key 并主动选择 AI 看图分析，以获得照片辅助判断。"
    },
    looks: [
      makeLook("A · 日常最优款", p.style, p.season, p.scene, p.youth, 0),
      makeLook("B · 形象提升款", p.style, p.season, p.scene, p.youth, 1),
      makeLook("C · 清爽年轻款", "清爽少年感", p.season, p.scene, p.youth, 2)
    ],
    disclaimer: "建议仅供穿搭参考；照片存在光照、拍摄角度和镜头畸变。商品价格、库存和尺码须以实际商家为准。"
  };
}

function text(value, max = 500) {
  return typeof value === "string" ? value.slice(0, max).trim() : "";
}

/** 不信任模型返回的对象：只保留固定字段，限制数组长度。 */
export function normalizeAiPlan(data) {
  if (!data || typeof data !== "object" || !Array.isArray(data.looks) || data.looks.length === 0) {
    throw new Error("AI 未返回有效的三套搭配方案");
  }
  const a = data.analysis || {};
  const result = {
    source: "ai",
    analysis: {
      summary: text(a.summary, 600),
      observations: (Array.isArray(a.observations) ? a.observations : []).slice(0, 8).map(v => text(v, 240)).filter(Boolean),
      limits: text(a.limits, 600)
    },
    looks: data.looks.slice(0, 3).map((l, i) => {
      const outfit = l && l.outfit && typeof l.outfit === "object" ? l.outfit : {};
      return {
        name: text(l?.name, 60) || ["A · 日常最优款", "B · 形象提升款", "C · 清爽年轻款"][i],
        style: text(l?.style, 60),
        description: text(l?.description, 400),
        colors: (Array.isArray(l?.colors) ? l.colors : []).slice(0, 5).map(v => text(v, 30)).filter(Boolean),
        outfit: {
          top: text(outfit.top, 200), bottom: text(outfit.bottom, 200),
          shoes: text(outfit.shoes, 200), accessories: text(outfit.accessories, 200),
          hair: text(outfit.hair, 200)
        },
        why: text(l?.why, 500),
        shoppingTips: (Array.isArray(l?.shoppingTips) ? l.shoppingTips : []).slice(0, 4).map(v => text(v, 260)).filter(Boolean),
        caution: text(l?.caution, 300)
      };
    }),
    disclaimer: text(data.disclaimer, 600) || "照片辅助判断存在局限，不等于准确测量、虚拟试穿或商品库存核验。"
  };
  if (result.looks.length !== 3 || result.looks.some(l => !l.outfit.top || !l.outfit.bottom || !l.outfit.shoes || !l.outfit.hair)) {
    throw new Error("AI 返回的搭配字段不完整，请重试");
  }
  return result;
}
