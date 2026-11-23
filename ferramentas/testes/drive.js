// funções compartilhadas para jogar pelo teclado
exports.plan=function(wrong){
  const T=__T, ph=T.phase, cur=T.cur;
  const waitingGo=document.getElementById('bGo');
  if(ph==='end'||ph==='regfb'||ph==='huntfb'||(ph==='fb'&&waitingGo)) return waitingGo?{k:'Enter'}:{wait:1};
  if(ph==='regok'||ph==='fb') return {wait:1};
  if(ph==='hunt'){ const keys=[]; for(const it of T.hunt.items){ const g=it.gi!==undefined?cur.gaps[it.gi]:null; let mark=g&&g.hwrong; if(wrong&&it===T.hunt.items[0]) mark=!mark; if(mark) keys.push(String(it.n%10)); } return {keys,then:'Enter',hunt:1}; }
  const g=cur.gaps[T.queue[T.qi]];
  if(ph==='reg'){ const bn=T.byNum(); let target;
    if(!wrong) target=g.reg.length?g.reg[0]:-1; else target=g.reg.length?-1:+Object.values(bn)[0];
    if(target===-1) return {k:'0',reg:1};
    const n=Object.keys(bn).find(k=>bn[k]===target); return n?{k:n,reg:1}:{click:`.w[data-i="${target}"]`,reg:1}; }
  const inp=document.getElementById('wIn');
  if(inp&&!inp.disabled){ const W={'ob.art':'preposição + artigo feminino','ob.loc':'locução feminina','ob.hora':'hora exata','ob.moda':'à moda de','ob.dem':'a + aquele','ob.rel':'a + a qual','ob.lugar':'lugar que aceita artigo','ob.casa':'casa especificada','pr.masc':'palavra masculina','pr.verbo':'antes de verbo','pr.pron':'antes de pronome','pr.plural':'a antes de plural','pr.rep':'palavras repetidas','pr.casa':'casa sem especificação','pr.lugar':'lugar sem artigo','pr.prep':'depois de outra preposição','pr.tempo':'tempo futuro ou distância','pr.semprep':'sem preposição, só artigo','fa.pos':'possessivo','fa.nome':'nome de pessoa','fa.ate':'depois de até','ha.tempo':'tempo passado'};
    return {write: wrong?'qualquer coisa':W[g.r]}; }
  const btns=[...document.querySelectorAll('#opts .o')].filter(b=>b.dataset.o);
  const isRight=o=>T.scope(g,T.S.level)==='tree'?(T.tstep===0?o===g.r.split('.')[0]:o===g.r):g.forms.includes(o);
  let i=btns.findIndex(b=>wrong?!isRight(b.dataset.o):isRight(b.dataset.o));
  if(i<0) return {err:'sem botão '+ph+' '+g.r};
  return {k:String((i+1)%10),opt:1};
};
exports.step=async function(p,wrong){
  const a=await p.evaluate(exports.plan,wrong);
  if(a.err) throw new Error(a.err);
  if(a.wait){ await p.waitForTimeout(120); return a; }
  if(a.k) await p.keyboard.press(a.k);
  if(a.click){ await p.waitForTimeout(350); await p.click(a.click); }
  if(a.write){ await p.fill('#wIn',a.write); await p.keyboard.press('Enter'); }
  if(a.keys){ for(const k of a.keys) await p.keyboard.press(k); await p.keyboard.press('Enter'); }
  await p.waitForTimeout(60);
  return a;
};
