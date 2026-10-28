#!/usr/bin/env python3
"""사업분야 3개 페이지(biz-arch/public/exhibit.html)와 sitemap.xml 을 index.html + data/*.json 으로 다시 만듭니다.
GitHub Actions(.github/workflows/build-pages.yml)가 data/ 가 바뀔 때마다 자동 실행합니다.
직접 실행:  python3 tools/build_biz.py   (저장소 맨 위 폴더에서 · playwright + chromium 필요)
"""
import re, os, html, sys, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BASE = os.environ.get('SITE_URL', 'https://jenuek.github.io/malong/').rstrip('/') + '/'
IDS = ['arch', 'public', 'exhibit']
TT = {'arch': '건축미술 · 미술작품 심의·제작·설치 | 마롱컴퍼니', 'public': '공공미술 조형물 제작 · 소재 선정 | 마롱컴퍼니', 'exhibit': '전시 기획 · 갤러리 | 마롱컴퍼니'}
DESC = {
    'arch': '건물과 공간에 놓이는 건축미술 작품을 기획·제작·설치합니다. 마롱컴퍼니.',
    'public': '공공미술 조형물의 소재 선정부터 가견적, 제작, 설치까지. 마롱컴퍼니.',
    'exhibit': '기업·기관 전시 기획과 갤러리 운영, 작가 협업. 마롱컴퍼니.',
}
src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()

def with_biz(i):
    a = '<div id="ovl-root"></div>\n\n<script>'
    assert src.count(a) == 1, 'index.html 구조가 달라져 사업분야 페이지를 만들 수 없습니다'
    return src.replace(a, '<div id="ovl-root"></div>\n\n<script>window.__BIZ=\'' + i + '\';window.__BIZ_TITLE=' + repr(TT[i]).replace("'", '"') + ';</script>\n<script>')

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=ROOT)
httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
port = httpd.server_address[1]
threading.Thread(target=httpd.serve_forever, daemon=True).start()

cap = {}
with sync_playwright() as p:
    kw = {}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    b = p.chromium.launch(**kw)
    for i in IDS:
        tmp = os.path.join(ROOT, '_tmp_biz-%s.html' % i)
        open(tmp, 'w', encoding='utf-8').write(with_biz(i))
        pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/_tmp_biz-%s.html' % (port, i)); pg.wait_for_function("document.querySelector('#v-biz h1')", timeout=15000); pg.wait_for_timeout(1500)
        cap[i] = pg.evaluate("document.getElementById('v-biz').innerHTML")
        print(i, pg.title(), errs, len(cap[i]))
        assert not errs and len(cap[i]) > 500, 'render failed: %s' % i
        pg.close(); os.remove(tmp)
    b.close()
httpd.shutdown()

def stat_links(t): return re.sub(r'href="#/', r'href="index.html#/', t)

for i in IDS:
    t = with_biz(i); url = BASE + 'biz-%s.html' % i
    head = ('<title>%s</title>\n<meta name="description" content="%s">\n'
            '<link rel="canonical" href="%s">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="마롱컴퍼니">\n'
            '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:url" content="%s">\n') % (
            html.escape(TT[i]), html.escape(DESC[i]), url, html.escape(TT[i]), html.escape(DESC[i]), url)
    old = '<title>마롱컴퍼니 | 조형물 · 건축미술 제작</title>\n<meta name="description" content="마롱컴퍼니의 작품, 소재, 회사 소개.">\n'
    assert old in t; t = t.replace(old, head)
    k = t.index('<script>window.__BIZ'); pre, post = stat_links(t[:k]), t[k:]
    assert '<div id="v-biz" hidden></div>' in pre
    pre = pre.replace('<div id="v-biz" hidden></div>', '<div id="v-biz">' + stat_links(cap[i]) + '</div>')
    open(os.path.join(ROOT, 'biz-%s.html' % i), 'w', encoding='utf-8').write(pre + post)

urls = [BASE] + [BASE + 'biz-%s.html' % i for i in IDS] + [BASE + 'guide.html']
open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>%s</loc></url>\n' % u for u in urls) + '</urlset>\n')
print('done')
