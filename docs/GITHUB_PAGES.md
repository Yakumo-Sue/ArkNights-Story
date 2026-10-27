# GitHub Pages 独立部署

本网站由 `Yakumo-Sue/ArkNights-Story` 仓库单独构建和发布。

- 网站入口：<https://yakumo-sue.github.io/ArkNights-Story/>
- 总览直达：<https://yakumo-sue.github.io/ArkNights-Story/#/overview>
- Pages 设置：<https://github.com/Yakumo-Sue/ArkNights-Story/settings/pages>
- 部署记录：<https://github.com/Yakumo-Sue/ArkNights-Story/actions/workflows/deploy-pages.yml>

## 发布方式

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
工作流 `.github/workflows/deploy-pages.yml` 在推送到 `main` 时自动运行，也可在 Actions 中通过 **Run workflow** 手动运行。

流程为：安装 Node.js 24 和 pnpm 11.25.0 → 根据锁文件安装依赖 → 运行测试 → 执行 `pnpm build:pages` → 上传 `dist` → 发布到 `github-pages` 环境。部署步骤只申请 Pages 和 OIDC 所需权限，无需添加个人令牌。

## 资源路径与路由

`pnpm build:pages` 使用 Vite 的 `github-pages` 模式，资源前缀为 `/ArkNights-Story/`。首页背景、官方 Logo 和故事封面均使用 `BASE_URL`，防止被误请求到用户站点根目录。

Pages 构建使用 `HashRouter`，例如 `/#/overview`、`/#/stories/main-00/play/0-1`。浏览器只向服务器请求仓库入口，刷新或直接分享子页面不会因缺少服务器重写而返回 404。普通 `pnpm dev` 和 `pnpm build` 保持原有 `BrowserRouter` 行为；普通构建部署到其他平台时仍需配置 SPA 回退。

构建目录固定为 `dist`。`docs` 保存开发文档、来源记录和原始界面截图，不能作为 Vite 的清空输出目录。

## 本地复核

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build:pages
pnpm preview
```

预览入口为 `http://localhost:4173/ArkNights-Story/`。检查首页背景及 Logo、总览故事封面、剧情播放器导航，并刷新总览页面确认仍能打开。

## 维护

后续更新提交到本仓库 `main` 分支即可自动重新部署。在 Actions 查看构建和发布步骤，在 Settings → Pages 查看最终网址和发布状态。站点内容仍为 README 所述的演示资料范围。

参考：[Vite 静态部署](https://vite.dev/guide/static-deploy.html#github-pages)、[GitHub Pages 发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
