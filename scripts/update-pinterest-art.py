from pathlib import Path

ROOT=Path("assets/pinterest")
RSS=Path("rss.xml")

def scene(kind):
    common='<ellipse cx="500" cy="1165" rx="330" ry="42" fill="#3b2a20" opacity=".12"/><path d="M135 1150h730l-65-170H200z" fill="#d8c1a6"/>'
    cup='''<g transform="translate(700 1060)"><ellipse cx="0" cy="100" rx="82" ry="18" fill="#3b2a20" opacity=".16"/><path d="M-64 0h128v72c0 40-29 67-64 67s-64-27-64-67z" fill="#fffaf3"/><ellipse cx="0" cy="0" rx="64" ry="22" fill="#fffaf3"/><ellipse cx="0" cy="2" rx="50" ry="15" fill="#9b5935"/><path d="M-38 2c17-18 34 16 50 0 16-15 28 13 41-2" fill="none" stroke="#e7c49b" stroke-width="7" stroke-linecap="round"/><path d="M64 25c58-8 61 58 5 60" fill="none" stroke="#fffaf3" stroke-width="18" stroke-linecap="round"/></g>'''
    machine='''<rect x="245" y="775" width="390" height="320" rx="46" fill="url(#machine)" filter="url(#shadow)"/><path d="M285 775h310l-42-88H327z" fill="#39332e"/><rect x="305" y="835" width="270" height="85" rx="20" fill="#25211f"/><circle cx="370" cy="878" r="13" fill="#d6a66c"/><circle cx="420" cy="878" r="13" fill="#d6a66c"/><path d="M405 945h105v28H405z" fill="#b9a08a"/><path d="M457 973v62" stroke="#b9a08a" stroke-width="16" stroke-linecap="round"/><path d="M457 1030h72" stroke="#b9a08a" stroke-width="14" stroke-linecap="round"/>'''
    beans='''<g fill="#5a3021"><ellipse cx="205" cy="1110" rx="21" ry="13" transform="rotate(-25 205 1110)"/><ellipse cx="240" cy="1140" rx="21" ry="13" transform="rotate(15 240 1140)"/><ellipse cx="780" cy="1130" rx="21" ry="13" transform="rotate(20 780 1130)"/></g>'''
    if kind=="compact": return f'<g>{common}{machine}{cup}{beans}</g>'
    if kind=="premium": return f'''<g>{common}{machine}<rect x="660" y="770" width="120" height="310" rx="34" fill="#e6d6c2" filter="url(#shadow)"/><path d="M680 795h80v90h-80z" fill="#55301f"/><circle cx="720" cy="945" r="42" fill="#633723"/><path d="M720 905v80M680 945h80" stroke="#c89d66" stroke-width="7"/>{cup}{beans}</g>'''
    if kind=="grinder": return f'''<g>{common}{machine}<rect x="635" y="765" width="145" height="315" rx="42" fill="#e4d5c3" filter="url(#shadow)"/><path d="M658 800h99v100h-99z" fill="#4b291c"/><circle cx="708" cy="950" r="44" fill="#5b3021"/><path d="M708 907v86M665 950h86" stroke="#c89d66" stroke-width="7"/>{beans}</g>'''
    if kind=="milk": return f'''<g>{common}{machine}<path d="M610 965c82-12 108 62 47 104-35 24-76 12-89-13" fill="none" stroke="#9b755a" stroke-width="15" stroke-linecap="round"/>{cup}<path d="M560 945c-10 55 18 62 4 108" fill="none" stroke="#fff5e8" stroke-width="9" stroke-linecap="round" opacity=".7"/></g>'''
    if kind=="brewer": return '''<g><ellipse cx="500" cy="1180" rx="325" ry="42" fill="#3b2a20" opacity=".12"/><path d="M135 1155h730l-70-170H205z" fill="#d4bca0"/><path d="M300 770h400l-35-75H335z" fill="#e6d8c7" filter="url(#shadow)"/><path d="M335 695h330" stroke="#bba48b" stroke-width="12" stroke-linecap="round"/><path d="M355 775h290v300H355z" fill="#e8ddd0" filter="url(#shadow)"/><path d="M385 805h230v220H385z" fill="#6a3c28"/><path d="M385 805h230" stroke="#f2e9df" stroke-width="8"/><path d="M645 805c130-20 145 125 18 150-48 9-84-18-91-51" fill="none" stroke="#e8ddd0" stroke-width="30" stroke-linecap="round"/><path d="M500 675c-12 55 20 76 0 125" fill="none" stroke="#fff5e8" stroke-width="13" stroke-linecap="round"/></g>'''
    if kind=="espresso": return f'''<g>{common}<rect x="255" y="805" width="410" height="250" rx="44" fill="url(#machine)" filter="url(#shadow)"/><path d="M300 805h320l-45-88H345z" fill="#37312d"/><rect x="320" y="850" width="280" height="70" rx="18" fill="#25211f"/><circle cx="390" cy="885" r="12" fill="#d5a66e"/><circle cx="435" cy="885" r="12" fill="#d5a66e"/><path d="M430 935h110" stroke="#b9a08a" stroke-width="18" stroke-linecap="round"/><path d="M485 953v80" stroke="#b9a08a" stroke-width="16" stroke-linecap="round"/>{cup}<path d="M250 1030h-55c-55 0-75 60-30 82" fill="none" stroke="#6f4b38" stroke-width="17" stroke-linecap="round"/></g>'''
    raise ValueError(kind)

kinds={
"kaffemaskin-under-3000.svg":"compact",
"kaffemaskin-under-5000.svg":"compact",
"kaffemaskin-under-10000.svg":"premium",
"basta-kaffemaskinen-for-hemmet.svg":"premium",
"espressomaskin-for-nyborjare.svg":"espresso",
"kaffemaskin-med-kvarn.svg":"grinder",
"kaffemaskin-med-mjolksystem.svg":"milk",
"kaffebryggare.svg":"brewer",
"espressomaskin.svg":"espresso",
"kaffemaskin-for-cappuccino.svg":"milk",
}

for name,kind in kinds.items():
    p=ROOT/name
    s=p.read_text(encoding="utf-8")
    start=s.index("<g>",s.index('class="detail"'))
    end=s.index("</g>\n<path",start)+4
    p.write_text(s[:start]+scene(kind)+s[end:],encoding="utf-8")

s=RSS.read_text(encoding="utf-8").replace("?v=2","?v=3")
RSS.write_text(s,encoding="utf-8")
print("Updated",len(kinds),"Pinterest motifs.")
