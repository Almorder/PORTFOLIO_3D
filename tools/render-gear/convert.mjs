// Convertit les rendus PNG en WebP optimisés dans public/assets/gear/ et écrit content/gear-assets.mjs
// (dimensions, largeur physique en mm, et part occupée par le papier pour les post-its et les bandes).
import {createRequire} from 'module';const require=createRequire(import.meta.url);const sharp=require('sharp');
import fs from 'fs';
const [src,repo,logFile]=process.argv.slice(2);
const log=fs.readFileSync(logFile,'utf8');const info={};
for(const m of log.matchAll(/RENDU (\S+) (\d+)x(\d+) mm_par_px=([\d.]+) objet_mm=(\d+)x(\d+)/g)) info[m[1]]={mmpx:+m[4],ow:+m[5],oh:+m[6]};
const out=`${repo}/public/assets/gear`;fs.mkdirSync(out,{recursive:true});const manifest={};let total=0;
for(const name of Object.keys(info)){
  const file=`${src}/${name}.png`;if(!fs.existsSync(file)){console.log('manquant',name);continue;}
  if(name.startsWith('mat')){const buf=await sharp(file).resize({width:name==='mat'?2000:900}).webp({quality:74,effort:6}).toBuffer();fs.writeFileSync(`${out}/${name}.webp`,buf);const md=await sharp(buf).metadata();manifest[name]={w:md.width,h:md.height,mm:info[name].ow};total+=buf.length;console.log(name,md.width+'x'+md.height,Math.round(buf.length/1024)+' Ko');continue;}
  const {data,info:im}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=im.width,y0=im.height,x1=0,y1=0;
  for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){if(data[(y*im.width+x)*4+3]>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
  const w=x1-x0+1,h=y1-y0+1;
  // cadre de l'objet lui-même (pixels pleins), sans son ombre : sert à placer l'objet et son étiquette
  let a0=im.width,b0=im.height,a1=0,b1=0;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(data[(y*im.width+x)*4+3]>=254){if(x<a0)a0=x;if(x>a1)a1=x;if(y<b0)b0=y;if(y>b1)b1=y;}}
  const buf=await sharp(file).extract({left:x0,top:y0,width:w,height:h}).webp({quality:86,alphaQuality:90,effort:6}).toBuffer();
  fs.writeFileSync(`${out}/${name}.webp`,buf);total+=buf.length;
  const entry={w,h,mm:+(w*info[name].mmpx).toFixed(1),box:[(a0-x0)/w,(b0-y0)/h,(a1-a0+1)/w,(b1-b0+1)/h].map(v=>+v.toFixed(4))};
  if(/^(note|strip)/.test(name)){entry.pw=+(info[name].ow/info[name].mmpx/w).toFixed(4);entry.ph=+(info[name].oh/info[name].mmpx/h).toFixed(4);}
  manifest[name]=entry;console.log(name,w+'x'+h,entry.mm+' mm',entry.pw?`papier ${entry.pw}×${entry.ph}`:'',Math.round(buf.length/1024)+' Ko');
}
fs.writeFileSync(`${repo}/content/gear-assets.mjs`,`// Généré par tools/render-gear/convert.mjs à partir des rendus 3D — ne pas modifier à la main.\n// w, h : pixels ; mm : largeur réelle représentée ; box : cadre de l'objet sans son ombre [gauche, haut, largeur, hauteur] en fraction du visuel ;\n// pw, ph : part du visuel occupée par le papier (post-its, bandes).\nexport const gearAssets = ${JSON.stringify(manifest,null,2)};\n`);
console.log('total',Math.round(total/1024)+' Ko');
