# Wedding Web

一个静态婚礼影像展示网站，用 HTML、CSS 和原生 JavaScript 搭建。页面用于集中展示婚纱照、婚礼现场照片、婚礼视频和两个人从相遇到婚礼的故事时间线，适合部署到 Netlify、GitHub Pages 或任意静态站点服务。
线上地址：https://purebluefrank-wedding-web.netlify.app/
## 主要功能

- 沉浸式首屏：使用多张精选照片组成自动轮播背景，叠加婚礼日期、标题文案和快捷入口。
- 精选婚纱照画廊：以响应式网格展示照片，重点照片占据更大版位，适配桌面端和移动端。
- 照片灯箱预览：点击照片可打开大图预览，支持点击遮罩、关闭按钮或 `Esc` 退出。
- 婚礼现场照片长卷：宴会现场照片以无缝横向滚动方式展示，鼠标悬停时暂停滚动。
- 婚礼视频播放：内置 MP4 视频播放器，使用首屏照片作为海报图。
- 故事时间线：按时间顺序记录相遇、旅行、订婚、婚礼和婚后旅行等重要节点。
- 背景音乐开关：使用 Web Audio API 生成柔和和弦背景音，无需额外音频文件；播放视频时会自动降低背景音量。
- 响应式布局：针对手机、平板和桌面屏幕做了专门的排版与图片比例适配。
- 静态部署友好：无构建步骤、无框架依赖，`netlify.toml` 已配置静态发布目录和媒体缓存策略。

## 项目结构

```text
.
├── index.html              # 页面结构和内容
├── styles.css              # 页面视觉、动画和响应式样式
├── script.js               # 灯箱、背景音乐和视频音量联动
├── netlify.toml            # Netlify 静态站点配置
├── generate_media.py       # 早期占位图生成脚本
└── media/
    ├── selected/           # 首屏和婚纱精选照片
    ├── banquet/            # 婚礼现场照片
    ├── timeline/           # 故事时间线照片
    └── wechat-wedding.mp4  # 婚礼视频
```

## 本地预览

项目是纯静态页面，可以直接打开 `index.html`。为了获得更接近线上环境的资源加载行为，推荐启动一个本地静态服务器：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## 内容维护

主要页面内容集中在 `index.html` 中：

- 修改新人名称、日期和首屏文案：编辑 `<section class="hero">`。
- 修改导航：编辑 `<header class="site-header">` 中的链接。
- 替换婚纱照：更新 `media/selected/` 下的图片，并同步修改照片卡片的 `src`、`data-src`、`data-caption` 和 `alt`。
- 替换婚礼现场照片：更新 `media/banquet/` 下的图片，并同步修改两个 `.banquet-sequence` 列表，第二组用于无缝滚动循环。
- 替换故事时间线：更新 `media/timeline/` 下的图片，并编辑 `<section id="story">` 中的时间、标题和描述。
- 替换视频：将新视频放入 `media/`，然后修改 `<video>` 内的 `<source src="...">`。

## 样式与交互

- 全站颜色、阴影和基础视觉变量定义在 `styles.css` 的 `:root` 中。
- 首屏轮播动画由 `@keyframes hero-scroll` 控制。
- 婚礼现场横向滚动由 `@keyframes banquet-scroll` 控制。
- 移动端适配主要位于 `@media (max-width: 820px)` 和 `@media (max-width: 520px)`。
- 照片灯箱逻辑在 `script.js` 顶部。
- 背景音乐由 `script.js` 中的 Web Audio API 代码实时合成。

## 部署

### Netlify

仓库已包含 `netlify.toml`：

```toml
[build]
  publish = "."
  command = ""
```

这表示 Netlify 会直接把仓库根目录作为静态站点发布，不需要安装依赖或运行构建命令。`/media/*` 已设置长期缓存，适合较大的照片和视频资源。

### 其他静态托管

也可以部署到 GitHub Pages、Cloudflare Pages、Vercel 静态站点或任意 Nginx/Apache 静态目录。只需要保证仓库根目录中的 `index.html`、`styles.css`、`script.js` 和 `media/` 一起发布即可。

## 技术栈

- HTML5
- CSS3
- 原生 JavaScript
- Web Audio API
- Netlify 静态部署配置
