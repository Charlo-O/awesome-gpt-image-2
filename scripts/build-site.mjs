#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const docsDir = path.join(rootDir, "docs");
const outputPath = path.join(rootDir, "site-assets", "cases.js");

const galleryFiles = [
  { file: "gallery-part-1.md", range: "Part 1" },
  { file: "gallery-part-2.md", range: "Part 2" },
];

const featuredIds = new Set(extractFeaturedCaseIds());

const CATEGORY_SPECS = [
  {
    key: "ui",
    label: "UI与界面",
    target: 68,
    tokens: [
      "UI",
      "界面",
      "截图",
      "应用",
      "网页",
      "交互",
      "直播",
      "社媒",
      "朋友圈",
      "仪表盘",
      "Dashboard",
      "mobile",
      "app",
      "website",
    ],
  },
  {
    key: "infographic",
    label: "图表与信息可视化",
    target: 54,
    tokens: [
      "信息图",
      "可视化",
      "图表",
      "科普",
      "百科",
      "地图",
      "报告",
      "学习表",
      "数据",
      "分解图",
      "技术详解",
      "diagram",
      "infographic",
      "chart",
    ],
  },
  {
    key: "poster",
    label: "海报与排版",
    target: 71,
    tokens: ["海报", "排版", "封面", "字体", "Campaign", "宣传", "长卷"],
  },
  {
    key: "ecommerce",
    label: "商品与电商",
    target: 22,
    tokens: [
      "商品",
      "电商",
      "产品",
      "包装",
      "香水",
      "口红",
      "饮料",
      "零食",
      "淘宝",
      "product",
      "packaging",
    ],
  },
  {
    key: "brand",
    label: "品牌与标志",
    target: 19,
    tokens: [
      "品牌",
      "标志",
      "Logo",
      "身份",
      "视觉板",
      "Campaign",
      "brand",
      "identity",
    ],
  },
  {
    key: "architecture",
    label: "建筑与空间",
    target: 25,
    tokens: ["建筑", "空间", "城市", "咖啡馆", "室内", "街头", "场景"],
  },
  {
    key: "photo",
    label: "摄影与写实",
    target: 31,
    tokens: ["摄影", "写实", "写真", "照片", "人像", "电影感", "photo", "portrait"],
  },
  {
    key: "illustration",
    label: "插画与艺术",
    target: 24,
    tokens: ["插画", "艺术", "漫画", "水彩", "手绘", "刺绣", "illustration", "anime"],
  },
  {
    key: "character",
    label: "人物与角色",
    target: 12,
    tokens: ["人物", "角色", "设定", "美女", "少女", "科学家", "圣斗士", "character"],
  },
  {
    key: "scene",
    label: "场景与叙事",
    target: 7,
    tokens: ["场景", "叙事", "电影感", "故事", "story", "narrative"],
  },
  {
    key: "history",
    label: "历史与古风题材",
    target: 8,
    tokens: ["历史", "古风", "国风", "大唐", "玄武门", "赤壁", "西楚", "诗词"],
  },
  {
    key: "document",
    label: "文档与出版物",
    target: 7,
    tokens: ["文档", "出版", "试卷", "报告", "书", "档案", "document", "paper"],
  },
  {
    key: "other",
    label: "其他应用场景",
    target: 19,
    tokens: [],
  },
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r/g, "");
}

function stripMarkdown(value) {
  return String(value || "")
    .replace(/\\_/g, "_")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImagePath(value) {
  return String(value || "").replace(/^\.\.\//, "");
}

function sourceFromMarkdown(value) {
  const raw = String(value || "").trim();
  const link = raw.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);

  if (link) {
    return {
      label: stripMarkdown(link[1]),
      url: link[2],
      channel: channelFromSource(`${link[1]} ${link[2]}`),
    };
  }

  const label = stripMarkdown(raw) || "未提供";
  return {
    label,
    url: null,
    channel: channelFromSource(label),
  };
}

function channelFromSource(value) {
  if (/x\.com|twitter|@/i.test(value)) {
    return "X 社区";
  }

  if (/小红书|xiaohongshu/i.test(value)) {
    return "小红书";
  }

  if (/未提供|unknown/i.test(value)) {
    return "未提供";
  }

  return "社区";
}

function matchesToken(value, token) {
  if (/^[a-z0-9]+$/i.test(token)) {
    return new RegExp(`(^|[^a-z0-9])${token}([^a-z0-9]|$)`, "i").test(value);
  }

  return value.toLowerCase().includes(token.toLowerCase());
}

function summarizePrompt(prompt) {
  return stripMarkdown(prompt)
    .replace(/\s+/g, " ")
    .slice(0, 180);
}

function extractFeaturedCaseIds() {
  const galleryPath = path.join(docsDir, "gallery.md");

  if (!fs.existsSync(galleryPath)) {
    return [];
  }

  return [...readText(galleryPath).matchAll(/例\s*(\d+)：/g)].map((match) =>
    Number(match[1])
  );
}

function parseCasesFromFile(fileInfo) {
  const filePath = path.join(docsDir, fileInfo.file);
  const content = readText(filePath);
  const blocks = content.split(/(?=<a name="case-\d+"><\/a>)/g);

  return blocks
    .map((block) => parseCaseBlock(block, fileInfo))
    .filter(Boolean);
}

function parseCaseBlock(block, fileInfo) {
  const anchorMatch = block.match(/<a name="case-(\d+)"><\/a>/);
  const headingMatch = block.match(/###\s*例\s*(\d+)：(.+)/);
  const imageMatch = block.match(/!\[([\s\S]*?)\]\(([^)]+)\)/);
  const sourceMatch = block.match(/\*\*来源：\*\*\s*([^\n]+)/);
  const promptMatch = block.match(/\*\*提示词：\*\*[\s\S]*?```(?:text|json)?\n([\s\S]*?)```/);

  if (!anchorMatch || !headingMatch || !imageMatch || !promptMatch) {
    return null;
  }

  const id = Number(anchorMatch[1]);
  const title = stripMarkdown(headingMatch[2]);
  const prompt = promptMatch[1].trim();
  const source = sourceFromMarkdown(sourceMatch?.[1] || "未提供");

  return {
    id,
    slug: `case-${id}`,
    title,
    imageAlt: stripMarkdown(imageMatch[1]) || title,
    image: normalizeImagePath(imageMatch[2]),
    source,
    prompt,
    summary: summarizePrompt(prompt),
    featured: featuredIds.has(id),
    part: fileInfo.range,
    docsPath: `docs/${fileInfo.file}#case-${id}`,
    searchText: stripMarkdown(`${id} ${title} ${source.label} ${source.channel} ${prompt}`),
  };
}

const parsedCases = galleryFiles.flatMap(parseCasesFromFile).sort((a, b) => a.id - b.id);
const cases = assignCategories(includeImageOnlyCases(parsedCases)).sort((a, b) => a.id - b.id);
const categoryCounts = cases.reduce((acc, item) => {
  acc[item.categoryKey] = (acc[item.categoryKey] || 0) + 1;
  return acc;
}, {});
const channelCounts = cases.reduce((acc, item) => {
  acc[item.source.channel] = (acc[item.source.channel] || 0) + 1;
  return acc;
}, {});

const meta = {
  generatedAt: new Date().toISOString(),
  totalCases: cases.length,
  totalFeatured: cases.filter((item) => item.featured).length,
  totalCategories: Object.keys(categoryCounts).length,
  categoryCounts,
  channelCounts,
};

const output = `window.GPT_IMAGE_META = ${JSON.stringify(meta, null, 2)};\nwindow.GPT_IMAGE_CASES = ${JSON.stringify(
  cases,
  null,
  2
)};\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, "utf8");
console.log(`Built ${cases.length} cases -> ${path.relative(rootDir, outputPath)}`);

function includeImageOnlyCases(items) {
  const byId = new Set(items.map((item) => item.id));
  const imageDir = path.join(rootDir, "data", "images");

  if (!fs.existsSync(imageDir)) {
    return items;
  }

  const supplemental = fs
    .readdirSync(imageDir)
    .map((file) => {
      const match = file.match(/^case(\d+)\.(?:jpe?g|png|webp|gif)$/i);
      return match ? { id: Number(match[1]), file } : null;
    })
    .filter((item) => item && !byId.has(item.id))
    .map(({ id, file }) => {
      const title = "图像生成案例图";
      const prompt = "当前 Markdown 画廊中没有对应提示词正文，已根据本地图片资源补入索引。";

      return {
        id,
        slug: `case-${id}`,
        title,
        imageAlt: `例 ${id}：${title}`,
        image: `data/images/${file}`,
        source: {
          label: "未提供",
          url: null,
          channel: "未提供",
        },
        prompt,
        summary: prompt,
        featured: featuredIds.has(id),
        part: id <= 165 ? "Part 1" : "Part 2",
        docsPath: "docs/gallery.md",
        searchText: stripMarkdown(`${id} ${title} ${prompt}`),
      };
    });

  return [...items, ...supplemental];
}

function assignCategories(items) {
  const remaining = new Map(CATEGORY_SPECS.map((item) => [item.key, item.target]));
  const assignments = new Map();
  const ranked = [];

  for (const item of items) {
    for (const category of CATEGORY_SPECS) {
      if (category.key === "other") {
        continue;
      }

      const score = scoreCategory(item, category);

      if (score > 0) {
        ranked.push({ id: item.id, key: category.key, score });
      }
    }
  }

  ranked.sort((a, b) => b.score - a.score || a.id - b.id);

  for (const candidate of ranked) {
    if (assignments.has(candidate.id) || remaining.get(candidate.key) <= 0) {
      continue;
    }

    assignments.set(candidate.id, candidate.key);
    remaining.set(candidate.key, remaining.get(candidate.key) - 1);
  }

  for (const item of items) {
    if (assignments.has(item.id)) {
      continue;
    }

    const fallback = CATEGORY_SPECS.find((category) => remaining.get(category.key) > 0);
    const key = fallback?.key || "other";
    assignments.set(item.id, key);
    remaining.set(key, remaining.get(key) - 1);
  }

  return items.map((item) => {
    const category = CATEGORY_SPECS.find((spec) => spec.key === assignments.get(item.id));

    return {
      ...item,
      categoryKey: category.key,
      categoryLabel: category.label,
      searchText: stripMarkdown(`${item.searchText} ${category.label}`),
    };
  });
}

function scoreCategory(item, category) {
  const titleText = `${item.title} ${item.imageAlt}`;
  const promptText = item.prompt.slice(0, 900);
  let score = 0;

  for (const token of category.tokens) {
    if (matchesToken(titleText, token)) {
      score += 8;
    }

    if (matchesToken(promptText, token)) {
      score += 2;
    }
  }

  return score;
}
