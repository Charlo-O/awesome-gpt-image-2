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

const categoryRules = [
  {
    key: "ui",
    label: "UI与界面",
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
    ],
  },
  {
    key: "infographic",
    label: "图表与信息可视化",
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
    ],
  },
  {
    key: "poster",
    label: "海报与排版",
    tokens: ["海报", "排版", "封面", "字体", "Campaign", "宣传", "长卷"],
  },
  {
    key: "commerce",
    label: "商品与品牌",
    tokens: [
      "商品",
      "电商",
      "产品",
      "品牌",
      "包装",
      "Logo",
      "香水",
      "口红",
      "饮料",
      "零食",
      "卡牌",
    ],
  },
  {
    key: "space",
    label: "建筑与空间",
    tokens: ["建筑", "空间", "城市", "咖啡馆", "室内", "街头", "场景"],
  },
  {
    key: "photo",
    label: "摄影与写实",
    tokens: ["摄影", "写实", "写真", "照片", "人像", "电影感"],
  },
  {
    key: "illustration",
    label: "插画与艺术",
    tokens: ["插画", "艺术", "漫画", "水彩", "手绘", "刺绣", "水墨"],
  },
  {
    key: "character",
    label: "人物与角色",
    tokens: ["人物", "角色", "美女", "少女", "科学家", "圣斗士", "霸王"],
  },
  {
    key: "document",
    label: "文档与出版物",
    tokens: ["文档", "出版", "试卷", "报告", "书", "档案"],
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

function categorize(title, prompt) {
  const haystack = `${title} ${prompt.slice(0, 360)}`;
  const matched = categoryRules.find((rule) =>
    rule.tokens.some((token) => matchesToken(haystack, token))
  );

  return matched || {
    key: "other",
    label: "其他应用场景",
  };
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
  const category = categorize(title, prompt);
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
    categoryKey: category.key,
    categoryLabel: category.label,
    featured: featuredIds.has(id),
    part: fileInfo.range,
    docsPath: `docs/${fileInfo.file}#case-${id}`,
    searchText: stripMarkdown(`${id} ${title} ${source.label} ${source.channel} ${prompt}`),
  };
}

const parsedCases = galleryFiles.flatMap(parseCasesFromFile).sort((a, b) => a.id - b.id);
const cases = includeImageOnlyCases(parsedCases).sort((a, b) => a.id - b.id);
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
      const category = categorize(title, prompt);

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
        categoryKey: category.key,
        categoryLabel: category.label,
        featured: featuredIds.has(id),
        part: id <= 165 ? "Part 1" : "Part 2",
        docsPath: "docs/gallery.md",
        searchText: stripMarkdown(`${id} ${title} ${prompt}`),
      };
    });

  return [...items, ...supplemental];
}
