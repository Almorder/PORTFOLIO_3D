// Convertit le téléphone et la table rouge de la page Work, et mesure la zone d'écran (transparente) du téléphone.
import {createRequire} from 'module';const require=createRequire('/tmp/audit/');const sharp=require('sharp');
import fs from 'fs';
const [src,repo]=process.argv.slice(2);const out=`${repo}/public/assets/work`;fs.mkdirSync(out,{recursive:true});const manifest={};
{ const file=`${src}/phone.png`;const {data,info:im}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});const A=(x,y)=>data[(y*im.width+x)*4+3];
  let x0=im.width,y0=im.height,x1=0,y1=0,a0=im.width,b0=im.height,a1=0,b1=0;
  for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){const a=A(x,y);if(a>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}if(a>=254){if(x<a0)a0=x;if(x>a1)a1=x;if(y<b0)b0=y;if(y>b1)b1=y;}}
  const cx=Math.round((a0+a1)/2),cy=Math.round((b0+b1)/2);let l=cx,r=cx,t=cy,b=cy;
  while(A(l-1,cy)<8)l--;while(A(r+1,cy)<8)r++;while(A(cx,t-1)<8)t--;while(A(cx,b+1)<8)b++;
  const w=x1-x0+1,h=y1-y0+1;const buf=await sharp(file).extract({left:x0,top:y0,width:w,height:h}).webp({quality:88,alphaQuality:95,effort:6}).toBuffer();fs.writeFileSync(`${out}/phone.webp`,buf);
  const f=v=>+(v*100).toFixed(3);
  manifest.phone={w,h,box:[f((a0-x0)/w),f((b0-y0)/h),f((a1-a0+1)/w),f((b1-b0+1)/h)],screen:[f((l-x0)/w),f((t-y0)/h),f((r-l+1)/w),f((b-t+1)/h)]};
  console.log('phone',w+'x'+h,Math.round(buf.length/1024)+' Ko','écran %',manifest.phone.screen.join(' ')); }
{ const buf=await sharp(`${src}/stage.png`).resize({width:2000}).webp({quality:70,effort:6}).toBuffer();fs.writeFileSync(`${out}/stage.webp`,buf);const md=await sharp(buf).metadata();manifest.stage={w:md.width,h:md.height};console.log('stage',md.width+'x'+md.height,Math.round(buf.length/1024)+' Ko'); }
fs.writeFileSync(`${repo}/content/work-assets.mjs`,`// Généré par tools/render-gear/convert-work.mjs à partir des rendus 3D — ne pas modifier à la main.\n// box : cadre du téléphone sans son ombre ; screen : zone d'écran transparente — [gauche, haut, largeur, hauteur] en % du visuel.\nexport const workAssets = ${JSON.stringify(manifest,null,2)};\n`);
