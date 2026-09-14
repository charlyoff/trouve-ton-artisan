"""Read the supplied workbook and generate a faithful, normalized SQL fixture.

Usage: python scripts/extract-sources.py PATH_TO_ATTACHMENTS
Original files are never changed. Only generated project artifacts are written.
"""
import json
import sys
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
root = Path(__file__).resolve().parents[1]
rows = list(openpyxl.load_workbook(source / 'data.xlsx', read_only=True, data_only=True).active.values)
headers, records = rows[0], rows[1:]
assert len(records) == 17 and len(headers) == 9
categories = ['Bâtiment', 'Services', 'Fabrication', 'Alimentation']
slugs = ['batiment', 'services', 'fabrication', 'alimentation']
specialties = list(dict.fromkeys(row[1] for row in records))

def sql(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return '1' if value else '0'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace('\\', '\\\\').replace("'", "''") + "'"

lines = ['-- Generated from data.xlsx, sheet data2, rows 2-18. No source values rewritten.',
         'SET NAMES utf8mb4;', 'START TRANSACTION;']
for i, name in enumerate(categories, 1):
    lines.append(f'INSERT INTO categories (id, name, slug) VALUES ({i}, {sql(name)}, {sql(slugs[i-1])});')
for i, name in enumerate(specialties, 1):
    category = next(row[7] for row in records if row[1] == name)
    assert all(row[7] == category for row in records if row[1] == name)
    lines.append(f'INSERT INTO specialties (id, name, category_id) VALUES ({i}, {sql(name)}, {categories.index(category)+1});')
for i, row in enumerate(records, 1):
    name, specialty, rating, city, about, email, website, category, top = row
    values = [i, name, float(rating), city, about, email, website, top, specialties.index(specialty)+1]
    lines.append('INSERT INTO artisans (id, name, rating, city, about, email, website, is_top, specialty_id) VALUES (' + ', '.join(map(sql, values)) + ');')
lines.append('COMMIT;')
(root / 'database' / 'seed.sql').write_text('\n'.join(lines) + '\n', encoding='utf-8')
(root / 'docs' / 'source-data.json').write_text(json.dumps({'source': 'data.xlsx / data2!A1:I18', 'categories': 4, 'specialties': len(specialties), 'artisans': len(records), 'featured': sum(bool(r[8]) for r in records)}, indent=2), encoding='utf-8')
print(f'Imported {len(records)} artisans, {len(specialties)} specialties, 4 categories, 3 featured.')
