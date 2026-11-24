const {chromium}=require('playwright'); const D=require('./drive.js');
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext(); const p=await ctx.newPage();
 const errs=[]; p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());}); p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));
 // primeira visita: a tela de boas-vindas aparece e fecha com Enter
 if(!await p.isVisible('#set.on #setGo')) throw new Error('boas-vindas não apareceu');
 await p.waitForTimeout(100); await p.keyboard.press('Enter'); if(await p.isVisible('#set.on')) throw new Error('boas-vindas não fechou');
 // escolhe ordem e nível pela folha "Nível e ajustes"
 const choose=async(lv,ord)=>{ if(ord){ await p.click('#bLevel'); await p.click(`[data-ord="${ord}"]`); } await p.click('#bLevel'); await p.click(`[data-lv="${lv}"]`); await p.waitForTimeout(100); };
 for(const [lv,ord] of [[1,'regente'],[2,'direto'],[3,'regente'],[4,'direto'],[5,'regente'],[6,'regente'],[7,'regente'],[8,'direto'],[9,'regente'],[10,'regente'],[11,'direto'],[12,'regente']]){
   await choose(lv,ord);
   if(await p.evaluate(()=>__T.S.level)!==lv||await p.evaluate(()=>__T.S.order)!==ord) throw new Error('nível/ordem não mudou');
   const startSents=await p.evaluate(()=>__T.S.sents); let n=0, wrongDone=false, stats={reg:0,opt:0,write:0,hunt:0};
   while(n<400){ n++;
     const ph=await p.evaluate(()=>__T.phase);
     const doWrong=!wrongDone&&n>3&&ph==='q';
     const a=await D.step(p,doWrong); if(doWrong&&!a.wait) wrongDone=true;
     for(const k in stats) if(a[k]||(k==='write'&&a.write)) stats[k]++;
     if(await p.evaluate(()=>__T.S.sents)-startSents>=6) break;
     const L=await p.evaluate(()=>__T.S.level); if(L!==lv){ await choose(lv); }
   }
   const s=await p.evaluate(()=>({sents:__T.S.sents,lvl:__T.S.level,acc:Math.round(100*__T.S.ok/__T.S.ans)}));
   console.log(`nível ${lv} (${ord}): ${n} passos, frases=${s.sents}, ${JSON.stringify(stats)}, erroProposital=${wrongDone}`);
 }
 await p.screenshot({path:require('path').join(require('os').tmpdir(),'crase_final.png')});
 console.log('histórico:',await p.evaluate(()=>JSON.parse(localStorage.getItem('crase.hist.v1')).e.length),'registros');
 console.log('console errors:',errs); await b.close();
})();
