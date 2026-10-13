// 실습 장별 업로드 자료와 양식(docx)을 만든다: node tools/forms.js
const fs=require('fs'),path=require('path');
const d=require('docx');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,Header,Footer,PageNumber,LevelFormat}=d;
const {STEPS}=require('./content.js');
const OUT=path.join(__dirname,'..','02_실습파일');
const FONT='Malgun Gothic',NAVY='0E5A66',GRAY='5A6764',AMBER='A85F0C';
const W=9026;
const t=(text,o={})=>new TextRun({text,font:FONT,size:o.size||21,bold:o.bold,color:o.color});
const p=(runs,o={})=>new Paragraph({children:Array.isArray(runs)?runs:[t(runs,o)],spacing:{before:o.before??0,after:o.after??100,line:300},numbering:o.num,keepNext:o.keepNext,alignment:o.align});
const title=s=>p([t(s,{size:36,bold:true,color:NAVY})],{after:100});
const meta=s=>p([t(s,{size:19,color:GRAY})],{after:200});
const h=(s,c=NAVY)=>p([t(s,{size:24,bold:true,color:c})],{before:240,after:90,keepNext:true});
const B={style:BorderStyle.SINGLE,size:4,color:'D5DCE3'};const borders={top:B,bottom:B,left:B,right:B};
const cell=(c,w,fill,head)=>new TableCell({width:{size:w,type:WidthType.DXA},borders,shading:fill?{type:ShadingType.CLEAR,color:'auto',fill}:undefined,margins:{top:80,bottom:80,left:120,right:120},
  children:(Array.isArray(c)?c:[c]).map(x=>typeof x==='string'?p([t(x,{bold:head,color:head?'FFFFFF':(x.startsWith('예)')||x.startsWith('(')?'9AA7B3':undefined),size:head?20:20})],{after:40}):x)});
const table=(rows,widths,head=true)=>new Table({width:{size:W,type:WidthType.DXA},columnWidths:widths,rows:rows.map((r,i)=>new TableRow({tableHeader:head&&i==0,children:r.map((c,j)=>cell(c,widths[j],head&&i==0?NAVY:(j==0&&!head?'EEF5F4':undefined),head&&i==0))}))});
const numbering={config:[{reference:'b',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:420,hanging:260}}}}]},{reference:'n',levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:420,hanging:300}}}}]},{reference:'c',levels:[{level:0,format:LevelFormat.BULLET,text:'☐',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:420,hanging:300}}}}]}]};
const li=(s,ref='b')=>p(s,{num:{reference:ref,level:0},after:60});
const header=new Header({children:[p([t('엔지비기업 AI 기초 실습  |  교육용 가상자료',{size:17,color:GRAY})])]});
const footer=new Footer({children:[p([t('실제 회사·거래처 정보가 아닙니다  |  ',{size:17,color:GRAY}),new TextRun({children:[PageNumber.CURRENT],font:FONT,size:17,color:GRAY})],{align:AlignmentType.RIGHT})]});
const save=async(rel,children)=>{const f=path.join(OUT,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,await Packer.toBuffer(new Document({styles:{default:{document:{run:{font:FONT,size:21}}}},numbering,sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1200,bottom:1100,left:1440,right:1440}}},headers:{default:header},footers:{default:footer},children}]})));console.log('wrote',rel)};
const blank=(n=1)=>Array.from({length:n},()=>p('',{after:240}));

(async()=>{
// 1장 업로드 자료: 회사 소개 (신사업 아이디어의 배경 정보)
await save('1장_엔지비기업_회사소개.docx',[
 title('엔지비기업 회사소개'),meta('1장에서 AI 채팅에 첨부하는 자료입니다. 교육용으로 만든 가상 회사이며, 매출·인원 같은 숫자는 일부러 넣지 않았습니다.'),
 h('어떤 회사인가요'),
 li('국내 제조사에서 산업용 부품을 구매해 해외 거래처에 납품해 온 중소 무역·납품 업체입니다.'),
 li('주요 품목은 기계·설비에 들어가는 부품(베어링, 밸브, 체결 부품 등)입니다.'),
 li('주요 고객은 해외 설비 업체와 유지보수 업체입니다.'),
 h('우리 회사의 강점'),
 table([['강점','설명'],
  ['해외 거래처망','여러 나라의 설비·유지보수 업체와 오래 거래해 왔습니다.'],
  ['부품 소싱','국내 제조사들과 거래하며 품목별 공급처를 알고 있습니다.'],
  ['수출 실무','견적, 선적서류, 통관, 운송 일정을 직접 처리해 왔습니다.'],
  ['품질 대응','성적서·인증서 확인과 불량 대응 경험이 있습니다.']],[2400,6626]),
 h('부족한 점'),
 li('자체 생산 시설과 소프트웨어 개발 인력이 없습니다.'),
 li('온라인 마케팅과 브랜드 경험이 적습니다.'),
 h('신사업 조건'),
 li('지금의 강점(거래처망·소싱·수출 실무)을 살릴 것'),
 li('큰 설비 투자 없이 작게 시작할 수 있을 것'),
 li('4주 시범으로 고객 반응을 먼저 확인할 수 있을 것'),
 h('아직 모르는 것',AMBER),
 li('시장 규모, 예상 매출, 고객이 낼 수 있는 금액은 조사하지 않았습니다. AI 답변에서는 모두 [가설]로 다룹니다.'),
 p([t('실제 회사·거래처 이름과 계약 내용은 넣지 않습니다.',{size:19,color:GRAY})],{before:200}),
]);
// 3장 경쟁사 벤치마킹 양식
await save('3장_경쟁사_벤치마킹_양식.docx',[title('경쟁사 벤치마킹 양식'),meta('Perplexity 답변의 출처를 눌러 경쟁사 공식 사이트를 직접 확인한 내용만 적습니다. 세 번째 경쟁사는 선택입니다.'),
 table([['내 신사업 아이디어 (한 줄)',''],],[3000,6026],false),
 h('경쟁사 비교'),
 table([['항목','경쟁사 1','경쟁사 2','경쟁사 3 (선택)','우리 아이디어'],
  ['회사·서비스 이름','','','','엔지비기업 ○○'],['대상 고객','','','',''],['주요 기능·제공 방식','','','',''],['공개된 가격','','','',''],['강점','','','',''],['약점·한계','','','',''],['원문 URL','','','','—'],['직접 열어 봤나요?','☐ 예 ☐ 아니요','☐ 예 ☐ 아니요','☐ 예 ☐ 아니요','—']],[1900,1800,1800,1800,1726]),
 h('벤치마킹'),
 table([['우리가 배울 점',''],['우리가 다르게 할 점',''],['아직 확인 못 한 것','']],[2400,6626],false),
 p([t('경쟁사가 「이런 기능이 있다」는 것은 사실이지만, 「우리 고객이 돈을 낼 것」은 아직 가설입니다. 기획서에서는 [가설]로 표시합니다.',{size:19,color:GRAY})],{before:160})]);
// 5장 신사업 기획서 양식
const sec=(no,name,guide)=>[h(`${no}. ${name}`),p([t(guide,{size:19,color:'9AA7B3'})],{after:60}),...blank(2)];
await save('5장_신사업기획서_양식.docx',[
 title('신사업 기획서'),meta('[교육용 가상사례]  Canvas에서 다듬은 최종 기획서를 붙이거나, Canvas가 안 될 때 직접 씁니다.'),
 table([['항목','내용'],['사업 이름',''],['작성자',''],['작성일','']],[2400,6626]),
 ...sec(1,'사업 개요','어떤 신사업인지 한두 문장으로'),
 ...sec(2,'고객과 문제','누가(업종·규모·담당자), 어떤 문제를 겪고 있나요?'),
 ...sec(3,'해결 방법과 제공 가치','무엇을 제공하고, 엔지비기업의 어떤 강점을 활용하나요?'),
 h('4. 경쟁사와 차별점'),
 table([['구분','대상 고객','주요 기능','강점','약점'],['경쟁사 1','','','',''],['경쟁사 2','','','',''],['우리 아이디어','','','','']],[1700,1830,1830,1830,1836]),
 p([t('차별점은 4주 시범으로 검증할 [가설]입니다. 경쟁사 정보에는 출처를 붙입니다.',{size:19,color:'9AA7B3'})],{after:120}),
 ...sec(5,'수익 모델','돈을 어떻게 받나요? 가격과 지불 의향은 [가설]입니다.'),
 h('6. 4주 시범 계획'),
 table([['주차','할 일','확인할 것'],['1주 준비','',''],['2주 시범','',''],['3주 관찰','',''],['4주 평가','','']],[1600,3713,3713]),
 ...sec(7,'위험과 확인 질문','잘 안 될 수 있는 점과, 4주 동안 꼭 확인할 질문 2~3개'),
 h('출처'),
 table([['자료(회사·제목)','확인한 내용','URL'],['','',''],['','','']],[3000,3626,2400]),
]);
// 8장 실습기록표
await save('8장_실습기록표.docx',[title('실습기록표'),meta('도구가 안 돼서 다른 방법으로 한 부분은 「대체 실습」에 표시합니다.'),
 p([t('이름: ______________     사용한 도구:  ☐ Gemini   ☐ ChatGPT   ☐ Perplexity   ☐ Gamma',{size:20})],{after:160}),
 table([['장','하는 일','완료','대체 실습','메모'],...STEPS.map(s=>[String(s.n),s.title,'☐','☐',''])],[700,3926,900,1300,2200]),
 h('오늘 결과물'),li('사업기획서:  ☐ PDF (Google Docs에서 다운로드)   ☐ Word   (파일 이름: ______________ )','c'),li('발표자료 8장:  ☐ PPTX 내려받아 다시 열어 봄','c'),
 h('내 업무에 써 볼 한 가지'),...blank(3)]);
})();
