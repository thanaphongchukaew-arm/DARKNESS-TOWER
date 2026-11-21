const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),file=path.join(root,'previews/companions/all.html');
let html=fs.readFileSync(file,'utf8');if(!html.includes('<base '))html=html.replace('<meta charset="utf-8">','<meta charset="utf-8"><base href="'+require('url').pathToFileURL(root+path.sep).href+'">');fs.writeFileSync(file,html);
app.whenReady().then(async()=>{const w=new BrowserWindow({width:1280,height:960,useContentSize:true,show:false});await w.loadFile(file);await w.webContents.executeJavaScript(`Promise.all([...document.querySelectorAll('image')].map(e=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src=e.getAttribute('href');})))`);await new Promise(r=>setTimeout(r,100));fs.writeFileSync(file.replace('all.html','desktop-all.png'),(await w.webContents.capturePage()).toPNG());app.quit();}).catch(e=>{console.error(e);app.exit(1);});
