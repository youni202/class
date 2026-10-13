const fs=require('fs');
const {P,M,PE,STEPS,FILES,ALT,FOLLOW}=require('./content.js');
const imgData=f=>{const p=require('path').join(__dirname,'..','captures',f);if(!fs.existsSync(p))return '';
  const out=require('child_process').execFileSync('python3',['-c',`import sys,io,base64
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB');im.thumbnail((1400,1400));b=io.BytesIO();im.save(b,'JPEG',quality=80);print(base64.b64encode(b.getvalue()).decode())`,p]);
  return 'data:image/jpeg;base64,'+out.toString().trim()};
const ROOT=require('path').join(__dirname,'..')+'/';
const ex=fs.readFileSync(require('path').join(__dirname,'examples.txt'),'utf8');
const EX={};
for(const m of ex.matchAll(/-{20,}\n예시 (\d)\s+(.+?)\n-{20,}\n([\s\S]*?)(?=\n\n-{20,}|\s*$)/g)) EX[+m[1]]={title:m[2].trim(),body:m[3].trim()};
if(Object.keys(EX).length!==8) throw new Error('examples '+Object.keys(EX).length);
const CAPS=JSON.parse(fs.readFileSync(require('path').join(__dirname,'steps.json'),'utf8')).steps;
const TPL=fs.readFileSync(require('path').join(__dirname,'tpl.html'),'utf8');
const WIRESRC=TPL.slice(TPL.indexOf('/* ---------- 와이어프레임'),TPL.indexOf('/* ---------- 렌더'));
const WIRE=require('vm').runInNewContext(WIRESRC+';WIRE');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const SLUG=['','idea','canvas','research','draft','review','gamma','edit','share'];
const FOLDER=n=>`${STEPS[n-1].cs}차시/${String(n).padStart(2,'0')}_${['','사업아이디어','Canvas문서','근거찾기','기획서초안','최종보고서','Gamma생성','PPT수정','공유피드백'][n]}`;
// 대괄호 자리 (가설/미확인 표기는 제외)
const PH=/\[(?!가설\]|미확인\])[^\]\n]{2,}\]/g;
function promptHTML(n,cond){
  const text=P[n-1]; const phs=[...new Set(text.match(PH)||[])];
  const body=esc(text).replace(PH,m=>`<mark>${m}</mark>`);
  const fields=phs.map((ph,i)=>`<label class="fill" for="p${n}f${i}"><span>${esc(ph.slice(1,-1))}</span>${n===7?'<button type="button" class="ghost" data-loadmemo="p7f0">3장 경쟁사 메모 불러오기</button>':''}<textarea id="p${n}f${i}" data-ph="${esc(ph)}" rows="3" placeholder="여기에 내 결과를 붙여넣으면 대괄호 자리에 들어갑니다"></textarea></label>`).join('');
  return `<div class="prompt${cond?' cond':''}" data-p="${n}">
  <div class="pbar"><span class="pno">${M[n-1]}</span><span class="ptitle">요청 ${M[n-1]}${cond?' <em>필요할 때만</em>':''}</span><button type="button" class="copy" data-copy="${n}">복사</button></div>
  <pre>${body}</pre>${fields?`<div class="fills">${fields}<p class="hint">칸을 채우면 「복사」에 내 내용이 들어간 요청문이 복사됩니다. 비워 두면 대괄호 그대로 복사됩니다.</p></div>`:''}
  ${FOLLOW[n]?`<div class="follow"><p class="ftitle">결과를 더 다듬고 싶으면 <span>같은 채팅에 이어서 · 선택</span></p>${FOLLOW[n].map(([name,t],k)=>`<div class="fitem"><div class="ftext"><b>${esc(name)}</b><span>${esc(t)}</span></div><button type="button" class="ghost fcopy" data-follow="${n}-${k}">복사</button></div>`).join('')}</div>`:''}</div>`;
}
function altHTML(n){
  const a=ALT[n]; if(!a) return '';
  const img=a.img?imgData(a.img):'';
  return `<div class="alt"><h3>${n===6?'Gamma가 안 될 때':'Gamma 대신 다른 도구로 만든 경우'}</h3>
  ${img?`<figure class="altshot"><img src="${img}" alt="${esc(a.cap)}"><figcaption>${esc(a.cap)} · 빨간 번호는 아래 순서와 같습니다</figcaption></figure>`:''}
  ${a.routes.map(r=>`<div class="route"><p class="rname">${r.tag?`<span class="rtag">${r.tag}</span>`:''}${esc(r.name)}${r.url?` <a href="${r.url}" target="_blank" rel="noopener">${r.url.replace('https://','')}</a>`:''}</p><ol>${r.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${r.note?`<p class="hint">${esc(r.note)}</p>`:''}</div>`).join('')}</div>`;
}
function stepCard(s,c,i){
  const no=`${s.n}-${i+1}`;
  const cond=c.cond&&c.prompts.length&&c.prompts.every(n=>s.cond.includes(n));
  const pins=c.pins.map((p,k)=>`<span class="pin" style="left:${(p.x/8).toFixed(2)}%;top:${(p.y/4.5).toFixed(2)}%">${k+1}</span>`).join('');
  const todo=c.pins.map((p,k)=>`<li><span class="n">${k+1}</span><span>${esc(p.t)}</span></li>`).join('');
  const prompts=c.prompts.map(n=>promptHTML(n,s.cond.includes(n))).join('');
  const pe=(PE[s.n]&&c.prompts.some(n=>n===1||n===5))?`<div class="four"><h5>이 요청에 들어 있는 네 가지</h5><dl>${PE[s.n].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`:'';
  return `<article class="stepcard${cond?' cond':''}" id="s${s.n}-${i+1}">
   <header class="shead"><span class="sno">${no}</span><h4>${esc(c.title)}</h4><span class="stool">${esc(c.tool)}</span>${cond?'<span class="scond">필요할 때만</span>':''}</header>
   <div class="sgrid">
    <figure class="shot"><div class="stage-box"><img class="cap" data-src="captures/${c.id}.png" alt="${esc(c.title)} 실제 화면"><div class="wire"><svg viewBox="0 0 800 450" role="img" aria-label="${esc(c.title)} 화면 구성도" xmlns="http://www.w3.org/2000/svg">${(WIRE[c.wire]||WIRE.chat)()}</svg></div>${pins}</div><figcaption class="wcap">설명용 그림 · 실제 화면과 메뉴 위치가 다를 수 있습니다</figcaption></figure>
    <div class="sbody"><h5>이 화면에서 할 일</h5><ol class="todo">${todo}</ol>${c.actions.length?`<ul class="notes">${c.actions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`:''}</div>
   </div>
   ${prompts}${pe}
   ${c.id==='cap-10'?'%%MEMO%%':''}
   ${c.check?`<p class="next"><b>다음 단계로 가기 전에</b>${esc(c.check)}</p>`:''}
   ${c.fallback?`<p class="stuck"><b>막히면</b>${esc(c.fallback)}</p>`:''}
  </article>`;
}
function chapter(s){
  const all=[...new Set([...s.prompts,...s.cond])].sort((a,b)=>a-b);
  const pe=PE[s.n]?`<div class="four"><h4>이 요청에 들어 있는 네 가지</h4><dl>${PE[s.n].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`:'';
  let extra='';
  if(s.n===3) extra=`<div class="tool-box"><h4>경쟁사 메모</h4><p class="hint">공식 사이트를 직접 열어 확인한 내용만 적습니다. 이 브라우저에 자동 저장되며, 4장 요청 ⑦에 불러올 수 있습니다. 세 번째 경쟁사는 선택입니다.</p>${[1,2,3].map(k=>`<fieldset><legend>경쟁사 ${k}${k===3?' (선택)':''}</legend>${[['name','회사·서비스 이름','예: ○○ 산업자재 온라인몰'],['target','대상 고객','누가 쓰는 서비스인가요?'],['feature','주요 기능과 제공 방식','무엇을 어떻게 제공하나요?'],['strength','강점','고객이 좋아할 점'],['weak','약점·한계','부족한 점, 확인 못 한 점'],['url','원문 주소(URL)','내가 직접 열어 본 주소']].map(([f,l,ph])=>`<label for="m${k}${f}">${l}</label><textarea id="m${k}${f}" data-memo rows="2" placeholder="${ph}"></textarea>`).join('')}<label class="inline"><input type="checkbox" id="m${k}open" data-memo> 공식 사이트를 직접 열어 봤어요 (안 열었으면 「원문 미확인」으로 들어갑니다)</label></fieldset>`).join('')}<label for="mlearn">우리가 배울 점</label><textarea id="mlearn" data-memo rows="2" placeholder="경쟁사에서 가져올 좋은 점 한 줄"></textarea><label for="mdiff">우리가 다르게 할 점</label><textarea id="mdiff" data-memo rows="2" placeholder="엔지비기업의 강점으로 다르게 할 점 한 줄"></textarea><button type="button" class="copy wide" id="copymemo">경쟁사 메모 복사</button></div>`;
  if(s.n===8) extra=`<div class="tool-box"><h4>실습기록표</h4><p class="hint">도구가 안 돼서 다른 방법으로 한 부분은 「대체 실습」에 체크합니다.</p><div class="scroll"><table class="log"><thead><tr><th>장</th><th>하는 일</th><th>완료</th><th>대체 실습</th></tr></thead><tbody>${STEPS.map(t=>`<tr><td>${t.n}</td><td>${t.title}</td><td><input type="checkbox" id="log${t.n}done" data-keep aria-label="${t.n}장 완료"></td><td><input type="checkbox" id="log${t.n}alt" data-keep aria-label="${t.n}장 대체 실습"></td></tr>`).join('')}</tbody></table></div><label for="takeaway">내 업무에 써 볼 한 가지</label><textarea id="takeaway" data-keep rows="2" placeholder="예: 반복 문의 답변 초안을 만들 때 [가설]과 출처를 구분해 쓰기"></textarea></div>`;
  const caps=CAPS.filter(c=>c.stage===s.n);
  const e=EX[s.n];
  return `<section class="chap" id="${SLUG[s.n]}" aria-labelledby="h${s.n}">
  <header class="chead"><div class="cno">${s.n}</div><div class="cmeta"><p class="eyebrow">${s.cs}차시 · ${s.n}장 · 약 ${s.min}분</p><h2 id="h${s.n}">${esc(s.title)}</h2><p class="tools">${esc(s.tool)}</p></div></header>
  <p class="req"><span>요청서</span>${esc(s.req)}</p>
  <div class="cbody">
   <div class="col-main">
    <h3>이번에 할 일</h3><p class="goal">${esc(s.goal)}</p>
    <h3>단계 한눈에</h3><ol class="steplist">${caps.map((c,i)=>`<li><a href="#s${s.n}-${i+1}"><b>${s.n}-${i+1}</b> ${esc(c.title)}</a></li>`).join('')}</ol>
   </div>
   <aside class="col-side">
    ${FILES[s.n]?`<div class="files"><h4>이 장에서 쓰는 파일</h4><ul>${FILES[s.n].map(([f,k,why])=>`<li><span class="ftag ${k==='업로드'?'up':''}">${k}</span><span class="fname">${f}</span><button type="button" class="dl" data-dl="${f}">받기</button><small>${why}</small></li>`).join('')}</ul><p class="file">폴더: <code>02_실습파일/</code></p></div>`:''}
    <div class="ok"><h4>이렇게 나오면 성공</h4>${s.ok.map((x,i)=>`<label class="chk" for="ok${s.n}_${i}"><input type="checkbox" id="ok${s.n}_${i}" data-keep> <span>${esc(x)}</span></label>`).join('')}</div>
    <div class="fb"><h4>안 되면</h4><ul>${s.fb.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
    <details><summary>도구가 안 될 때 쓰는 예시</summary><p class="hint">강사가 쓴 교육용 예시입니다. AI 실행 결과가 아니니, 쓴 경우 실습기록표에 「대체 실습」으로 표시하세요.</p><pre class="ex">${esc(e.body)}</pre><button type="button" class="ghost" data-copyex="${s.n}">예시 복사</button></details></div>
   </aside>
  </div>
  <div class="steps-wrap">${caps.map((c,i)=>stepCard(s,c,i)).join('').replace('%%MEMO%%',s.n===3?extra:'')}</div>
  ${s.n===8?extra:''}${altHTML(s.n)}
  </section>`;
}
const css=fs.readFileSync(__dirname+'/guide.css','utf8');
const FLOW1=fs.readFileSync(__dirname+'/flow1.svg.html','utf8');
const FLOW2=fs.readFileSync(__dirname+'/flow2.svg.html','utf8');
const FIG2=`<figure class="flowfig" id="flow2"><h3>2차시 흐름 — 기획서를 다듬어 발표자료로</h3><div class="flowwrap">${FLOW2}</div><figcaption>5장에서 검토 의견 중 사람이 고른 것만 반영해 최종 기획서를 만들고, 6장에서 8장 원고로 Gamma 발표자료를 만들고, 7장에서 그림·배치·글을 한 번씩 고쳐 PPTX로 받은 뒤, 8장에서 소개와 질문으로 마무리합니다.</figcaption></figure>`;
const js=fs.readFileSync(__dirname+'/guide.client.js','utf8');
// 실습파일 4개를 zip 하나로 (한글 파일명 UTF-8 표시)
const ZIPB64=require('child_process').execFileSync('python3',['-c',`import sys,io,zipfile,base64,glob,os,unicodedata
b=io.BytesIO()
with zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(glob.glob(os.path.join(sys.argv[1],'*.docx'))):
        z.write(f,'엔지비기업_실습파일/'+unicodedata.normalize('NFC',os.path.basename(f)))
print(base64.b64encode(b.getvalue()).decode())`,require('path').join(ROOT,'02_실습파일')]).toString().trim();
const ALLFILES=Object.entries(FILES).map(([n,arr])=>arr.map(([f,k])=>`<li><b>${n}장</b>${esc(f.replace(/^\d장_/,'').replace('.docx',''))}<span>${k}</span></li>`).join('')).join('');

// 부록: 업무에 더 쓰기
const APPXFILE='부록_천재적사고_프롬프트.txt';
const APPXCOPY={
 'A-1':'우리 회사는 [회사·업종 한 줄 소개]이고, 나는 [부서]에서 [담당 업무]를 맡고 있어. 자주 하는 일은 [반복 업무 2~3개]야. 이 업무에 바로 쓸 수 있는 ChatGPT 프롬프트 5개를 만들어 줘. 각 프롬프트에 언제 쓰는지와 [대괄호]로 바꿀 자리를 표시해 줘.',
 'A-2':'- 주제 또는 문제: 엔지비기업의 기존 거래처를 활용한 신사업 아이디어\n- 달성 목표: 4주 안에 작게 시험해 볼 수 있는 신사업 1개 선정\n- 대상 또는 이해관계자: 해외 설비·유지보수 업체 구매 담당자, 영업팀\n- 현재 상황과 보유 자료: 해외 거래처망, 국내 부품 공급처, 수출 실무 경험\n- 제약조건: 예산 적음, 인력 2명, 4주\n- 원하는 결과물: 전략안'
};
const TOOLS_ROWS=[
 ['글 쓰기·문서 초안·요약, 여러 업무를 두루','ChatGPT','Canvas로 문서를 고치고, GPT(맞춤 챗봇)로 반복 업무를 정형화하기 좋습니다.'],
 ['Google 문서·Gmail·Drive와 이어지는 업무','Gemini','Docs로 내보내기 등 Google 도구와 바로 이어집니다. 오늘 Canvas 실습에서 사용했습니다.'],
 ['긴 문서 읽기, 보고서 다듬기, 꼼꼼한 검토','Claude','긴 자료를 한 번에 넣고 구조·논리·문장을 검토하는 데 좋습니다.'],
 ['최신 정보 검색, 경쟁사 조사, 출처 확인','Perplexity','답마다 출처 링크가 붙어 원문을 바로 확인할 수 있습니다. 오늘 3장에서 사용했습니다.'],
 ['발표자료 만들기','Gamma (안 되면 미리캔버스)','원고를 넣으면 슬라이드 초안을 만들어 줍니다. 오늘 6·7장에서 사용했습니다.'],
];
const APPENDIX=`<section class="chap appx" id="appendix" aria-labelledby="happx">
 <header class="chead"><div class="cno">+</div><div class="cmeta"><p class="eyebrow">부록 · 수업 후 업무에 더 쓰기</p><h2 id="happx">업무에 바로 쓰는 AI 도구와 프롬프트</h2><p class="tools">ChatGPT GPT · 천재적 사고 프롬프트 · 도구 고르는 법</p></div></header>
 <div class="steps-wrap">
 <article class="stepcard" id="ax-1"><header class="shead"><span class="sno">부록 1</span><h4>ChatGPT 업무 프롬프트 GPT</h4><span class="stool">ChatGPT</span></header>
  <p>회사와 내가 하는 업무를 알려 주면, 그 업무에 맞는 프롬프트를 만들어 주는 GPT입니다.</p>
  <p><a class="extlink" href="https://chatgpt.com/g/g-h5aUtVu0G-chatgpt-use-cases-for-work" target="_blank" rel="noopener">ChatGPT 업무 프롬프트 GPT 열기 ↗</a></p>
  <h5>사용 방법</h5>
  <ol class="todo2"><li>위 링크를 열고 ChatGPT에 로그인합니다.</li><li>아래 요청문을 복사해 [대괄호]를 내 회사·업무로 바꿔 보냅니다.</li><li>받은 프롬프트 중 마음에 드는 것을 새 채팅에 붙여 실제 업무에 써 봅니다.</li><li>결과가 막연하면 "더 구체적으로, 예시와 함께"라고 이어서 요청합니다.</li></ol>
  <div class="prompt"><div class="pbar"><span class="pno">↳</span><span class="ptitle">GPT에 보낼 요청문</span><button type="button" class="copy" data-follow="A-1">복사</button></div><pre>${esc(APPXCOPY['A-1'])}</pre></div>
  <p class="stuck"><b>주의</b>실제 고객 정보·회사 기밀은 넣지 않습니다. GPT 이용 한도는 계정 종류에 따라 다를 수 있습니다.</p>
 </article>
 <article class="stepcard" id="ax-2"><header class="shead"><span class="sno">부록 2</span><h4>천재적 사고 프롬프트</h4><span class="stool">ChatGPT · Gemini · Claude</span></header>
  <p>한 가지 문제를 10가지 사고 틀 중 2개로 분석해, 아이디어 10개와 우선순위, 실행계획까지 받는 프롬프트입니다. 신사업 아이디어, 업무 개선, 기획안 구상에 씁니다.</p>
  <div class="files"><ul><li><span class="ftag">txt</span><span class="fname">${APPXFILE}</span><button type="button" class="dl" data-dl="${APPXFILE}">받기</button><small>메모장으로 열어 전체를 복사해 씁니다</small></li></ul></div>
  <h5>사용 방법</h5>
  <ol class="todo2"><li>파일을 받아 메모장으로 열고 <b>전체를 복사</b>합니다 (Ctrl+A → Ctrl+C).</li><li>ChatGPT·Gemini·Claude 중 하나의 <b>새 채팅</b>에 붙여넣습니다.</li><li>맨 아래 「5. 사용자 입력」의 6칸(주제, 목표, 대상, 현재 상황, 제약조건, 원하는 결과물)을 내 내용으로 바꿉니다.</li><li>보내면 핵심 결론 → 아이디어 10개 → 우선순위 비교표 → 추천 3개 → 실행계획 순서로 답이 옵니다.</li><li>마음에 드는 아이디어는 "○번 아이디어를 2주 실험 계획으로 더 자세히" 처럼 이어서 요청합니다.</li></ol>
  <div class="prompt"><div class="pbar"><span class="pno">↳</span><span class="ptitle">「5. 사용자 입력」 채운 예시 (엔지비기업)</span><button type="button" class="copy" data-follow="A-2">복사</button></div><pre>${esc(APPXCOPY['A-2'])}</pre></div>
  <p class="stuck"><b>주의</b>프롬프트의 공식은 생각을 정리하는 틀이지 계산식이 아닙니다. 나온 수치·사례는 사실인지 따로 확인합니다.</p>
 </article>
 <article class="stepcard" id="ax-3"><header class="shead"><span class="sno">부록 3</span><h4>업무 목적에 맞게 AI 도구 고르기</h4><span class="stool">ChatGPT · Gemini · Claude · Perplexity</span></header>
  <p>하나만 고집하지 말고, 할 일에 맞는 도구를 고릅니다. 헷갈리면 아래 세 가지를 차례로 물어보세요.</p>
  <ol class="todo2"><li><b>최신 정보나 출처가 필요한가?</b> → Perplexity로 찾고 원문을 확인합니다.</li><li><b>쓰거나 고칠 문서가 있는가?</b> → ChatGPT 또는 Gemini의 Canvas, 긴 문서 검토는 Claude.</li><li><b>결과를 어디서 쓰는가?</b> → Google 문서·메일이면 Gemini, 발표자료면 Gamma.</li></ol>
  <div class="scroll"><table class="log tooltable"><thead><tr><th>이런 일을 할 때</th><th>추천 도구</th><th>이유</th></tr></thead><tbody>${TOOLS_ROWS.map(([a,b,c])=>`<tr><td>${esc(a)}</td><td><b>${esc(b)}</b></td><td>${esc(c)}</td></tr>`).join('')}</tbody></table></div>
  <p class="next"><b>팁</b>같은 요청을 두 도구에 보내 결과를 비교해 보면, 내 업무에 맞는 도구가 금방 보입니다. 기능과 무료 사용 한도는 자주 바뀌니 쓰기 전에 확인하세요.</p>
 </article>
 </div>
</section>`;
const CSNAME={1:'아이디어와 리서치',2:'기획서와 발표자료'};
const nav=`<nav class="toc" aria-label="목차">
<a class="tbasic" href="#basics" data-sec="basics">시작 전에</a>
${[1,2].map(c=>`<p class="tg"><span>${c}차시</span>${CSNAME[c]}</p>${c===2?'<a class="tflow" href="#flow2" data-sec="flow2">2차시 흐름</a>':''}${STEPS.filter(s=>s.cs===c).map(s=>`<div class="tch" data-chap="${SLUG[s.n]}"><a class="tchap" href="#${SLUG[s.n]}" data-sec="${SLUG[s.n]}"><b>${s.n}</b><span>${esc(s.title)}</span></a><ol class="tsteps">${CAPS.filter(x=>x.stage===s.n).map((x,i)=>`<li><a href="#s${s.n}-${i+1}" data-step="s${s.n}-${i+1}"><b>${s.n}-${i+1}</b>${esc(x.title)}</a></li>`).join('')}</ol></div>`).join('')}`).join('')}
<p class="tg"><span>부록</span>업무에 더 쓰기</p><div class="tch" data-chap="appendix"><a class="tchap" href="#appendix" data-sec="appendix"><b>+</b><span>업무에 바로 쓰는 AI 도구와 프롬프트</span></a><ol class="tsteps"><li><a href="#ax-1" data-step="ax-1"><b>1</b>ChatGPT 업무 프롬프트 GPT</a></li><li><a href="#ax-2" data-step="ax-2"><b>2</b>천재적 사고 프롬프트</a></li><li><a href="#ax-3" data-step="ax-3"><b>3</b>AI 도구 고르기</a></li></ol></div>
</nav>`;
const html=`<title>엔지비기업 AI 실습 가이드</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>${css}</style>
<div class="mtoc"><button type="button" id="tocbtn" aria-expanded="false" aria-controls="side"><span class="mlabel">목차</span><span id="tocnow">시작 전에</span><span class="caret" aria-hidden="true">▾</span></button></div>
<div class="shell">
<aside class="side" id="side"><p class="sidetitle">엔지비기업 AI 실습</p>${nav}</aside>
<main class="wrap" id="top">
<header class="top">
 <p class="eyebrow">현대엔지비 · 생성형 AI 기초 실습 · 2차시</p>
 <h1>엔지비기업 AI 실습 가이드</h1>
 <p class="lead">가상의 무역·납품 업체 「엔지비기업」이 기존 강점을 살려 시작할 신사업을 AI와 함께 기획합니다. 아이디어를 찾고, 경쟁사를 조사해 벤치마킹하고, 신사업 기획서를 완성한 뒤 발표자료 8장을 만듭니다. 장마다 순서대로 따라 하고, 요청문은 「복사」 버튼으로 붙여넣으세요.</p>
 <div class="allfiles"><div class="aftext"><p class="aftitle">실습파일 4개</p><ul>${ALLFILES}</ul></div><button type="button" class="dlall" data-dlzip="1">한 번에 받기 <small>zip</small></button></div>
 <ul class="outcome"><li><span>결과물 1</span>최종 보고서 1개 (docx 또는 PDF)</li><li><span>결과물 2</span>발표자료 8장 (PPTX)</li><li><span>도구</span>Gemini 또는 ChatGPT · Perplexity · Gamma 무료 계정</li></ul>
</header>
<section class="basics" id="basics" aria-labelledby="hb">
 <h2 id="hb">시작 전에</h2>
 <div class="bgrid">
  <div><h3>좋은 요청의 네 가지</h3><dl class="fourtable"><div><dt>상황</dt><dd>누구의 어떤 상황인지</dd></div><div><dt>할 일</dt><dd>AI가 해야 할 일</dd></div><div><dt>형식</dt><dd>답을 받을 모양 (표, 카드)</dd></div><div><dt>조건</dt><dd>지킬 것과 하지 말 것</dd></div></dl><p class="hint">1장과 3장에서 실제 요청문에 이 네 가지가 어떻게 들어 있는지 확인합니다.</p></div>
  <div><h3>공통 약속</h3><ul class="rules"><li>요청문은 통째로 복사해서 <b>한 번만</b> 보냅니다.</li><li><mark>[대괄호]</mark>는 내 결과로 바꿀 자리입니다.</li><li>「필요할 때만」 요청은 문제가 있을 때만 씁니다.</li><li>모르는 것은 [가설], 확인 못 한 것은 「미확인」으로 남깁니다.</li><li>실제 고객 정보·회사 기밀은 넣지 않습니다. 유료 가입은 하지 않습니다.</li><li>시간은 참고용입니다. 결과 문장이 강사와 달라도 괜찮습니다.</li></ul></div>
 </div>
<figure class="flowfig"><h3>1차시 흐름 — 아이디어는 이렇게 찾습니다</h3><div class="flowwrap">${FLOW1}</div><figcaption>1장에서 회사 강점을 바탕으로 아이디어를 5개로 넓혔다가 1개로 좁히고, 3장에서 경쟁사를 확인해 배울 점과 다르게 할 점을 찾은 뒤, 4장에서 같은 기획서에 합칩니다.</figcaption></figure>
</section>
${STEPS.map(s=>(s.n===5?FIG2:'')+chapter(s)).join('\n')}
${APPENDIX}
<footer class="foot">교육용 가상사례 · 강사 예시는 AI 실행 결과가 아닙니다 · 화면 메뉴 이름은 날짜와 계정에 따라 다를 수 있습니다</footer>
</main>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>const ZIPDATA="${ZIPB64}";
const FILEDATA=${JSON.stringify(Object.fromEntries(Object.entries(FILES).flatMap(([n,arr])=>arr.map(([f])=>[f,fs.readFileSync(require('path').join(ROOT,'02_실습파일',f)).toString('base64')])).concat([[APPXFILE,fs.readFileSync(require('path').join(ROOT,'02_실습파일',APPXFILE)).toString('base64')]])))};
const PROMPTS=${JSON.stringify(P)};const FOLLOWS=${JSON.stringify(Object.fromEntries(Object.entries(FOLLOW).flatMap(([n,arr])=>arr.map(([nm,t],k)=>[n+'-'+k,t])).concat(Object.entries(APPXCOPY))))};const EXAMPLES=${JSON.stringify(Object.fromEntries(Object.entries(EX).map(([k,v])=>[k,v.body])))};
${js}</script>`;
fs.writeFileSync(require('path').join(__dirname,'.artifact.html'),html);
fs.writeFileSync(ROOT+'01_실습가이드.html','<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+html.replace('<div class="wrap">','</head>\n<body>\n<div class="wrap">')+'\n</body>\n</html>\n');
// youni365.top 사이트용: 파일을 사이트 경로(assets/downloads/)의 일반 다운로드 링크로 바꾼다
const enc=f=>'assets/downloads/'+encodeURIComponent(f);
const site=html
  .replace(/<button type="button" class="dl" data-dl="([^"]+)">받기<\/button>/g,(m,f)=>`<a class="dl" href="${enc(f)}" download="${f}">받기</a>`)
  .replace('<button type="button" class="dlall" data-dlzip="1">','<a class="dlall" href="'+enc('엔지비기업_실습파일.zip')+'" download="엔지비기업_실습파일.zip">').replace(/한 번에 받기 <small>zip<\/small><\/button>/,'한 번에 받기 <small>zip</small></a>')
  .replace(/<link rel="preconnect"[^\n]*\n<link rel="stylesheet" href="https:\/\/fonts[^\n]*\n/,'');
const SITE=require('path').join(__dirname,'site');fs.mkdirSync(SITE+'/assets/downloads',{recursive:true});
fs.writeFileSync(SITE+'/index.html','<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+site+'\n</html>\n');
fs.writeFileSync(SITE+'/assets/downloads/엔지비기업_실습파일.zip',Buffer.from(ZIPB64,'base64'));
fs.copyFileSync(require('path').join(ROOT,'02_실습파일',APPXFILE),SITE+'/assets/downloads/'+APPXFILE);
for(const arr of Object.values(FILES))for(const [f] of arr)fs.copyFileSync(require('path').join(ROOT,'02_실습파일',f),SITE+'/assets/downloads/'+f);
console.log('ok',html.length);
