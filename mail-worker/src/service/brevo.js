// Brevo's transactional API does not expose a documented Content-ID attachment field.
export async function sendBrevo(apiKey, params, toBase64, fetcher = fetch) {
  if (params.attachments.some(item => item.contentId)) {
    throw new Error('Brevo 暂不支持正文内嵌图片，请改为普通附件。');
  }
  const attachment = [];
  for (const item of params.attachments) {
    const content = await toBase64(item);
    if (!content || !item.filename) throw new Error('无法读取附件内容，请重新添加附件。');
    attachment.push({ name: item.filename, content });
  }
  const payload = {
    sender: { email: params.accountEmail, name: params.name },
    to: params.receiveEmail.map(email => ({ email })),
    subject: params.subject,
    htmlContent: params.html || `<p>${(params.text || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])).replace(/\n/g, '<br>')}</p>`,
  };
  if (params.text) payload.textContent = params.text;
  if (attachment.length) payload.attachment = attachment;
  // Standard threading headers are not documented as supported by Brevo's API.
  if (params.sendType === 'reply' && params.messageId) {
    throw new Error('Brevo 接入暂不支持保留邮件会话线程的回复，请新建邮件发送。');
  }
  const response = await fetcher('https://api.brevo.com/v3/smtp/email', {
    method: 'POST', headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Brevo 发信失败 (${response.status}): ${result.message || '请检查账户发信权限'}`);
  if (!result.messageId) throw new Error('Brevo 未返回邮件编号，请检查发信日志后再重试。');
  return result.messageId;
}
