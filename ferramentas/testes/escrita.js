const {chromium}=require('playwright');
const URL='file://'+require('path').resolve(__dirname,'../../index.html');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage();
 const errs=[]; p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());}); p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.goto(URL);
 // --- escrita isolada
 const W={
  'ob.art':[['preposição + artigo feminino',1],['Regra geral',1],['prep a + artigo a',1],['preposicao e artigo femenino',1],['antes de palavra masculina',0],['artigo',0]],
  'ob.loc':[['locução feminina',1],['locucao adverbial',1],['hora',0]],
  'ob.hora':[['hora exata',1],['horas',1],['locução',0]],
  'ob.moda':[['à moda de',1],['moda oculta',1]],
  'ob.dem':[['a + aquele',1],['pronome demonstrativo aquele',1],['antes de pronome',0]],
  'ob.rel':[['a + a qual',1],['pronome relativo',1]],
  'ob.lugar':[['lugar que aceita artigo',1],['volto da',1],['lugar sem artigo',0],['volto de',0]],
  'ob.casa':[['casa especificada',1],['terra especificada',1],['casa sem especificação',0]],
  'pr.masc':[['antes de palavra masculina',1],['masculino',1],['feminino',0]],
  'pr.verbo':[['antes de verbo',1],['verbo no infinitivo',1]],
  'pr.pron':[['antes de pronome',1],['pronome pessoal',1],['pronome de tratamento',1],['antes de uma',1],['aquele',0],['possessivo',0]],
  'pr.plural':[['a no singular antes de plural',1],['plural',1]],
  'pr.rep':[['palavras repetidas',1],['repetição',1]],
  'pr.casa':[['casa sem especificação',1],['terra não especificada',1],['casa especificada',0]],
  'pr.lugar':[['lugar sem artigo',1],['volto de',1],['lugar que aceita artigo',0]],
  'pr.prep':[['depois de outra preposição',1],['após preposição',1],['preposição + artigo',0]],
  'pr.tempo':[['tempo futuro',1],['distância',1],['tempo passado',0]],
  'pr.semprep':[['sem preposição',1],['só artigo',1],['o verbo não exige preposição',1],['verbo transitivo direto',1],['lugar sem artigo',0]],
  'fa.pos':[['possessivo feminino',1],['antes de possesivo',1],['pronome',0]],
  'fa.nome':[['nome próprio de pessoa',1],['nome feminino',1],['pronome',0]],
  'fa.ate':[['depois de até',1],['ATE',1],['antes',0]],
  'ha.tempo':[['tempo passado',1],['faz',1],['verbo haver',1],['tempo futuro',0]],
 };
 const res=await p.evaluate(W=>{const out=[];for(const r in W)for(const [t,exp] of W[r]){const ok=__T.checkWrite(t,r).ok;if(ok!==!!exp)out.push(`${r}: "${t}" deu ${ok}, esperado ${!!exp}`);}return out;},W);
 console.log('escrita:',res.length?res:'todos os casos OK');
 const missingTest=await p.evaluate(W=>Object.keys(__T.RULES).filter(r=>!W[r]),W); console.log('regras sem teste de escrita:',missingTest);
 console.log('erros do banco:',await p.evaluate(()=>__T.ERRORS));
 await b.close(); console.log('console errors:',errs);
})();
