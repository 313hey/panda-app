Panda Mission | GitHub Pages 版本

如何部署：
1) 把整个文件夹里的所有文件上传到 GitHub 仓库根目录（/(root)）
2) Settings -> Pages -> Deploy from a branch -> main + /(root)
3) 访问：https://<你的用户名>.github.io/<仓库名>/

管理员：
- 默认管理员账号：admin
- 默认管理员密码：ChangeMe-2025!
- 强烈建议你在 config.js 里修改 ADMIN_PASSWORD_SHA256（先在浏览器 Console 运行：await PandaApp.sha256("你的新密码")）
注意：GitHub Pages 是静态站，无法真正隐藏密码。要真正安全的管理员后台需要后端或第三方鉴权。