import {createRequire} from 'module';const require=createRequire(import.meta.url);const sharp=require('sharp');
const W=1560,H=971;const frames=[];const cols=3,rows=2,fw=440,fh=248,gx=50,gy=96,x0=70,y0=130;
const fills=[['#7a2c10','#1a0f0b'],['#173431','#0b1514'],['#8a4a1c','#1c120c'],['#2b211c','#0d0b0a'],['#a8370a','#22100a'],['#1d4a44','#0c1716']];
for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=r*cols+c,x=x0+c*(fw+gx),y=y0+r*(fh+gy);
 const sk=[`M${x+40} ${y+190}h360M${x+150} ${y+190}l70-90 60 90`,`M${x+40} ${y+170}q180-110 360 0`,`M${x+220} ${y+50}v150M${x+160} ${y+200}h120`][i%3];
 frames.push(`<defs><linearGradient id="f${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fills[i][0]}"/><stop offset="1" stop-color="${fills[i][1]}"/></linearGradient></defs>
 <rect x="${x}" y="${y}" width="${fw}" height="${fh}" rx="14" fill="url(#f${i})" stroke="#f0ebe2" stroke-opacity=".55" stroke-width="3"/>
 <path d="${sk}" fill="none" stroke="#f0ebe2" stroke-opacity=".8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="${x}" y="${y+fh+22}" width="${260-c*40}" height="9" rx="4.5" fill="#f0ebe2" fill-opacity=".45"/><rect x="${x}" y="${y+fh+44}" width="${150+r*40}" height="7" rx="3.5" fill="#f0ebe2" fill-opacity=".22"/>`);}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="bg" cx=".2" cy=".1" r="1.1"><stop offset="0" stop-color="#3a2014"/><stop offset=".55" stop-color="#17110e"/><stop offset="1" stop-color="#0a0807"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<circle cx="86" cy="64" r="13" fill="#cc460c"/><rect x="118" y="55" width="210" height="18" rx="9" fill="#f0ebe2" fill-opacity=".7"/><rect x="${W-330}" y="52" width="110" height="24" rx="12" fill="#f0ebe2" fill-opacity=".16"/><rect x="${W-200}" y="52" width="130" height="24" rx="12" fill="#cc460c"/>
${frames.join('')}
<circle cx="${x0+fw-52}" cy="${y0+52}" r="24" fill="#e97736"/>
<rect x="70" y="${H-58}" width="${W-140}" height="14" rx="7" fill="#f0ebe2" fill-opacity=".16"/><rect x="70" y="${H-58}" width="560" height="14" rx="7" fill="#cc460c"/><circle cx="630" cy="${H-51}" r="17" fill="#f0ebe2"/></svg>`;
await sharp(Buffer.from(svg)).png().toFile(new URL('./screen.png', import.meta.url).pathname);console.log('écran ok');
