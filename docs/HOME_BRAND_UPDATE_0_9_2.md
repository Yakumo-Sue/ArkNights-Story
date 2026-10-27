# 首页背景与品牌更新 · 0.9.2

本次仅修改现有 Vite + React 工程的首页视觉和全站导航品牌图片，保留上一版的开场、滚轮翻页及各页面功能。

## 15-15 决战群像与自适应

- 使用用户参考图对应的主线第十五章 15-15《拒绝哀悼》行动后原始 CG：`60_i11_2L` 与 `60_i11_2R`。
- 两幅原始 PNG 各 1024 × 384，逻辑顺序为 L → R，完整横向构图为 2048 × 384；剧情脚本中的 1920 / 720 是显示尺寸，不是下载图片分辨率。
- 仅转换为 WebP，未重绘、拉伸或改变角色内容。两幅图以独立本地资源保存，合计约 136 KiB。
- 宽屏连续横向排布，保留原始群像；600px 及以下窄屏使用两排全景视窗，每排显示完整横图的 60%，两排重叠 20%，同时保留两侧及中央人物，避免把中央人物从左右图接缝处分开。
- 深色渐变与边缘遮罩用于将 CG 融入全屏背景；标题布局随屏幕变化，图片始终保持原比例。
- 图片说明与首页出处链接统一从 `src/data/homeMedia.js` 读取。

来源：

- [PRTS 对应剧情页](https://prts.wiki/w/15-15_拒绝哀悼/END)，脚本 `largebg(imagegroup="60_i11_2L/60_i11_2R")`。
- [左幅原图](https://media.prts.wiki/7/77/Avg_bg_60_i11_2L.png)
- [右幅原图](https://media.prts.wiki/d/da/Avg_bg_60_i11_2R.png)

图片归《明日方舟》及鹰角网络所有。

## 标题与导航 Logo

- 首页中文标题改为“明日方舟”，对应英文改为“ARKNIGHTS”；开场中的罗德岛徽记与巴别塔碎裂转场保留。
- 导航左侧使用[明日方舟国服官网](https://ak.hypergryph.com/)原始透明 SVG，来源是首页链接 `/#index` 引用的 `svg_def-title_arknights` 路径，viewBox 为 `0 0 254 119`。
- SVG 已保存至 `public/assets/brand/arknights-official-logo.svg`，由 `ArknightsMark` 以图片元素加载，包含替代文本，并适配正常、手机及剧情播放器的紧凑导航。
- 相关样式在 `src/styles/home.css`、`src/styles/shell.css` 与 `src/styles/responsive.css`。

## 运行与检查

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

本次视觉修改无需新增依赖；检查首页标题、两幅背景与 Logo 是否正常加载、横竖屏是否溢出，并回归开场跳过与滚轮进入总览。
