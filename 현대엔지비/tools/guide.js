const fs=require('fs');
const {P,M,PE,STEPS,FILES}=require('./content.js');
const ROOT=require('path').join(__dirname,'..','실습자료')+'/';
const ex=fs.readFileSync(ROOT+'강사용/강사작성_가상예시_간결교안용.txt','utf8');
const EX={};
for(const m of ex.matchAll(/-{20,}\n예시 (\d)\s+(.+?)\n-{20,}\n([\s\S]*?)(?=\n\n-{20,}|\s*$)/g)) EX[+m[1]]={title:m[2].trim(),body:m[3].trim()};
if(Object.keys(EX).length!==8) throw new Error('examples '+Object.keys(EX).length);
const GUIDE=fs.readFileSync(require('path').join(__dirname,'..','교안.html'),'utf8');
const CAPS=JSON.parse(GUIDE.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1]).steps;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const SLUG=['','idea','canvas','research','draft','review','gamma','edit','share'];
const FOLDER=n=>`${STEPS[n-1].cs}차시/${String(n).padStart(2,'0')}_${['','사업아이디어','Canvas문서','근거찾기','기획서초안','최종보고서','Gamma생성','PPT수정','공유피드백'][n]}`;
// 대괄호 자리 (가설/미확인 표기는 제외)
const PH=/\[(?!가설\]|미확인\])[^\]\n]{2,}\]/g;
function promptHTML(n,cond){
  const text=P[n-1]; const phs=[...new Set(text.match(PH)||[])];
  const body=esc(text).replace(PH,m=>`<mark>${m}</mark>`);
  const fields=phs.map((ph,i)=>`<label class="fill" for="p${n}f${i}"><span>${esc(ph.slice(1,-1))}</span>${n===7?'<button type="button" class="ghost" data-loadmemo="p7f0">3장 근거 메모 불러오기</button>':''}<textarea id="p${n}f${i}" data-ph="${esc(ph)}" rows="3" placeholder="여기에 내 결과를 붙여넣으면 대괄호 자리에 들어갑니다"></textarea></label>`).join('');
  return `<div class="prompt${cond?' cond':''}" data-p="${n}">
  <div class="pbar"><span class="pno">${M[n-1]}</span><span class="ptitle">요청 ${M[n-1]}${cond?' <em>필요할 때만</em>':''}</span><button type="button" class="copy" data-copy="${n}">복사</button></div>
  <pre>${body}</pre>${fields?`<div class="fills">${fields}<p class="hint">칸을 채우면 「복사」에 내 내용이 들어간 요청문이 복사됩니다. 비워 두면 대괄호 그대로 복사됩니다.</p></div>`:''}</div>`;
}
function chapter(s){
  const all=[...new Set([...s.prompts,...s.cond])].sort((a,b)=>a-b);
  const pe=PE[s.n]?`<div class="four"><h4>이 요청에 들어 있는 네 가지</h4><dl>${PE[s.n].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`:'';
  let extra='';
  if(s.n===3) extra=`<div class="tool-box"><h4>근거 메모 쓰기</h4><p class="hint">원문을 직접 열어 본 내용만 적습니다. 이 브라우저에 자동 저장되며, 4장 요청 ⑦에 불러올 수 있습니다.</p>${[1,2].map(k=>`<fieldset><legend>근거 메모 ${k}</legend>${[['fact','확인한 내용','원문에 실제로 적힌 내용 한두 문장'],['title','제목과 날짜','기관·문서 제목·날짜 (없으면 날짜 미표시)'],['url','원문 주소(URL)','내가 직접 열어 본 주소'],['limit','쓸 곳과 한계','기획서에 쓸 내용 / 아직 모르는 점']].map(([f,l,ph])=>`<label for="m${k}${f}">${l}</label><textarea id="m${k}${f}" data-memo rows="2" placeholder="${ph}"></textarea>`).join('')}<label class="inline"><input type="checkbox" id="m${k}open" data-memo> 원문을 직접 열어 봤어요 (안 열었으면 「원문 미확인」으로 들어갑니다)</label></fieldset>`).join('')}<button type="button" class="copy wide" id="copymemo">근거 메모 2건 복사</button></div>`;
  if(s.n===8) extra=`<div class="tool-box"><h4>실습기록표</h4><p class="hint">도구가 안 돼서 다른 방법으로 한 부분은 「대체 실습」에 체크합니다.</p><div class="scroll"><table class="log"><thead><tr><th>장</th><th>하는 일</th><th>완료</th><th>대체 실습</th></tr></thead><tbody>${STEPS.map(t=>`<tr><td>${t.n}</td><td>${t.title}</td><td><input type="checkbox" id="log${t.n}done" data-keep aria-label="${t.n}장 완료"></td><td><input type="checkbox" id="log${t.n}alt" data-keep aria-label="${t.n}장 대체 실습"></td></tr>`).join('')}</tbody></table></div><label for="takeaway">내 업무에 써 볼 한 가지</label><textarea id="takeaway" data-keep rows="2" placeholder="예: 반복 문의 답변 초안을 만들 때 [가설]과 출처를 구분해 쓰기"></textarea></div>`;
  const caps=CAPS.filter(c=>c.stage===s.n);
  const shots=`<div class="shots" hidden><h3>실제 화면</h3><div class="shotgrid">${caps.map(c=>`<figure class="shot" hidden><img data-src="../captures/${c.id}.png" alt="${esc(c.title)} 화면"><figcaption><b>${c.id}</b> ${esc(c.title)}</figcaption></figure>`).join('')}</div></div>`;
  const e=EX[s.n];
  return `<section class="chap" id="${SLUG[s.n]}" aria-labelledby="h${s.n}">
  <header class="chead"><div class="cno">${s.n}</div><div class="cmeta"><p class="eyebrow">${s.cs}차시 · ${s.n}장 · 약 ${s.min}분</p><h2 id="h${s.n}">${esc(s.title)}</h2><p class="tools">${esc(s.tool)}</p></div></header>
  <p class="req"><span>요청서</span>${esc(s.req)}</p>
  <div class="cbody">
   <div class="col-main">
    <h3>이번에 할 일</h3><p class="goal">${esc(s.goal)}</p>
    <h3>따라 하기</h3><ol class="steps">${s.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
    ${shots}
    <h3>복사할 요청</h3>${all.map(n=>promptHTML(n,s.cond.includes(n))).join('')}
    ${pe}${extra}
   </div>
   <aside class="col-side">
    ${FILES[s.n]?`<div class="files"><h4>이 장에서 쓰는 파일</h4><ul>${FILES[s.n].map(([f,k,why])=>`<li><span class="ftag ${k==='업로드'?'up':''}">${k}</span><a href="${FOLDER(s.n)}/${f}">${f}</a><small>${why}</small></li>`).join('')}</ul><p class="file">폴더: <code>${FOLDER(s.n)}/</code></p></div>`:''}
    <div class="ok"><h4>이렇게 나오면 성공</h4>${s.ok.map((x,i)=>`<label class="chk" for="ok${s.n}_${i}"><input type="checkbox" id="ok${s.n}_${i}" data-keep> <span>${esc(x)}</span></label>`).join('')}</div>
    <div class="fb"><h4>안 되면</h4><ul>${s.fb.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
    <details><summary>도구가 안 될 때 쓰는 예시</summary><p class="hint">강사가 쓴 교육용 예시입니다. AI 실행 결과가 아니니, 쓴 경우 실습기록표에 「대체 실습」으로 표시하세요.</p><pre class="ex">${esc(e.body)}</pre><button type="button" class="ghost" data-copyex="${s.n}">예시 복사</button></details></div>
   </aside>
  </div>
  </section>`;
}
const css=fs.readFileSync(__dirname+'/guide.css','utf8');
const js=fs.readFileSync(__dirname+'/guide.client.js','utf8');
const nav=[1,2].map(c=>`<div class="navgroup"><span class="navcs">${c}차시</span>${STEPS.filter(s=>s.cs===c).map(s=>`<a href="#${SLUG[s.n]}"><b>${s.n}</b>${esc(s.title)}</a>`).join('')}</div>`).join('');
const html=`<title>엔지비기업 AI 실습 가이드</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>${css}</style>
<div class="wrap">
<header class="top">
 <p class="eyebrow">현대엔지비 · 생성형 AI 기초 실습 · 2차시</p>
 <h1>엔지비기업 AI 실습 가이드</h1>
 <p class="lead">가상의 무역·납품 업체 「엔지비기업」을 돕는 서비스를 AI와 함께 기획합니다. 아이디어를 고르고, 근거를 찾아 사업기획서를 쓰고, 그 내용으로 발표자료 8장을 만듭니다. 장마다 순서대로 따라 하고, 요청문은 「복사」 버튼으로 붙여넣으세요.</p>
 <ul class="outcome"><li><span>결과물 1</span>사업기획서(최종 보고서) 1개</li><li><span>결과물 2</span>발표자료 8장 (PPTX)</li><li><span>도구</span>Gemini 또는 ChatGPT · Perplexity · Gamma 무료 계정</li></ul>
</header>
<nav class="chapnav" aria-label="실습 장 이동">${nav}</nav>
<section class="basics" id="basics" aria-labelledby="hb">
 <h2 id="hb">시작 전에</h2>
 <div class="bgrid">
  <div><h3>좋은 요청의 네 가지</h3><dl class="fourtable"><div><dt>상황</dt><dd>누구의 어떤 상황인지</dd></div><div><dt>할 일</dt><dd>AI가 해야 할 일</dd></div><div><dt>형식</dt><dd>답을 받을 모양 (표, 카드)</dd></div><div><dt>조건</dt><dd>지킬 것과 하지 말 것</dd></div></dl><p class="hint">1장과 3장에서 실제 요청문에 이 네 가지가 어떻게 들어 있는지 확인합니다.</p></div>
  <div><h3>공통 약속</h3><ul class="rules"><li>요청문은 통째로 복사해서 <b>한 번만</b> 보냅니다.</li><li><mark>[대괄호]</mark>는 내 결과로 바꿀 자리입니다.</li><li>「필요할 때만」 요청은 문제가 있을 때만 씁니다.</li><li>모르는 것은 [가설], 확인 못 한 것은 「미확인」으로 남깁니다.</li><li>실제 고객 정보·회사 기밀은 넣지 않습니다. 유료 가입은 하지 않습니다.</li><li>시간은 참고용입니다. 결과 문장이 강사와 달라도 괜찮습니다.</li></ul></div>
 </div>
</section>
${STEPS.map(chapter).join('\n')}
<footer class="foot">교육용 가상사례 · 강사 예시는 AI 실행 결과가 아닙니다 · 화면 메뉴 이름은 날짜와 계정에 따라 다를 수 있습니다</footer>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>const PROMPTS=${JSON.stringify(P)};const EXAMPLES=${JSON.stringify(Object.fromEntries(Object.entries(EX).map(([k,v])=>[k,v.body])))};
${js}</script>`;
fs.writeFileSync(require('path').join(__dirname,'.artifact.html'),html);
fs.writeFileSync(ROOT+'실습가이드.html','<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+html.replace('<div class="wrap">','</head>\n<body>\n<div class="wrap">')+'\n</body>\n</html>\n');
console.log('ok',html.length);
