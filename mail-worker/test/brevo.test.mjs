import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendBrevo } from '../src/service/brevo.js';
const params = {name:'Test',accountEmail:'admin@example.com',receiveEmail:['to@example.net'],subject:'Hello',text:'Hello',html:'<p>Hello</p>',attachments:[]};
test('sends expected payload and returns provider id', async () => {
  let req;
  const id = await sendBrevo('secret', params, async ()=>'YWJj', async (url, options) => { req={url,options}; return {ok:true,json:async()=>({messageId:'<id>'})}; });
  assert.equal(id,'<id>'); assert.equal(req.url,'https://api.brevo.com/v3/smtp/email');
  const payload=JSON.parse(req.options.body); assert.deepEqual(payload.to,[{email:'to@example.net'}]); assert.equal(payload.sender.email,'admin@example.com');
});
test('translates attachments and propagates provider error', async () => {
  await assert.rejects(sendBrevo('x',{...params,attachments:[{filename:'a.pdf',content:'YWJj'}]},async x=>x.content,async (url,opt)=>{assert.deepEqual(JSON.parse(opt.body).attachment,[{name:'a.pdf',content:'YWJj'}]);return {ok:false,status:403,json:async()=>({message:'not activated'})};}), /403.*not activated/);
});
test('fails explicitly on unsupported inline images and threading', async () => {
  await assert.rejects(sendBrevo('x',{...params,attachments:[{contentId:'cid'}]},async()=>'',()=>{}),/内嵌图片/);
  await assert.rejects(sendBrevo('x',{...params,sendType:'reply',messageId:'<id>'},async()=>'',()=>{}),/会话线程/);
});
