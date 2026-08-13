import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { legalRequiredFields } from '../content/legal.mjs';
const root=new URL('../',import.meta.url).pathname;
const dist=join(root,'dist');
try{ execFileSync(process.execPath,[join(root,'scripts/build.mjs')],{stdio:'inherit'}); }catch{process.exit(1)}
execFileSync(process.execPath,['--check',join(root,'src/app.js')],{stdio:'inherit'});
async function walk(dir){let out=[];for(const n of await readdir(dir)){const p=join(dir,n);const s=await stat(p);if(s.isDirectory()) out=out.concat(await walk(p));else out.push(p)}return out}
const files=await walk(dist);const htmls=files.filter(f=>f.endsWith('.html'));let errors=[];const existing=new Set(files.map(f=>relative(dist,f).replaceAll('\\','/')));
for(const f of htmls){const html=await readFile(f,'utf8');if(!/<title>.+<\/title>/.test(html)) errors.push(`${relative(dist,f)}: missing title`);if(!/<meta name="description"/.test(html) && !html.includes('http-equiv="refresh"')) errors.push(`${relative(dist,f)}: missing description`);const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);const dups=ids.filter((id,i)=>ids.indexOf(id)!==i);if(dups.length)errors.push(`${relative(dist,f)} duplicate ids ${[...new Set(dups)].join(',')}`);
  if(!html.includes('http-equiv="refresh"')){
    const h1=(html.match(/<h1[\s>]/g)||[]).length; if(h1!==1) errors.push(`${relative(dist,f)}: expected 1 H1, got ${h1}`);
    for(const m of html.matchAll(/<img\s[^>]*>/g)){ if(!/\salt="[^"]*"/.test(m[0])) errors.push(`${relative(dist,f)}: image missing alt`); }
    for(const m of html.matchAll(/href="(\/[^"]*)"/g)){ const raw=m[1].split('#')[0].split('?')[0]; if(!raw||raw==='/' ) continue; let target=raw.replace(/^\//,''); if(target.endsWith('/')) target += 'index.html'; else if(!/\.[a-z0-9]+$/i.test(target)) target += '/index.html'; if(!existing.has(target)) errors.push(`${relative(dist,f)}: broken internal href ${raw}`); }
  }
}
const css=await readFile(join(root,'src/styles.css'),'utf8');if(css.includes('var(--ember-soft;'))errors.push('CSS malformed variable');
const app=await readFile(join(root,'src/app.js'),'utf8');
if(/sessionStorage|localStorage/.test(app)) errors.push('PRIVACY BLOCKER: browser storage detected in src/app.js');
if(/googletagmanager|google-analytics|gtag\(/i.test(app)) errors.push('PRIVACY BLOCKER: analytics code detected in src/app.js');
for(const [field,value] of legalRequiredFields){ if(!String(value||'').trim()) errors.push(`LEGAL BLOCKER: content/legal.mjs → ${field} is empty`); }
const requiredLegalLinks=['/mentions-legales/','/confidentialite/','/cookies/','/cgv/','/retractation/'];
for(const f of htmls){
  const html=await readFile(f,'utf8');
  const rel=relative(dist,f);
  if(html.includes('Article complet à intégrer') || html.includes('À compléter avant publication')) errors.push(`${rel}: visible production placeholder`);
  if(!html.includes('http-equiv=\"refresh\"') && !rel.startsWith('404')){
    for(const href of requiredLegalLinks){ if(!html.includes(`href=\"${href}\"`)) errors.push(`${rel}: missing footer/legal link ${href}`); }
  }
  if(rel==='contact/index.html'){
    if(!html.includes('https://formsubmit.co/ajax/')) errors.push('contact/index.html: FormSubmit AJAX endpoint missing');
    if(!html.includes('name=\"_honey\"')) errors.push('contact/index.html: honeypot missing');
    if(!html.includes('href=\"/confidentialite/\"')) errors.push('contact/index.html: privacy notice link missing');
  }
  if(/<iframe[^>]+youtube/i.test(html)) errors.push(`${rel}: YouTube iframe present before user consent`);
}

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`QA OK — ${htmls.length} HTML files, JS syntax valid, no duplicate IDs.`);
