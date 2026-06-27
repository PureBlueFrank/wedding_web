# Wedding Media Page

这是一个静态婚礼影像展示页，直接打开 `index.html` 或运行本地静态服务器即可查看。

替换新人素材时，把文件放进 `media/` 并使用这些文件名：

- 主视觉：`hero-wedding.png`
- 照片：`photo-01.png` 到 `photo-08.png`
- 视频海报：`video-poster-01.png` 到 `video-poster-03.png`
- 视频文件：`highlight.mp4`、`ceremony.mp4`、`party.mp4`

如果视频文件名不同，请在 `index.html` 的 `<video>` 区域修改对应 `<source src="...">`。

本地预览：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000`。
