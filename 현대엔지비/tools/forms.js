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
// 1장 업로드 자료
await save('1장_엔지비기업_상황자료.docx',[
 title('엔지비기업 상황자료'),meta('1장에서 AI 채팅에 첨부하는 자료입니다. 교육용으로 만든 가상 회사이며, 숫자는 일부러 넣지 않았습니다.'),
 h('회사 개요'),
 li('가상의 중소 무역·납품 업체입니다. 국내외 거래처에 산업용 부품을 납품합니다.'),
 li('영업·관리 담당자가 거래처 문의를 메일과 전화로 직접 받아 답합니다.'),
 h('자주 반복되는 거래처 문의 (예시)'),
 table([['구분','거래처가 자주 묻는 내용'],
  ['납기','이번 주문은 언제 출고되나요? 선적 일정이 바뀌었나요?'],
  ['견적','같은 품목 단가를 다시 보내 주세요. 수량이 바뀌면 단가가 달라지나요?'],
  ['선적서류','Invoice·Packing List를 다시 보내 주세요. 수정본이 최신인가요?'],
  ['원산지·인증','원산지증명서나 시험성적서를 받을 수 있나요?'],
  ['주문 조건','최소 주문 수량, 포장 사양, 결제 조건이 어떻게 되나요?'],
  ['샘플','샘플을 받을 수 있나요? 비용은 누가 부담하나요?']],[1800,7226]),
 h('안내 자료가 흩어져 있는 곳'),
 table([['자료','지금 있는 곳'],['제품 사양서','공유 폴더 (버전이 여러 개)'],['납품 조건 안내 문구','담당자별 개인 메일함'],['선적서류 확인 목록','엑셀 파일 (담당자마다 다름)'],['인증서·성적서','별도 폴더 (최신본 확인 어려움)']],[3000,6026]),
 h('담당자 메모 (가상 발언)'),
 li('“같은 질문인데 매번 새로 답을 쓴다.”'),li('“담당자마다 안내하는 내용이 조금씩 다르다.”'),li('“최신 사양서가 어느 것인지 찾느라 시간이 걸린다.”'),
 h('아직 모르는 것',AMBER),
 li('문의가 한 달에 몇 건인지, 답변에 시간이 얼마나 걸리는지는 확인하지 않았습니다.'),
 li('이런 서비스에 돈을 낼 의향이 있는지도 모릅니다. AI 답변에서는 모두 [가설]로 다룹니다.'),
 p([t('실제 거래처 이름, 단가, 계약 내용은 넣지 않습니다.',{size:19,color:GRAY})],{before:200}),
]);
// 5장 사업기획서 양식
const sec=(no,name,guide)=>[h(`${no}. ${name}`),p([t(guide,{size:19,color:'9AA7B3'})],{after:60}),...blank(2)];
await save('5장_사업기획서_양식.docx',[
 title('사업기획서'),meta('[교육용 가상사례]  Canvas에서 다듬은 최종 보고서를 붙이거나, Canvas가 안 될 때 직접 씁니다.'),
 table([['항목','내용'],['서비스 이름',''],['작성자',''],['작성일','']],[2400,6626]),
 ...sec(1,'고객·문제','누가, 어떤 문제를 겪고 있나요? (상황자료의 반복 문의를 근거로)'),
 ...sec(2,'서비스·가치','무엇을 제공하나요? 담당자가 검토한 뒤 답변한다는 점과 하지 않는 일(자동 발송·단가·납기 확정·클레임 보상 판단)을 함께 적습니다.'),
 ...sec(3,'비교·차별점','비슷한 서비스와 무엇이 다른가요? 확인 전이면 [가설]로 표시합니다.'),
 ...sec(4,'운영·수익 가설','돈은 어떻게 받나요? (예: 초기 정리비 + 월 관리비) 가격과 지불 의향은 [가설]입니다.'),
 h('5. 4주 계획'),
 table([['주차','할 일','확인할 것'],['1주 준비','',''],['2주 적용','',''],['3주 관찰','',''],['4주 평가','','']],[1600,3713,3713]),
 ...sec(6,'확인 질문','4주 동안 꼭 확인해야 할 질문 2~3개'),
 h('근거 (3장에서 직접 확인한 원문만)'),
 table([['출처(기관·제목·날짜)','확인한 내용','URL'],['','',''],['','','']],[3000,3626,2400]),
 p([t('표시 규칙: 확인한 사실에는 출처, 확인하지 않은 수요·가격·효과에는 [가설]을 붙입니다.',{size:19,color:GRAY})],{before:160}),
]);
// 3장 근거메모 양식
const memo=i=>[h(`근거 메모 ${i}`),table([['항목','적을 내용'],['확인한 내용','(원문에 실제로 적힌 내용 한두 문장)'],['제목과 날짜','(기관·문서 제목·날짜, 없으면 「날짜 미표시」)'],['원문 주소(URL)','(내가 직접 열어 본 주소)'],['쓸 곳과 한계','(기획서에 쓸 내용 / 아직 모르는 점)'],['직접 열어 봤나요?','☐ 예   ☐ 아니요(원문 미확인)']],[2300,6726])];
await save('3장_근거메모_작성양식.docx',[title('근거 메모 작성양식'),meta('Perplexity 답변의 출처 원문을 직접 열어 확인한 내용만 적습니다.'),...memo(1),...memo(2),
 p([t('제품 설명서가 「이런 기능이 있다」고 해도, 우리 고객이 돈을 낼 것이라는 증거는 아닙니다. 그런 내용은 기획서에서 [가설]로 둡니다.',{size:19,color:GRAY})],{before:160})]);
// 8장 실습기록표
await save('8장_실습기록표.docx',[title('실습기록표'),meta('도구가 안 돼서 다른 방법으로 한 부분은 「대체 실습」에 표시합니다.'),
 p([t('이름: ______________     사용한 도구:  ☐ Gemini   ☐ ChatGPT   ☐ Perplexity   ☐ Gamma',{size:20})],{after:160}),
 table([['장','하는 일','완료','대체 실습','메모'],...STEPS.map(s=>[String(s.n),s.title,'☐','☐',''])],[700,3926,900,1300,2200]),
 h('오늘 결과물'),li('사업기획서:  ☐ Google Docs   ☐ Word   (파일 이름: ______________ )','c'),li('발표자료 8장:  ☐ PPTX 내려받아 다시 열어 봄','c'),
 h('내 업무에 써 볼 한 가지'),...blank(3)]);
})();
