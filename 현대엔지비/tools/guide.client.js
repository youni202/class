const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem('hg:'+k)}catch(e){return null}},set(k,v){try{localStorage.setItem('hg:'+k,v)}catch(e){}}};
const toast=$('#toast');let tt;
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),1800)}
async function copyText(text,btn,msg){
  let ok=true;
  try{await navigator.clipboard.writeText(text)}catch(e){
    ok=false;const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{ok=document.execCommand('copy')}catch(_){}ta.remove();
  }
  if(ok){say(msg||'복사했습니다. 입력창에 붙여넣으세요');if(btn){const o=btn.textContent;btn.textContent='복사됨';btn.classList.add('done');setTimeout(()=>{btn.textContent=o;btn.classList.remove('done')},1600)}}
  else say('복사가 막혔습니다. 요청문을 드래그해서 복사해 주세요');
}
function buildPrompt(n){
  let t=PROMPTS[n-1];
  $$(`.prompt[data-p="${n}"] textarea[data-ph]`).forEach(f=>{const v=f.value.trim();if(v)t=t.split(f.dataset.ph).join(v)});
  return t;
}
function memoText(){
  const g=id=>($('#'+id)?.value||'').trim();
  const rows=[1,2,3].map(k=>{
    if(!g('m'+k+'name')&&!g('m'+k+'feature'))return '';
    const opened=$('#m'+k+'open')?.checked;
    return `경쟁사 ${k}: ${g('m'+k+'name')||'(이름 없음)'}\n- 대상 고객: ${g('m'+k+'target')||'미확인'}\n- 주요 기능: ${g('m'+k+'feature')||'미확인'}\n- 강점: ${g('m'+k+'strength')||'미확인'}\n- 약점·한계: ${g('m'+k+'weak')||'미확인'}\n- 출처: ${g('m'+k+'url')||'(없음)'} (${opened?'공식 사이트 직접 확인':'원문 미확인'})`;
  }).filter(Boolean);
  return (rows.length?rows.join('\n\n'):'(경쟁사 메모 없음)')+`\n\n우리가 배울 점: ${g('mlearn')||'(비어 있음)'}\n우리가 다르게 할 점: ${g('mdiff')||'(비어 있음)'}`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.copy)copyText(buildPrompt(+b.dataset.copy),b);
  else if(b.dataset.follow)copyText(FOLLOWS[b.dataset.follow],b,'후속 요청을 복사했습니다');
  else if(b.dataset.copyex)copyText(EXAMPLES[b.dataset.copyex],b,'예시를 복사했습니다');
  else if(b.id==='copymemo')copyText(memoText(),b,'경쟁사 메모를 복사했습니다');
  else if(b.dataset.loadmemo){const f=$('#'+b.dataset.loadmemo);if(f){f.value=memoText();f.dispatchEvent(new Event('input',{bubbles:true}));say('3장 경쟁사 메모를 넣었습니다')}}
});
// 입력값·체크 상태를 이 브라우저에 보관
$$('textarea,input[type=checkbox]').forEach(el=>{
  const v=store.get(el.id);
  if(v!==null){if(el.type==='checkbox')el.checked=v==='1';else el.value=v}
  el.addEventListener(el.type==='checkbox'?'change':'input',()=>store.set(el.id,el.type==='checkbox'?(el.checked?'1':'0'):el.value));
});

// 실제 캡처가 있으면 설명용 그림 대신 보여 준다
$$('.shot img[data-src]').forEach(img=>{
  img.onload=()=>img.closest('.shot').classList.add('has');
  img.src=img.dataset.src;
});

// 장별 파일 받기: 온라인 가이드는 downloads 기능, 로컬 HTML은 브라우저 다운로드
function fileBlob(name){const b=atob(FILEDATA[name]);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  return new Blob([u],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})}
let dlNs; const dlReady=(window.claude&&window.claude.use)?window.claude.use('downloads').then(n=>dlNs=n).catch(()=>dlNs=null):Promise.resolve(null);
function b64Blob(b64,type){const b=atob(b64);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new Blob([u],{type})}
document.addEventListener('click',async e=>{
  const b=e.target.closest('button[data-dl],button[data-dlzip]');if(!b)return;
  const zip=!!b.dataset.dlzip;
  const name=zip?'엔지비기업_실습파일.zip':b.dataset.dl;const blob=zip?b64Blob(ZIPDATA,'application/zip'):fileBlob(name);
  if(window.claude&&window.claude.use){
    await dlReady;
    if(dlNs){try{await dlNs.save({filename:name,data:blob});say(name+' 받기를 시작했습니다')}catch(err){say(err&&err.code==='declined'?'받기를 취소했습니다':'이 화면에서는 파일을 받을 수 없습니다. 강사에게 파일을 요청하세요')}return}
  }
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);say(name+' 받기를 시작했습니다');
});

// 목차: 모바일 열고 닫기
const side=$('#side'),tocbtn=$('#tocbtn');
function setToc(open){side.classList.toggle('open',open);tocbtn.setAttribute('aria-expanded',open?'true':'false')}
tocbtn.addEventListener('click',()=>setToc(!side.classList.contains('open')));
side.addEventListener('click',e=>{if(e.target.closest('a')&&matchMedia('(max-width:960px)').matches)setToc(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&side.classList.contains('open')){setToc(false);tocbtn.focus()}});
// 목차: 지금 보는 장·단계 표시
const secLinks=$$('.toc a[data-sec]'),stepLinks=$$('.toc a[data-step]');
function markSec(id){
  secLinks.forEach(a=>a.classList.toggle('on',a.dataset.sec===id));
  $$('.tch').forEach(t=>t.classList.toggle('active',t.dataset.chap===id));
  const a=secLinks.find(a=>a.dataset.sec===id);if(a)$('#tocnow').textContent=a.textContent.replace(/^(\d)/,'$1장 ');
}
function markStep(id){stepLinks.forEach(a=>a.classList.toggle('now',a.dataset.step===id))}
if('IntersectionObserver' in window){
  const secIO=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)markSec(e.target.id)})},{rootMargin:'-20% 0px -70% 0px'});
  ['basics','flow2',...$$('.chap').map(s=>s.id)].forEach(id=>{const el=document.getElementById(id);if(el)secIO.observe(el)});
  const stepIO=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)markStep(e.target.id)})},{rootMargin:'-25% 0px -65% 0px'});
  $$('.stepcard').forEach(s=>stepIO.observe(s));
}
markSec('basics');
