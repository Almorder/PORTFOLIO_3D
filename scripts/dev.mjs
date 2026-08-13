import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { spawn } from 'node:child_process';
const root=new URL('../',import.meta.url).pathname;
await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[join(root,'scripts/build.mjs')],{stdio:'inherit'});p.on('close',c=>c===0?resolve():reject(new Error('build failed')))});
const dist=join(root,'dist');const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=join(dist,path);let s;try{s=await stat(file)}catch{}if(s?.isDirectory())file=join(file,'index.html');else if(!s && !extname(file))file=join(file,'index.html');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('404')}}).listen(4173,'127.0.0.1',()=>console.log('Nolan Arc → http://127.0.0.1:4173'));
