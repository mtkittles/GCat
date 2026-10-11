import json, sys
from playwright.sync_api import sync_playwright
AXE=open(sys.argv[4] if len(sys.argv) > 4 else "node_modules/axe-core/axe.min.js").read()
PAGES=["/","/nauka","/nauka/frezowanie","/nauka/start","/nauka/frezowanie/p-1-obrabiarka-i-ruchy","/nauka/frezowanie/f0-1-uklad-wspolrzednych","/nauka/frezowanie/f4-1-g43-korekcja-dlugosci","/nauka/frezowanie/f5-4-g98-g99-g80","/nauka/toczenie/t0-1-uklad-wspolrzednych-tokarki","/kody","/kody/g01","/zadania","/zadania/prostokat","/programy","/kalkulator","/slownik","/symulator","/fiszki"]
WIDTHS=[int(w) for w in sys.argv[1].split(",")]
THEMES=sys.argv[2].split(",")
out=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for theme in THEMES:
        for w in WIDTHS:
            ctx=b.new_context(viewport={"width":w,"height":844 if w<500 else 936})
            ctx.add_init_script(f"try{{localStorage.setItem('theme','{theme}')}}catch(e){{}}")
            pg=ctx.new_page()
            for path in PAGES:
                try:
                    pg.goto("http://localhost:3000"+path,wait_until="networkidle",timeout=90000); pg.wait_for_timeout(800)
                except Exception as e:
                    out.append({"theme":theme,"w":w,"path":path,"err":str(e)[:120]}); continue
                ov=pg.evaluate("""() => { const W=document.documentElement.clientWidth; const bad=[]; if (document.documentElement.scrollWidth>W) { for (const el of document.querySelectorAll('body *')) { const r=el.getBoundingClientRect(); if (r.right>W+1 && r.width>0) { const cs=getComputedStyle(el); let p=el.parentElement, clipped=false; while(p){const s=getComputedStyle(p); if(/(auto|scroll|hidden|clip)/.test(s.overflowX)){clipped=true;break;} p=p.parentElement;} if(!clipped) bad.push((el.className&&el.className.baseVal===undefined?el.className:'')+'<'+el.tagName+'> '+Math.round(r.right)); } } } return {sw:document.documentElement.scrollWidth, W, bad:bad.slice(0,6)}; }""")
                res={"theme":theme,"w":w,"path":path,"overflow":ov}
                if w in (390,1363):
                    pg.add_script_tag(content=AXE)
                    r=pg.evaluate("""async () => { const r = await axe.run(document, {runOnly:{type:'rule',values:['color-contrast','target-size','link-in-text-block','button-name','image-alt','label','aria-allowed-attr','scrollable-region-focusable','nested-interactive']}}); return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,nodes:v.nodes.slice(0,8).map(n=>({t:n.target.join(' '),s:(n.any[0]||n.all[0]||{}).message||''}))})); }""")
                    res["axe"]=r
                out.append(res)
            ctx.close()
    b.close()
json.dump(out,open(sys.argv[3],"w"),ensure_ascii=False,indent=1)
print("ok",len(out))
