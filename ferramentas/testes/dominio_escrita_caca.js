const {chromium}=require('playwright'); const D=require('./drive.js');
const URL='file://'+require('path').resolve(__dirname,'../../index.html');
async function page(b,seed){ const ctx=await b.newContext({deviceScaleFactor:1,viewport:{width:1280,height:860}}); const p=await ctx.newPage();
 p.errs=[]; p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))p.errs.push(m.text());}); p.on('pageerror',e=>p.errs.push('PAGEERR '+e.message));
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 if(seed) await p.addInitScript(s=>{ if(!sessionStorage.getItem('seeded')){localStorage.setItem('crase.v1',JSON.stringify(s));sessionStorage.setItem('seeded',1);} },seed);
 await p.goto(URL); return p; }
(async()=>{
 const b=await chromium.launch();
 const rules=['ob.art','ob.loc','ob.hora','ob.moda','ob.dem','ob.rel','ob.lugar','ob.casa','pr.masc','pr.verbo','pr.pron','pr.plural','pr.rep','pr.casa','pr.lugar','pr.prep','pr.tempo','pr.semprep','fa.pos','fa.nome','fa.ate','ha.tempo'];
 // 1) tudo dominado no nível 1: a frase não pode ficar vazia
 { const mast={}; rules.forEach(r=>mast['F:'+r]={st:3,c:0,sk:40,t:Date.now()});
   const p=await page(b,{level:1,order:'direto',mast});
   const st=await p.evaluate(()=>({ph:__T.phase,q:__T.queue.length,mastGaps:__T.cur.gaps.filter(g=>g.mast).length}));
   console.log('1) tudo dominado:',st, 'erros:',p.errs); }
 // 2) domínio: 5 acertos seguidos em ob.art no nível 1 → pula 5
 { const p=await page(b,{level:1,order:'direto',skipM:true});
   for(let i=0;i<120;i++){ await D.step(p,false); const m=await p.evaluate(()=>__T.S.mast['F:ob.art']); if(m&&m.st>=1){ console.log('2) domínio ob.art após acertos:',m); break; } }
   // erro volta ao início
   await p.evaluate(()=>{__T.S.mast['F:ob.art']={st:2,c:1,sk:0,t:Date.now()};});
   for(let i=0;i<200;i++){ const ph=await p.evaluate(()=>__T.phase==='q'&&__T.cur.gaps[__T.queue[__T.qi]].r==='ob.art'); const a=await D.step(p,ph); if(ph&&!a.wait) break; }
   console.log('   após erro:',await p.evaluate(()=>__T.S.mast['F:ob.art']),'erros:',p.errs); }
 // 3) escrita no nível 11 (etapa 3 em A:)
 { const mast={}; rules.forEach(r=>mast['A:'+r]={st:2,c:0,sk:0,t:Date.now()});
   const p=await page(b,{level:11,order:'direto',mast,skipM:false});
   let w=0, wrongDone=false; for(let i=0;i<200&&w<10;i++){ const isW=await p.evaluate(()=>!!document.getElementById('wIn')&&!document.getElementById('wIn').disabled);
     const doWrong=isW&&!wrongDone&&w===3; const a=await D.step(p,doWrong); if(a.write){w++; if(doWrong) wrongDone=true; if(w===1) await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_escrita.png')});} if(w===4&&doWrong) await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_escrita_erro.png')}); }
   const h=await p.evaluate(()=>JSON.parse(localStorage.getItem('crase.hist.v1')).e.filter(r=>r[8]==='escrita').map(r=>r[6]));
   console.log('3) escrita: respostas',h.length,'acertos',h.filter(Boolean).length,'erros:',p.errs);
   const mA=await p.evaluate(()=>Object.entries(__T.S.mast).filter(([k,m])=>m.st===0).map(([k])=>k)); console.log('   regras que voltaram ao início:',mA); }
 // 4) caça ao acento (nível 12)
 { const p=await page(b,{level:12,order:'regente'}); let hunts=0, wrongDone=false;
   for(let i=0;i<600&&hunts<6;i++){ const ph=await p.evaluate(()=>__T.phase);
     if(ph==='hunt'){ hunts++; if(hunts===1) await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_caca.png')}); const doWrong=hunts===2; const a=await D.step(p,doWrong); if(doWrong){ await p.waitForTimeout(200); await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_caca_erro.png')}); } continue; }
     if(ph==='q'||ph==='reg'||ph==='end'){ if(ph==='end'||ph==='q'||ph==='reg'){ await p.evaluate(()=>{}); } }
     if(ph==='end'){ await p.keyboard.press('Enter'); continue; }
     await D.step(p,false); }
   const h=await p.evaluate(()=>JSON.parse(localStorage.getItem('crase.hist.v1')).e.filter(r=>r[8]==='caca'));
   console.log('4) caça: frases',hunts,'registros',h.length,'acertos',h.filter(r=>r[6]).length,'erros:',p.errs); }
 // 5) capturas
 { const p=await page(b,{level:5,order:'regente'}); await p.waitForTimeout(300); await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_reg.png')});
   await D.step(p,false); await p.waitForTimeout(900); await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_forma.png')});
   await D.step(p,true); await p.waitForTimeout(200); await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_forma_erro.png')});
   await p.click('#bStats'); await p.waitForTimeout(200); await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_stats.png')});
   console.log('5) capturas ok, erros:',p.errs); }
 { const p=await page(b,{level:8,order:'direto'}); await D.step(p,false); await p.waitForTimeout(300); await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_arvore.png')}); }
 await b.close();
})();
