# 成都时空穿越任务（GitHub Pages 版本）

## 怎么打开
把本目录全部文件上传到 GitHub 仓库根目录，然后在 Settings -> Pages 里开启即可。

## 管理员平台
- 入口：在网址后面加 `#admin`  
  例如：`https://<你的用户名>.github.io/<仓库名>/#admin`
- 默认账号：admin
- 默认密码：Panda-2026!

> 注意：GitHub Pages 是静态站，管理员密码无法做到真正“隐藏”。本版本提供的是“基础保护”（不在界面公开入口 + 登录校验 + hash 存储）。
> 如果你要真正安全的管理员后台/跨设备查看所有学生数据，需要接 Firebase / Supabase 或者用 Cloudflare Access 之类的鉴权。

## 数据说明
当前版本把“用户账号/进度”存到浏览器 localStorage。
- 同一台电脑/同一浏览器：会记住学生账号和进度
- 不同设备/不同浏览器：数据不会互通
