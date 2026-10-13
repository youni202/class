"""2차시 기획서 → 발표자료 흐름 SVG(색은 currentColor + 클래스) 생성: python3 tools/flow2.py"""
import os
HERE=os.path.dirname(os.path.abspath(__file__))
W,H=1160,600
o=[f'<svg class="flow" viewBox="0 0 {W} {H}" role="img" aria-label="2차시 흐름: 5장에서 기획서 초안을 검토만 받고 사람이 고른 것만 반영해 최종 기획서를 저장하고, 6장에서 8장 원고를 만들어 Gamma로 발표자료를 생성하고, 7장에서 그림·배치·글을 한 번씩 고쳐 PPTX로 내려받은 뒤, 8장에서 1분 소개와 질문으로 문장 하나를 고친다" xmlns="http://www.w3.org/2000/svg">',
'<defs><marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>',
'<marker id="ahA2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="accf" d="M0,0 L10,5 L0,10 z"/></marker></defs>']
def T(x,y,s,cls='t',anchor='middle'): o.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{s}</text>')
def box(x,y,w,h,title,sub='',cls='bx',sub2=''):
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" class="{cls}"/>')
    cx=x+w/2
    if sub2: T(cx,y+21,title,'tb'); T(cx,y+39,sub,'ts'); T(cx,y+54,sub2,'ts')
    elif sub: T(cx,y+h/2-4,title,'tb'); T(cx,y+h/2+15,sub,'ts')
    else: T(cx,y+h/2+5,title,'tb')
def arrow(x1,y1,x2,y2,label='',acc=False,lx=None):
    o.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{"lnA" if acc else "ln"}" marker-end="url(#{"ahA2" if acc else "ah2"})"/>')
    if label: T((lx if lx else x1+8),(y1+y2)/2+4,label,'tl','start')
cols=[(20,300,'5장','검토 · 최종 기획서','같은 Canvas','약 20분'),(340,260,'6장','Gamma로 발표자료','Gamma','약 10분'),(620,280,'7장','그림 · 배치 · 글 고치기','Gamma','약 20분'),(920,220,'8장','공유 · 피드백','Teams','약 10분')]
for x,w,n,t,tool,m in cols:
    o.append(f'<rect x="{x}" y="50" width="{w}" height="58" rx="8" class="hd"/>')
    T(x+14,72,f'{n} · {m}','tn','start'); T(x+14,97,t,'th','start'); T(x+w-14,97,tool,'tt','end')
o.append('<path d="M170,50 C170,26 1030,26 1030,50" class="lnD" marker-end="url(#ah2)" fill="none"/>')
T(600,13,'같은 Canvas 기획서 (5장 → 8장에서 한 문장 고치기)','tl')
# 5장
box(40,130,260,54,'기획서 초안','1차시 4장에서','in')
arrow(170,184,170,220,'요청 ⑧',lx=178)
box(20,220,300,64,'검토만 받기','최대 5개: 문제 문장 · 이유 · 고칠 방향','bx','이때 기획서는 그대로')
arrow(170,284,170,320)
box(60,320,220,64,'2~3개 고르기','사람이 판단','bx','고칠 게 없으면 건너뜀')
arrow(170,384,170,420,'요청 ⑨ (단정이면 ⑩)',lx=178)
box(40,420,260,54,'고른 것만 반영','출처 · [가설] 표시 유지')
arrow(170,474,170,500,acc=True)
box(60,500,220,54,'최종 기획서','Docs로 내보내기 · 5장 양식','out')
o.append('<polyline points="280,527 326,527 326,157 340,157" class="lnA" fill="none" marker-end="url(#ahA2)"/>')
T(303,519,'기획서','tlA')
# 6장
box(350,130,240,54,'8장 원고 받기','요청 ⑪ · 제목·핵심 문장·본문 3줄')
arrow(470,184,470,220)
box(350,220,240,64,'Gamma 로그인','남은 크레딧 확인','bx','없으면 미리캔버스 → Kimi → 직접')
arrow(470,284,470,320,'요청 ⑫ + 원고',lx=478)
box(360,320,220,54,'8장 구성 계획 확인','원고 순서와 같은가?')
arrow(470,374,470,410)
box(360,410,220,54,'생성 · 장수 세기','3장·4장이 기획서와 같은가?')
arrow(470,464,470,500,acc=True)
box(370,500,200,54,'발표자료 8장','Gamma 초안','out')
o.append('<polyline points="570,527 606,527 606,157 620,157" class="lnA" fill="none" marker-end="url(#ahA2)"/>')
T(588,519,'8장','tlA')
# 7장
box(640,130,240,54,'그림 (선택)','3장 /ai · 요청 ⑬ · 크레딧 있을 때만','in')
arrow(760,184,760,220)
box(630,220,260,54,'배치','3장 2단 · 요청 ⑭ 또는 Smart Layouts')
arrow(760,274,760,310)
box(640,310,240,54,'글','8장 결정 요청 · 요청 ⑮')
arrow(760,364,760,410,'Export → PowerPoint',lx=768)
box(650,410,220,54,'PPTX 내려받기','다운로드만으로 끝내지 않기')
arrow(760,464,760,500,acc=True)
box(660,500,200,54,'PPTX 다시 열기','8장 · 한글 · 출처 확인','out')
o.append('<polyline points="860,527 906,527 906,157 920,157" class="lnA" fill="none" marker-end="url(#ahA2)"/>')
T(883,519,'PPTX','tlA')
# 8장
box(930,130,200,64,'1분 소개','누구의 어떤 문제?','bx','경쟁사와 다른 점 · 4주 확인')
arrow(1030,194,1030,230)
box(930,230,200,54,'채팅 한 줄 + 질문','다른 사람 글에 질문 1개')
arrow(1030,284,1030,320,'요청 ⑯',lx=1038)
box(930,320,200,64,'한 문장 고치기','받은 질문이 있을 때만','bx','근거 없으면 확인할 질문')
arrow(1030,384,1030,420)
box(930,420,200,54,'PPTX 다시 내보내기','Gamma를 고쳤다면')
arrow(1030,474,1030,500,acc=True)
box(930,500,200,54,'최종 결과물','기획서 1개 + 발표자료 8장','out')
T(20,588,'실선 화살표: 순서 · 색 화살표: 다음 장으로 넘기는 결과물 · 점선 테두리: 선택하거나 앞에서 받은 것 · 위 점선: 같은 Canvas 기획서','ts','start')
o.append('</svg>')
svg='\n'.join(o)
open(os.path.join(HERE,'flow2.svg.html'),'w',encoding='utf8').write(svg)
print(len(svg))
