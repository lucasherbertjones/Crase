# Guia do projeto: Crase (jogo irmão de Classes Gramaticais)

Este arquivo resume as decisões, o funcionamento e as lições do jogo `index.html`, para que uma nova
conversa possa continuar este jogo. Mesma arquitetura e mesmas mecânicas do `classes-gramaticais`,
adaptadas para a crase.

## Objetivo do jogo
Aprender a usar a crase corretamente no menor tempo possível: **muitas repetições rápidas**,
**memorização visual por cores** e **foco no que o jogador ainda erra**. Português do Brasil, norma-padrão.

## Arquitetura (manter assim)
- **Um único arquivo `index.html`**, com HTML, CSS e JavaScript juntos, sem backend e sem dependências
  (só Google Fonts). Hospedável de graça no GitHub Pages.
- **Sem IA durante o jogo**: as frases ficam num banco fixo, revisado à mão.
- **Progresso em `localStorage`**: `crase.v1` (estado: nível, pontos, domínio, preferências) e
  `crase.hist.v1` (histórico completo).
- O trecho entre `/*DADOS-INICIO` e `/*DADOS-FIM*/` (decisões, regras, banco e leitura do banco) **não usa
  o navegador**: `node ferramentas/validar.js` executa esse trecho no Node e valida o banco. Não coloque
  código de DOM dentro dele.

## Árvore de classificação
Duas etapas: **decisão** (`DEC`: `ob` obrigatória = verde, `pr` proibida = vermelho, `fa` facultativa =
amarelo, `ha` "há" = azul) → **regra** (`RULES`, 22 no total; cada regra tem um tom da cor da decisão).
- Obrigatória: `ob.art` preposição + artigo feminino · `ob.loc` locução feminina · `ob.hora` hora exata ·
  `ob.moda` "à moda de" (mesmo oculta) · `ob.dem` a + aquele/aquela/aquilo · `ob.rel` a + a qual/as quais ·
  `ob.lugar` lugar que aceita artigo (volto da) · `ob.casa` casa/terra especificada (e a Terra, planeta).
- Proibida: `pr.masc` masculina · `pr.verbo` verbo · `pr.pron` pronome pessoal/de tratamento/indefinido/
  demonstrativo ou "uma" · `pr.plural` "a" singular antes de plural · `pr.rep` palavras repetidas ·
  `pr.casa` casa/terra sem especificação · `pr.lugar` lugar sem artigo (volto de) · `pr.prep` depois de
  outra preposição · `pr.tempo` tempo futuro ou distância · `pr.semprep` sem preposição (só artigo ou
  pronome: "visitei a avó", "a empresa a qual visitei"). Esta última não estava no pedido original, mas
  é o erro de hipercorreção mais comum e serve de contraste para `ob.rel` e `ob.dem`.
- Facultativa: `fa.pos` possessivo feminino · `fa.nome` nome feminino de pessoa · `fa.ate` depois de "até".
- Há: `ha.tempo` tempo passado (= faz). Tem uma regra só, então a árvore termina na decisão.

Cada regra tem: `n` nome, `s` rótulo curto (embaixo da lacuna), `x` explicação com o teste prático
(aparece no erro), `h` dica que não entrega a resposta, `w`/`no` palavras-chave da escrita por extenso e
`none` (por que nenhuma palavra exige o "a", usado no passo 1).

## Formato do banco de frases
Uma frase por linha:
- `{forma|regra|nota opcional}` = lacuna. Formas aceitas separadas por `/` (só a facultativa: `à/a`).
  Formas em minúsculas; o jogo põe maiúscula quando a lacuna abre a frase.
- `[palavra]` = termo que exige a preposição "a" para a **próxima** lacuna; `[palavra<]` = para a lacuna
  **anterior** ("A empresa {à qual|ob.rel} me [referi<] fechou."); `[palavra#2]` = para a lacuna nº 2.
- Lacuna sem termo marcado = nenhuma palavra exige o "a" (locução, hora, tempo, palavras repetidas,
  outra preposição, só artigo, "há").
- Exemplo: `Ele [voltou] {a|pr.verbo} estudar {à|ob.loc} noite.`
- Hoje: 326 frases, 341 lacunas, mínimo de 9 exemplos por regra (o validador exige 8).
- O validador confere: regra existe, forma existe, obrigatória sempre com acento grave, proibida nunca com
  acento grave nem "há", facultativa com duas formas, `pr.plural` só com "a", termo regente ligado a uma
  lacuna, frase com lacuna, sem duplicatas e mínimo por regra.

## Mecânicas
1. **Passo 1 (ordem recomendada, equivalente ao "verbo primeiro")**: para cada lacuna, tocar na palavra
   que exige a preposição "a", ou em "Nenhuma" (tecla 0). As 9 palavras mais próximas da lacuna ganham as
   teclas 1–9. Acertou: a palavra fica sublinhada com a cor da regra ("exige “a”"). Errou: mostra quem
   exige, sem entregar a regra, e segue para a lacuna. Opção "direto à lacuna" no menu. O passo 1 entra no
   histórico e nas estatísticas, mas não no domínio nem na subida de nível.
2. **Passo 2, níveis 1–6: escolher a forma.** Botões coloridos pela forma (à/às/àquele = verde, a/as/aquele
   = vermelho, há = azul). Opções por nível: 1–2 a/à; 3–4 a/à/as/às; 5+ incluem há. "Aquele" e "a qual"
   têm opções próprias (aquele/àquele; a qual/à qual/as quais/às quais); `pr.plural` só a/à.
   Facultativa: qualquer forma válida conta como acerto, e o feedback avisa que as duas valem.
3. **Regras por nível** (`POOL`): 1 = `ob.art` × `pr.masc`; 2 = + verbo, pronome, sem preposição;
   3 = + locução, hora, plural; 4 = + lugares, casa/terra, à moda de, repetidas, outra preposição; 5 = todas;
   6 = todas com prioridade para pegadinhas (`TRICKY_R` ou nota). Lacunas fora do nível já aparecem
   preenchidas e coloridas.
4. **7–10: árvore completa** (decisão → regra, sempre com TODAS as opções); 8 prioriza pegadinhas, 9 tira
   as cores dos botões, 10 embaralha e tira a dica. A lacuna é preenchida sozinha no final.
5. **11–12: escrita por extenso da regra** só do que já domina (`A:` etapa 3+ no 11, 2+ no 12). Correção
   tolerante: ignora acentos, maiúsculas, ordem e palavras extras; aceita 1 letra errada em radicais de 5+
   letras. Cada regra tem grupos de radicais obrigatórios (`w`, todos os grupos; um radical por grupo) e
   radicais proibidos (`no`, para não aceitar "lugar sem artigo" na regra "lugar com artigo").
   Radicais de até 3 letras precisam ser exatos ("ate", "de", "art").
6. **Bônus do nível 12: caça ao acento** (25% das frases). A frase aparece sem lacunas; em 80% delas uma ou
   mais lacunas vêm com o acento trocado (`flip`). Todas as palavras "a/à/as/às/há/aquele…" da frase são
   marcáveis (teclas 1–0), inclusive as que não são lacuna, para não entregar onde está o erro.
7. **Feedback**: acerto avança em ~0,4 s (1,3 s com nota); erro mostra a forma certa, a regra, o teste
   prático, a nota da frase e quem exige o "a"; continua com Enter. Frase completa fica 1,5 s colorida.
8. **Domínio por etapas**: 5→3→2→1→1→1 acertos seguidos pulam a regra 5→10→20→40→80→160 vezes; erro volta
   ao início; mais de 5 dias sem responder faz voltar; acerto com dica não conta. Chaves por regra e modo:
   `F:regra` (forma) e `A:regra` (árvore e escrita). Domínio por regra, não por frase.
9. **Histórico**: `[data, idFrase, nºLacuna, regra, respostaCerta, resposta, acerto, nível, modo, dica]`,
   modos `regente`, `forma`, `arvore`, `escrita`, `caca`. Estatísticas por decisão e regra, domínio,
   "lacunas para revisar" e "Copiar CSV".
10. **Teclado**: 1–9 e 0 respondem/marcam, Enter/Espaço continuam, H dica, L legenda. Proteção contra clique
    duplo (320 ms) só no mouse/toque.

## Decisões de gramática (o que ficou de fora ou foi explicado em nota)
- Fora do banco, por haver divergência: crase em locuções de instrumento ("à mão", "à máquina", "à bala"),
  "a distância" sem especificação, nomes de pessoas célebres (Joana d'Arc), "senhora/dona/madame" (aceitam
  artigo), "outra/mesma/demais" (aceitam artigo), possessivo no plural, "até às 18h", "de segunda a sexta",
  "barco a vela", "entrega a domicílio".
- Com nota: "chegar a casa" (norma-padrão; "chegar em casa" é coloquial), a Terra planeta, "à Roma antiga"
  e "à Lisboa da minha infância" (lugar especificado), "aspirar a" = desejar, "à uma hora" × "a uma hora de
  viagem", "a Pedro" (ou "ao Pedro"), "namorar alguém" sem preposição.

## Como testar
- `node ferramentas/validar.js` valida o banco.
- Playwright já vem instalado no ambiente de nuvem. `ferramentas/testes/`:
  `escrita.js` (correção da escrita com casos certos e errados por regra), `niveis.js` (joga os 12 níveis
  pelo teclado, nas duas ordens, com um erro proposital por nível) e `dominio_escrita_caca.js` (semeia o
  `localStorage`: tudo dominado, domínio subindo e zerando, escrita no nível 11, caça ao acento e capturas).
  `drive.js` decide a próxima tecla lendo `window.__T`.
- O jogo expõe `window.__T` (SENT, RULES, checkWrite, scope, fam, estado atual) para os testes.
- Bloquear as Google Fonts no teste gera um erro de console esperado ("Failed to load resource").

## Publicação
- GitHub Pages: repositório público com `index.html` na raiz → Settings → Pages → branch, pasta `/`.
- A sessão do Claude não consegue criar repositórios nem ativar o Pages; o usuário faz isso.

## Ideias para depois
- Mais frases por regra; modo "explique ao contrário" (dada a regra, escolher a frase certa); regência
  verbal como jogo próprio (assistir, visar, aspirar, obedecer, preferir).
