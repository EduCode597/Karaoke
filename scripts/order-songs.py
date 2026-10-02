import json
import re

with open('scripts/scraped-songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

# Specific title cleanups
for s in songs:
    t = s['title']
    if t.lower() == 'huling el bimbo':
        s['title'] = 'Ang Huling El Bimbo'
    # Ensure Tagalog for known Filipino bands/artists
    if any(k in s['artist'].upper() for k in ['ERASERHEADS', 'PAROKYA', 'REY VALERA', 'BEN&BEN', 'BEN & BEN', 'MOIRA', 'SKUSTA', 'SALBAKUTA', 'JOIN THE CLUB', 'RIVERMAYA', 'KAMIKAZEE', 'ITCHYWORMS', 'SPONGE COLA', 'BANDANG LAPIS', 'SARAH GERONIMO', 'FREDDIE AGUILAR']):
        s['language'] = 'Tagalog'

# Top curated priority IDs to pin at the very top (Codes 01001 - 01020)
priority_searches = [
    ('Ang Huling El Bimbo', 'Eraserheads'),
    ('Kahit Maputi na ang Buhok ko', 'Rey Valera'),
    ('Dancing Queen', 'Abba'),
    ('Beer', 'Itchyworms'),
    ('My Way', 'Frank Sinatra'),
    ('Nobela', 'Join The Club'),
    ('Araw-Araw', 'Ben & Ben'),
    ('Stupid Love', 'Salbakuta'),
    ('Paubaya', 'Moira Dela Torre'),
    ('Ligaya', 'Eraserheads'),
    ('Alapaap', 'Eraserheads'),
    ('Kabilang Buhay', 'Bandang Lapis'),
    ('Maging Sino Ka Man', 'Rey Valera'),
    ('Cruel Summer', 'Taylor Swift'),
    ('You Are Not Alone', 'Michael Jackson'),
    ('Torete', 'Moira Dela Torre'),
    ('Pagtingin', 'Ben&Ben'),
    ('Sa Susunod na Habang Buhay', 'Ben&Ben'),
    ('Hindi Tayo Pwede', 'The Juans'),
    ('Magandang Dilag', 'JM Bales'),
    ('Beautiful In White', 'Shane Filan'),
    ('Can\'t Help Falling in Love', 'Elvis Presley'),
    ('Let It Be', 'The Beatles'),
    ('Someone Like You', 'Adele'),
    ('Hey Jude', 'The Beatles')
]

pinned = []
remaining = list(songs)

for p_title, p_artist in priority_searches:
    for i, s in enumerate(remaining):
        if p_title.lower() in s['title'].lower() and p_artist.lower() in s['artist'].lower():
            pinned.append(remaining.pop(i))
            break

# Order the rest: staple artists first, then others
staple_artists = [
    'ERASERHEADS', 'REY VALERA', 'PAROKYA', 'MOIRA', 'BEN&BEN', 'BEN & BEN',
    'RIVERMAYA', 'SARAH GERONIMO', 'KAMIKAZEE', 'AEGIS', 'SHARON CUNETA',
    'GARY VALENCIANO', 'APO HIKING', 'SPONGE COLA', 'ITCHYWORMS', 'SKUSTA CLEE',
    'FREDDIE AGUILAR', 'REGINE VELASQUEZ', 'JAYA', 'JURIS', 'NINA', 'BANDANG LAPIS',
    'SALBAKUTA', 'JOIN THE CLUB', 'THE JUANS', 'MICHAEL JACKSON', 'TAYLOR SWIFT',
    'ABBA', 'FRANK SINATRA', 'BEE GEES', 'QUEEN', 'THE BEATLES', 'DAVID POMERANZ',
    'AIR SUPPLY', 'CELINE DION', 'ELVIS PRESLEY', 'ADELE', 'KENNY ROGERS'
]

curated_rest = []
others = []

for s in remaining:
    if any(k in s['artist'].upper() or k in s['title'].upper() for k in staple_artists):
        curated_rest.append(s)
    else:
        others.append(s)

full_catalog = pinned + curated_rest + others

# Assign 5-digit videoke codes starting at 01001
for i, s in enumerate(full_catalog):
    s['code'] = f"{1001 + i:05d}"
    s['search_tokens'] = f"{s['title'].lower()} {s['artist'].lower()} {s['code']}"

print(f"Total songs in curated catalog: {len(full_catalog)}")
print("\nTop 15 Songs:")
for s in full_catalog[:15]:
    print(f"[{s['code']}] {s['title']} — {s['artist']} ({s['language']}) [{s['duration']}s] -> {s['youtube_id']}")

with open('scripts/scraped-songs-ordered.json', 'w', encoding='utf-8') as f:
    json.dump(full_catalog, f, indent=2, ensure_ascii=False)
