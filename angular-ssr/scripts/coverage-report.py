"""
@file: scripts/coverage-report.py
@project: GameSage - Plataforma de Videojuegos
@authors: Rosario González y Álvaro Jiménez
@description: Script para analizar el reporte de cobertura de tests (HTML) y extraer las estadísticas de archivos y símbolos que no tienen el 100% de cobertura.
"""

import collections
import pathlib
import re

h = pathlib.Path("docs/coverage.html").read_text(encoding="utf-8", errors="ignore")
rows = re.findall(r'<tr class="[^"]+">(.*?)</tr>', h, re.S)
c = collections.Counter()
items = []
for r in rows:
    m = re.search(r'data-sort="(\d+)"', r)
    if not m or m.group(1) == "100":
        continue
    f = re.search(r'<a href="[^"]+">([^<]+)</a>', r)
    if f:
        file_name = f.group(1)
        c[file_name] += 1
        symbol = ""
        tds = re.findall(r"<td[^>]*>(.*?)</td>", r, re.S)
        if len(tds) >= 3:
            symbol = re.sub(r"<[^>]+>", "", tds[2]).strip()
        items.append((int(m.group(1)), file_name, symbol))

for k, v in c.most_common(40):
    print(f"{v:4}  {k}")

print("\nSAMPLE NON-100 SYMBOLS:")
for p, f, s in sorted(items)[:120]:
    print(f"{p:3}%  {f} :: {s}")
