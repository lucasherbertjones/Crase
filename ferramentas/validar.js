// Valida o banco de frases do index.html: node ferramentas/validar.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('/*DADOS-INICIO'), b=html.indexOf('/*DADOS-FIM*/');
if(a<0||b<0){console.error('Marcadores DADOS-INICIO/DADOS-FIM não encontrados');process.exit(1);}
const ctx={};vm.createContext(ctx);
vm.runInContext(html.slice(a,b)+'\n;this.R={SENT,ERRORS,COUNT,RULES,DEC};',ctx);
const {SENT,ERRORS,COUNT,RULES}=ctx.R;
const nGaps=SENT.reduce((n,s)=>n+s.gaps.length,0);
console.log(`${SENT.length} frases, ${nGaps} lacunas, ${Object.keys(RULES).length} regras`);
for(const r in RULES) console.log(`  ${r.padEnd(11)} ${String(COUNT[r]||0).padStart(3)}  ${RULES[r].n}`);
if(ERRORS.length){console.error('\nERROS:\n'+ERRORS.join('\n'));process.exit(1);}
console.log('\nOK: formato, regras, formas, mínimo de 8 por regra e sem duplicatas.');
