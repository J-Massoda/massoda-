#!/usr/bin/env python3
"""Check exact phone/desktop viewports using Chrome's DevTools protocol.

Chrome's window-size flag clamps narrow windows, so explicit device emulation
is necessary. Node's built-in WebSocket avoids external test dependencies.
"""
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / "creative-portfolio/blog-procreate-vs-procreate-dreams.html"

DRIVER = r'''
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const [chromePath, profile, pageURL] = process.argv.slice(2);
const chrome = spawn(chromePath, ['--headless','--no-sandbox','--disable-dev-shm-usage',`--user-data-dir=${profile}`,'--remote-debugging-port=0','about:blank'], {stdio:['ignore','ignore','pipe']});
let socket;
try {
  const endpoint = await new Promise((resolve,reject)=>{
    let output='';
    const deadline=setTimeout(()=>reject(new Error('Chrome startup timed out')),20000);
    chrome.stderr.on('data',chunk=>{
      output+=chunk.toString();
      const match=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if(match){clearTimeout(deadline);resolve(match[1]);}
    });
    chrome.on('error',reject);
    chrome.on('exit',code=>{clearTimeout(deadline);reject(new Error(`Chrome exited: ${code}`));});
  });
  socket=new WebSocket(endpoint);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  let nextID=0;
  const requests=new Map();
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.id && requests.has(message.id)){
      const {resolve,reject,timer}=requests.get(message.id);requests.delete(message.id);clearTimeout(timer);
      if(message.error)reject(new Error(JSON.stringify(message.error)));else resolve(message.result);
    }
  });
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{
    const id=++nextID;
    const timer=setTimeout(()=>{requests.delete(id);reject(new Error(`${method} timed out`));},30000);
    requests.set(id,{resolve,reject,timer});
    socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));
  });
  const {targetId}=await send('Target.createTarget',{url:'about:blank'});
  const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
  for(const width of [390,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390},sessionId);
    await send('Page.enable',{},sessionId);
    await send('Page.navigate',{url:pageURL},sessionId);
    let ready=false;
    for(let attempt=0;attempt<100;attempt++){
      const state=await send('Runtime.evaluate',{expression:'document.readyState',returnByValue:true},sessionId);
      if(state.result.value==='complete'){ready=true;break;}
      await delay(100);
    }
    if(!ready)throw new Error('Article did not finish loading');
    await delay(1000);
    const expression=`(()=>{const article=document.querySelector('article'),table=document.querySelector('.cp-comparison-table');return {viewport:innerWidth,width:document.documentElement.scrollWidth,article:article.getBoundingClientRect().width,table:table.getBoundingClientRect().width,font:parseFloat(getComputedStyle(article.querySelector('.cp-richtext p')).fontSize),videos:[...article.querySelectorAll('video')].every(v=>v.paused)};})()`;
    const result=await send('Runtime.evaluate',{expression,returnByValue:true},sessionId);
    const data=result.result.value;
    if(!data || data.viewport!==width || data.width>width+1 || data.article>width+1 || data.table>data.article+1 || data.font<15 || !data.videos)throw new Error(`Layout failure at ${width}px: ${JSON.stringify(data)}`);
    console.log(`Rendered layout passed at exact ${width}px: ${JSON.stringify(data)}`);
  }
  await send('Target.closeTarget',{targetId});
} finally {
  if(socket)socket.close();
  chrome.kill();
}
'''


def main():
    chrome = shutil.which("google-chrome") or shutil.which("chromium")
    if not chrome or not shutil.which("node"):
        raise RuntimeError("Chrome and Node.js 22+ are required for layout checks")
    with tempfile.TemporaryDirectory() as temporary:
        driver = Path(temporary) / "layout.mjs"
        driver.write_text(DRIVER)
        subprocess.run(["node", str(driver), chrome, str(Path(temporary) / "profile"), ARTICLE.as_uri()], check=True, timeout=120)


if __name__ == "__main__":
    main()
