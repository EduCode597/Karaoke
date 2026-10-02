import json
import re
import subprocess
import sys

def title_case(text):
    words = text.split()
    exceptions = {'ng', 'sa', 'at', 'o', 'na', 'ang', 'mga', 'mo', 'ko', 'ba', 'pa', 'ni', 'ay', 'in', 'on', 'at', 'the', 'a', 'an', 'and', 'or', 'for', 'of', 'with', 'by', 'ft.', 'feat.'}
    result = []
    for i, w in enumerate(words):
        lw = w.lower()
        if i == 0 or lw not in exceptions:
            result.append(w.capitalize())
        else:
            result.append(lw)
    return ' '.join(result)

def parse_video_title(raw_title):
    # Remove hashtags and brackets like [It really Hurts! ] or (KARAOKE VERSION)
    clean = re.sub(r'#\S+', '', raw_title)
    clean = re.sub(r'\(.*?(?:karaoke|cover|version|piano|official|lyrics|wedding|female).*?\)', '', clean, flags=re.I)
    clean = re.sub(r'\[.*?(?:karaoke|cover|version|piano|official|lyrics|wedding|ost|available).*?\]', '', clean, flags=re.I)
    clean = re.sub(r'\bby CoversPH\b', '', clean, flags=re.I)
    clean = clean.strip()
    
    parts = re.split(r'\s+-\s+', clean, maxsplit=1)
    if len(parts) == 2:
        title, artist = parts[0].strip(), parts[1].strip()
    else:
        title, artist = clean, 'CoversPH'
    
    # Clean up trailing punctuation
    title = re.sub(r'[\(\[\{\)\]\}]', '', title).strip()
    artist = re.sub(r'[\(\[\{\)\]\}]', '', artist).strip()
    
    return title_case(title), title_case(artist)

def main():
    playlist_url = 'https://www.youtube.com/playlist?list=PLyMJQPx95_IDAJjWQOExuXvG2Aa8aLKMV'
    print(f'Fetching playlist metadata: {playlist_url}...')
    
    cmd = [
        r'C:\Python314\python.exe', '-m', 'yt_dlp',
        '--flat-playlist', '-J', playlist_url
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    if res.returncode != 0:
        print('Error fetching playlist:', res.stderr)
        sys.exit(1)
        
    data = json.loads(res.stdout)
    entries = data.get('entries', [])
    print(f'Retrieved {len(entries)} items from playlist.')
    
    tagalog_clues = {
        'ng', 'sa', 'at', 'ang', 'na', 'mo', 'ko', 'pa', 'ba', 'ikaw', 'ako', 'kayo', 'tayo',
        'dahil', 'kung', 'araw', 'gabi', 'buhay', 'pag-ibig', 'mahal', 'puso', 'huling', 'bimbo',
        'harana', 'parokya', 'eraserheads', 'ben&ben', 'ben & ben', 'moira', 'skusta', 'clee',
        'rey valera', 'regine', 'sarah geronimo', 'apo hiking', 'jaya', 'juris', 'torete', 'narda',
        'kamikazee', 'rivermaya', 'sponge cola', 'itchyworms', 'salbakuta', 'bandang lapis'
    }
    
    songs = []
    seen_ids = set()
    
    for idx, e in enumerate(entries):
        vid_id = e.get('id')
        if not vid_id or vid_id in seen_ids:
            continue
        seen_ids.add(vid_id)
        
        raw_title = e.get('title')
        if not raw_title or raw_title == '[Private video]' or raw_title == '[Deleted video]':
            continue
        title, artist = parse_video_title(raw_title)
        duration = int(e.get('duration') or 240)
        
        full_text = f"{title} {artist}".lower()
        is_tagalog = any(re.search(r'\b' + re.escape(w) + r'\b', full_text) for w in tagalog_clues)
        language = 'Tagalog' if is_tagalog else 'English'
        
        code = f"{idx + 1:05d}"
        
        songs.append({
            'code': code,
            'title': title,
            'artist': artist,
            'language': language,
            'youtube_id': vid_id,
            'duration': duration,
            'key_offset': 0
        })
        
    print(f'Successfully parsed {len(songs)} unique songs.')
    
    with open('scripts/scraped-songs.json', 'w', encoding='utf-8') as f:
        json.dump(songs, f, indent=2, ensure_ascii=False)
        
    print('Saved metadata to scripts/scraped-songs.json')
    print('\nSample 10 parsed songs:')
    for s in songs[:10]:
        print(f"[{s['code']}] {s['title']} — {s['artist']} ({s['language']}) [{s['duration']}s] -> {s['youtube_id']}")

if __name__ == '__main__':
    main()
