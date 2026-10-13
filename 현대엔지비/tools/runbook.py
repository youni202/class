"""steps.json의 화면 목록(cap-01~26)으로 브라우저 실행 시나리오와 실행 기록표를 만든다."""
import json,os,re
HERE=os.path.dirname(os.path.abspath(__file__)); BASE=os.path.join(HERE,'..')
d=json.load(open(os.path.join(HERE,'steps.json'),encoding='utf8'))
MARK='①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯'
FOLDER={1:'1차시/01_사업아이디어',2:'1차시/02_Canvas문서',3:'1차시/03_근거찾기',4:'1차시/04_기획서초안',5:'2차시/05_최종보고서',6:'2차시/06_Gamma생성',7:'2차시/07_PPT수정',8:'2차시/08_공유피드백'}
URL={'Gemini':'https://gemini.google.com','Perplexity':'https://www.perplexity.ai','Gamma':'https://gamma.app'}
os.makedirs(os.path.join(BASE,'tools','리허설'),exist_ok=True)
L=[]
L+=['# 브라우저 실행 시나리오 (엔지비기업 실습 리허설)','',
'실습가이드의 8개 장을 **실제 로그인된 브라우저에서 처음부터 끝까지 한 번 실행**하고, 화면 캡처와 실제 결과를 남기기 위한 시나리오입니다.',
'사람이 직접 해도 되고, 사용자 컴퓨터에서 도는 Claude 세션(Claude 데스크톱 앱 + Chrome 연동, 또는 이 폴더에서 `claude remote-control`)에게 맡겨도 됩니다.','',
'## Claude 세션에 맡길 때 붙여넣을 지시문','','```',
'현대엔지비/tools/리허설/브라우저_실행_시나리오.md 를 읽고 cap-01부터 cap-26까지 순서대로 내 Chrome에서 실행해 줘.',
'- 이미 로그인된 내 무료 계정만 사용하고, 유료 업그레이드·결제·새 계정 만들기는 하지 마.',
'- 요청문은 현대엔지비/01_실습가이드.html 해당 장의 「복사할 요청」을 그대로 쓰고, [대괄호]는 바로 앞 단계의 실제 결과로 바꿔. 1장에서는 02_실습파일/1장_엔지비기업_회사소개.docx 를 첨부해.',
'- 각 cap마다 화면을 1280x800 정도로 캡처해 현대엔지비/captures/cap-XX.png 로 저장해. 이메일·계정명·프로필 사진은 가려.',
'- 결과는 현대엔지비/tools/리허설/실행기록.md 의 해당 칸에 사실대로 적어. 실행이 안 된 것은 "미실행"과 이유를 적고, 결과를 지어내지 마.',
'- 메뉴 이름이나 순서가 가이드와 다르면 실행기록의 "가이드와 다른 점"에 적어. 가이드 문구는 마지막에 한꺼번에 고칠게.',
'- 한도 안내가 뜨면 멈추고 나에게 알려 줘.','```','',
'## 지킬 것','',
'- 교육용 가상 사례(엔지비기업)만 입력합니다. 실제 거래처·회사 자료는 넣지 않습니다.',
'- 요청문은 한 번만 보냅니다. 생성 중에는 다시 보내지 않습니다.',
'- 「필요할 때만」 요청은 앞 결과에 해당 문제가 있을 때만 실행하고, 실행 여부를 기록합니다.',
'- Gamma AI 이미지·AI 편집은 크레딧이 남아 있을 때만 실행합니다. 남은 크레딧을 기록합니다.',
'- 캡처는 핀 번호가 가리킬 위치가 화면 안에 보이도록 찍습니다(아래 각 cap의 "화면에 보여야 할 것").','',
'## 준비','',
'| 항목 | 확인 |','|---|---|',
'| Gemini 무료 계정 로그인 (gemini.google.com) | ☐ |','| Perplexity 무료 계정 로그인 (perplexity.ai) | ☐ |','| Gamma 무료 계정 로그인, 남은 크레딧 확인 (gamma.app) | ☐ |',
'| 브라우저 창 크기 약 1280×800, 확대 100% | ☐ |','| `현대엔지비/captures/` 폴더 | ☐ |','| Gamma 대안: 미리캔버스 무료 체험 남은 횟수, PPT 다운로드 가능 여부 / Kimi 슬라이드 무료 사용 가능 여부 | ☐ |','']
R=['# 실행 기록','','브라우저 실행 시나리오대로 실제 실행한 결과만 적습니다. 실행하지 못한 항목은 「미실행」과 이유를 적습니다.','',
'| 항목 | 내용 |','|---|---|','| 실행일시 (KST) | |','| 실행한 사람 / 세션 | |','| 브라우저·창 크기 | |','| Gemini 모드 표시 | |','| Gamma 시작 크레딧 → 끝 크레딧 | |','']
cur=0
for st in d['steps']:
    if st['stage']!=cur:
        cur=st['stage']; sg=d['stages'][cur-1]
        L+=[f"## {cur}장 · {sg['name']}  ({sg['tool']})",'',f"요청문: `01_실습가이드.html` {cur}장",'']
        R+=[f"## {cur}장 · {sg['name']}",'']
    tool=next((u for k,u in URL.items() if k in st['tool']),'')
    L+=[f"### {st['id']} · {st['title']}",'',f"- 도구: {st['tool']}"+(f" ({tool})" if tool else '')]
    if st['prompts']: L.append('- 보낼 요청: '+', '.join(f"{MARK[n-1]}" for n in st['prompts'])+(' (필요할 때만 포함)' if st['cond'] else ''))
    L.append('- 할 일:')
    L+=[f"  {i}. {a}" for i,a in enumerate(st['actions'],1)]
    L.append(f"- 화면에 보여야 할 것 (핀 번호 순서):")
    L+=[f"  {i}. {p['t']}" for i,p in enumerate(st['pins'],1)]
    L+=[f"- 성공 기준: {st['check']}" if st['check'] else '',f"- 막혔을 때: {st['fallback']}" if st['fallback'] else '',f"- 캡처 저장: `captures/{st['id']}.png`",'']
    L=[x for x in L if x!='' or True]
    R+=[f"### {st['id']} · {st['title']}",'',
        '| 항목 | 기록 |','|---|---|','| 실행 결과 | ☐ 완료 ☐ 대체 실습 ☐ 미실행 |','| 캡처 저장 | ☐ captures/'+st['id']+'.png |',
        '| 실제 메뉴·버튼 이름 | |','| 결과 요약 (실제 출력에서) | |','| 성공 기준 충족 | ☐ 예 ☐ 아니요 — |','| 가이드와 다른 점 | |','| 걸린 시간 | |','']
L+=['## 실행이 끝나면','',
'1. `실행기록.md`의 「가이드와 다른 점」을 모아 `tools/content.js`(실습가이드 문구)와 `tools/build.py`(교안 화면 문구·핀 위치)를 고칩니다.',
'2. 핀이 캡처와 어긋나면 `tools/build.py`의 pins 값(800×450 기준 좌표)을 고칩니다.',
'3. 다시 만들기: `python3 tools/build.py` → `node tools/forms.js` → `node tools/guide.js` → `python3 tools/lesson.py` (순서대로).',
'4. 캡처는 `01_실습가이드.html`의 각 단계 그림 자리에 자동으로 나타납니다.','']
open(os.path.join(BASE,'tools','리허설','브라우저_실행_시나리오.md'),'w',encoding='utf8').write('\n'.join(L))
open(os.path.join(BASE,'tools','리허설','실행기록.md'),'w',encoding='utf8').write('\n'.join(R))
print('ok',len(L),len(R))
