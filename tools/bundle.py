"""Build the single-file version of EchoCare for claude.ai from index.html, css/ and js/.

Usage (from the repo root):  python tools/bundle.py
Writes dist/echocare-claude.html: the same app, with every stylesheet and script inlined,
in the shape a claude.ai artifact expects (page content only, no <html>/<head> wrapper).
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
page = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
read = lambda p: open(os.path.join(ROOT, p), encoding='utf-8').read().rstrip('\n')

head = page[page.index('<head>') + 6:page.index('</head>')]
body = page[page.index('<body>') + 6:page.index('</body>')]

local_css = re.findall(r'<link rel="stylesheet" href="(css/[^"]+)">', head)
keep_head = [l for l in head.strip().split('\n') if l.startswith(('<title>', '<meta name="claude', '<link rel="preconnect"'))
             or (l.startswith('<link rel="stylesheet"') and 'fonts.googleapis' in l)]
scripts = re.findall(r'<script src="(js/[^"]+)"></script>', body)
markup = re.sub(r'<script src="js/[^"]+"></script>\n?', '', body).strip('\n')

out = '\n'.join(keep_head) + '\n<style>\n' + '\n'.join(read(p) for p in local_css) + '\n</style>\n\n' + markup + \
      '\n\n<script>\n' + '\n'.join(read(p) for p in scripts) + '\n</script>\n'
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
open(os.path.join(ROOT, 'dist', 'echocare-claude.html'), 'w', encoding='utf-8', newline='\n').write(out)
print(f'dist/echocare-claude.html: {len(local_css)} stylesheets, {len(scripts)} scripts, {len(out):,} bytes')
