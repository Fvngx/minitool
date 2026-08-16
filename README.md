# 留存工具箱（uni-app x）

业务逻辑用 TypeScript（`common/*.ts`，页面 `<script setup lang="ts">`）。页面文件仍是 uni-app x 的 `.uvue`。

## 先把 H5 跑起来（不用 HBuilderX）

```bash
npm install
# Linux 上若缺 UTS 原生包（npm 把 glibc 认成非 gnu）：
# npm i @dcloudio/uts-linux-x64-gnu@3.0.0-alpha-5020320260803001 -D --force
npm run dev:h5
```

浏览器打开 `http://localhost:5173/` 。

## 用 HBuilderX 打开

1. 安装最新 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 文件 → 打开目录，选本仓库
3. 确认 `manifest.json` 里有 `"uni-app-x": {}`（圆形 U 图标）
4. 运行到微信开发者工具 / 浏览器 / App 基座

微信小程序 AppId 在 `manifest.json` → `mp-weixin.appid` 自己填。

## 首页怎么分

- **热门引流**：字数统计、图片压缩（用完即走）
- **留存工具**：JSON 历史、尺寸方案、二维码模板、话术、文案模板、词表等
- **我的常用**：用户自己置顶
- **我的 Tab**：总历史 + 各工具模板入口

## 数据存在哪

全部 `uni.setStorageSync`，键名 `mt_` 前缀。不上服务器，不做 OCR / 去水印 / PDF 解密。

文案模板先本地套 `{{占位符}}`。混元接口预留在 `common/ai.uts`，默认不联网。

## 目录

```
common/     存储、工具目录、JSON/词表/二维码算法
pages/index 首页
pages/mine  我的模板与历史
pages/tools 各工具页
```
