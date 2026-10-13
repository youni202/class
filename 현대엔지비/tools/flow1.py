"""1차시 아이디어 발굴 흐름 SVG(색은 currentColor + 클래스) 생성: python3 tools/flow1.py"""
import os
HERE=os.path.dirname(os.path.abspath(__file__))
W,H=1160,600
o=[f'<svg class="flow" viewBox="0 0 {W} {H}" role="img" aria-label="1차시 신사업 아이디어 발굴 흐름: 1장에서 회사 강점으로 아이디어 5개를 넓혔다가 1개로 좁혀 카드를 만들고, 2장에서 Canvas 기획서 골격을 만들고, 3장에서 경쟁사를 찾아 공식 사이트로 확인해 배울 점과 다르게 할 점을 정리한 뒤, 4장에서 같은 기획서에 경쟁사 비교와 4주 시범 계획을 넣어 초안을 완성한다" xmlns="http://www.w3.org/2000/svg">',
'<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>',
'<marker id="ahA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="accf" d="M0,0 L10,5 L0,10 z"/></marker></defs>']
def T(x,y,s,cls='t',anchor='middle'): o.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{s}</text>')
def box(x,y,w,h,title,sub='',cls='bx',sub2=''):
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" class="{cls}"/>')
    cx=x+w/2
    if sub2: T(cx,y+21,title,'tb'); T(cx,y+39,sub,'ts'); T(cx,y+54,sub2,'ts')
    elif sub: T(cx,y+h/2-4,title,'tb'); T(cx,y+h/2+15,sub,'ts')
    else: T(cx,y+h/2+5,title,'tb')
def arrow(x1,y1,x2,y2,label='',acc=False,lx=None):
    o.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{"lnA" if acc else "ln"}" marker-end="url(#{"ahA" if acc else "ah"})"/>')
    if label: T((lx if lx else x1+8),(y1+y2)/2+4,label,'tl','start')
cols=[(20,300,'1장','신사업 아이디어 찾기','Gemini / ChatGPT','약 20분'),(340,220,'2장','기획서 골격','Canvas','약 10분'),(580,300,'3장','경쟁사 벤치마킹','Perplexity','약 20분'),(900,240,'4장','기획서 초안 완성','같은 Canvas','약 10분')]
for x,w,n,t,tool,m in cols:
    o.append(f'<rect x="{x}" y="50" width="{w}" height="58" rx="8" class="hd"/>')
    T(x+14,72,f'{n} · {m}','tn','start'); T(x+14,97,t,'th','start'); T(x+w-14,97,tool,'tt','end')
# 위쪽: 같은 Canvas 기획서 연결 (2장 → 4장)
o.append('<path d="M450,50 C450,26 1020,26 1020,50" class="lnD" marker-end="url(#ah)" fill="none"/>')
T(735,13,'같은 Canvas 기획서를 이어서 고친다 (2장 → 4장)','tl')
# 1장: 넓혔다가 좁히기
box(40,130,260,54,'회사소개 첨부','강점 · 부족한 점 · 신사업 조건','in')
arrow(170,184,170,220,'요청 ①',lx=178)
box(20,220,300,54,'아이디어 5개로 넓히기','회사 강점을 살린 후보들')
arrow(170,274,170,310)
box(40,310,260,64,'같은 기준으로 비교','고객 · 문제 · 가치 · 필요 역량','bx','준비 부담 · 4주 확인 질문')
arrow(170,374,170,410)
box(80,410,180,54,'1개로 좁히기','추천과 달라도 OK · 요청 ②')
arrow(170,464,170,500,acc=True)
box(60,500,220,54,'아이디어 카드','고객·문제·해결·수익·강점·질문','out')
# 1장 카드 → 2장 골격
o.append('<polyline points="280,527 326,527 326,247 340,247" class="lnA" fill="none" marker-end="url(#ahA)"/>')
T(303,519,'카드','tlA')
# 2장
box(360,130,180,54,'Canvas 선택','새 채팅 → 도구 메뉴')
arrow(450,184,450,220,'요청 ③',lx=458)
box(350,220,200,64,'기획서 골격','소제목 7개','bx','경쟁사 칸 = 「조사 예정」')
arrow(450,284,450,320,'요청 ④',lx=458)
box(350,320,200,54,'한 문단 고치기','해결 방법과 제공 가치')
arrow(450,374,450,500,acc=True)
box(360,500,180,54,'기획서 v1','다음: 경쟁사 채우기','out')
# 3장
box(600,130,260,54,'아이디어 한 줄 넣기','1장 카드에서 · 요청 ⑤')
arrow(730,184,730,220)
box(580,220,300,54,'경쟁사·유사 서비스 3곳','대상 고객 · 기능 · 가격 · 강점 · 약점')
arrow(730,274,730,310)
box(600,310,260,54,'공식 사이트 직접 확인','2곳 이상 · 다르면 요청 ⑥')
arrow(730,364,730,400)
box(590,400,135,64,'배울 점','경쟁사의 좋은 점'); box(735,400,135,64,'다르게 할 점','회사 강점에서')
arrow(730,464,730,500,acc=True)
box(620,500,220,54,'경쟁사 메모','확인 못 한 것 = 미확인','out')
# 3장 메모 → 4장 요청 ⑦
o.append('<polyline points="840,527 886,527 886,247 900,247" class="lnA" fill="none" marker-end="url(#ahA)"/>')
T(863,519,'메모','tlA')
# 4장
box(920,130,200,54,'같은 Canvas로 복귀','새 채팅 만들지 않기')
arrow(1020,184,1020,220)
box(910,220,220,54,'요청 ⑦ + 경쟁사 메모','「불러오기」로 붙이기')
arrow(1020,274,1020,310)
box(910,310,220,54,'경쟁사 비교표','차별점은 [가설] · 출처 표시')
arrow(1020,364,1020,400)
box(910,400,220,64,'4주 시범 계획','준비 → 시범 → 관찰 → 평가')
arrow(1020,464,1020,500,acc=True)
box(920,500,200,54,'기획서 초안','→ 2차시 검토로','out')
T(20,588,'실선 화살표: 순서 · 색 화살표: 다음 장으로 넘기는 결과물 · 점선: 같은 Canvas 기획서','ts','start')
o.append('</svg>')
svg='\n'.join(o)
open(os.path.join(HERE,'flow1.svg.html'),'w',encoding='utf8').write(svg)
print(len(svg))
