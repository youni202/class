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
  return [1,2].map(k=>{
    const g=f=>($('#m'+k+f)?.value||'').trim();const opened=$('#m'+k+'open')?.checked;
    return `근거 메모 ${k}\n- 확인한 내용: ${g('fact')||'(비어 있음)'}\n- 제목과 날짜: ${g('title')||'날짜 미표시'}\n- 원문 주소: ${g('url')||'(없음)'}\n- 쓸 곳과 한계: ${g('limit')||'(비어 있음)'}\n- 원문 확인: ${opened?'직접 열어 확인함':'원문 미확인'}`;
  }).join('\n\n');
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.copy)copyText(buildPrompt(+b.dataset.copy),b);
  else if(b.dataset.copyex)copyText(EXAMPLES[b.dataset.copyex],b,'예시를 복사했습니다');
  else if(b.id==='copymemo')copyText(memoText(),b,'근거 메모를 복사했습니다');
  else if(b.dataset.loadmemo){const f=$('#'+b.dataset.loadmemo);if(f){f.value=memoText();f.dispatchEvent(new Event('input',{bubbles:true}));say('3장 근거 메모를 넣었습니다')}}
});
// 입력값·체크 상태를 이 브라우저에 보관
$$('textarea,input[type=checkbox]').forEach(el=>{
  const v=store.get(el.id);
  if(v!==null){if(el.type==='checkbox')el.checked=v==='1';else el.value=v}
  el.addEventListener(el.type==='checkbox'?'change':'input',()=>store.set(el.id,el.type==='checkbox'?(el.checked?'1':'0'):el.value));
});

// 실제 캡처가 있으면 보여 주고, 없으면 자리를 숨긴 채로 둔다
$$('.shot img[data-src]').forEach(img=>{
  img.onload=()=>{const f=img.closest('.shot');f.hidden=false;f.closest('.shots').hidden=false};
  img.src=img.dataset.src;
});
