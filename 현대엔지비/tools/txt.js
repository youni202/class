const fs=require('fs');const {P,M,STEPS}=require('./content.js');
const OUT=require('path').join(__dirname,'..','실습자료')+'/';
let s='현대엔지비 무료 실습 프롬프트 16개\n\n「입력 시작」과 「입력 끝」 사이만 통째로 복사해 한 번만 보냅니다.\n[대괄호] 자리는 내 결과로 바꿉니다. 「필요할 때만」은 문제가 있을 때만 씁니다.\n모든 사례는 교육용 가상사례입니다. 실제 고객 정보·회사 기밀은 넣지 않습니다.\n';
for(const st of STEPS){
 s+=`\n\n==================================================\n${st.cs}차시 · ${st.n}단계 · ${st.title}  (${st.tool})\n==================================================\n`;
 const all=[...new Set([...st.prompts,...st.cond])].sort((a,b)=>a-b);
 for(const n of all){ s+=`\n요청 ${M[n-1]}${st.cond.includes(n)?'  (필요할 때만)':''}\n\n입력 시작\n${P[n-1]}\n입력 끝\n`; }
}
fs.writeFileSync(OUT+'현대엔지비_무료실습_16개프롬프트.txt',s);
console.log((s.match(/입력 시작/g)||[]).length);
