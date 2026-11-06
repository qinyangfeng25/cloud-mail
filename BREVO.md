# Brevo 发信接入

- 在 Cloudflare Worker 中将 BREVO_API_KEY 配置为加密密钥，切勿提交到仓库。
- 在 Brevo 验证发件域名和发件地址，并确认事务邮件发信权限已启用。
- 保留既有 D1、KV、转发绑定和运行变量。
- 当前接入支持新邮件和普通附件；暂不支持保留会话线程的回复或正文内嵌图片。
- 在 mail-worker 目录执行 `node --test test/brevo.test.mjs` 运行模拟测试；真实发信仍需单独验证。
- Workers Builds 的构建命令需先安装 mail-vue 依赖并构建前端。
