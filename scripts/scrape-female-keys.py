import json
import re
import subprocess
import sys
import os

PLAYLIST_URL = "https://youtube.com/playlist?list=PLDRb0wMZlsyhVxIbIYXEpel_NbIUQAUv0"

TAGALOG_KEYWORDS = {
    'yakap', 'dilim', 'himala', 'hinahanap', 'kita', 'tadhana', 'istorya', 'dito', 'ka', 'lang',
    'babalik', "sa'yo", 'sayo', 'alipin', 'huling', 'bimbo', 'uhaw', 'pasilyo', 'kailan', 'bakit',
    'ba', 'ganyan', 'ere', 'ligaya', 'araw', 'gabi', 'sana', 'ngayong', 'pasko', 'ikaw', 'nga',
    'alapaap', 'kahit', 'maputi', 'na', 'ang', 'buhok', 'ko', 'ipagpatawad', 'mo', 'aking', 'mahal',
    'palagi', 'wag', 'mong', 'sasabihin', 'pare', 'harana', 'kisapmata', 'elesi', 'di', 'bale',
    'huwag', 'muna', 'tayong', 'umuwi', 'dilaw', 'sandali', 'natuto', 'itanong', 'tulad', 'sining',
    'bukas', 'nalang', 'mamahalin', 'maging', 'sino', 'man', 'paano', 'kung', 'akin', 'mundo',
    'ako', 'gusto', 'hulaan', 'oo', 'tuloy', 'pa', 'rin', 'dadalhin', 'sa', 'kanya', 'pagbigyang',
    'muli', 'halaga', 'mahirap', 'magmahal', 'ng', 'syota', 'iba', 'marilag', 'pangako', 'hanggang',
    'ngayon', 'kalimutan', 'wala', 'tibok', 'panalangin', 'naaalala', 'awitin', 'dahil', 'walang',
    'kapalit', 'nakapagtataka', 'kupido', 'torete', 'tingin'
}

def title_case(text):
    words = text.strip().split()
    exceptions = {'ng', 'sa', 'at', 'o', 'na', 'ang', 'mga', 'mo', 'ko', 'ba', 'pa', 'ni', 'ay', 'in', 'on', 'at', 'the', 'a', 'an', 'and', 'or', 'for', 'of', 'with', 'by', 'ft.', 'feat.', 'vs'}
    result = []
    for i, w in enumerate(words):
        upper_w = w.upper()
        if upper_w in {'MYMP', 'VST', 'BINI', 'APO', 'UDD', 'JM'}:
            result.append(upper_w)
            continue
        if upper_w == 'SIDE' and i + 1 < len(words) and words[i + 1].upper() == 'A':
            result.append('Side')
            continue
        if w.upper() == 'A' and i > 0 and words[i - 1].upper() == 'SIDE':
            result.append('A')
            continue
        if upper_w == 'TJ':
            result.append('TJ')
            continue
        lw = w.lower()
        if i == 0 or lw not in exceptions:
            result.append(w.capitalize())
        else:
            result.append(lw)
    return ' '.join(result)

def clean_str(s):
    s = s.replace('I"LL', "I'll").replace('I"ll', "I'll")
    s = re.sub(r'[\(\[\{\)\]\}]', '', s)
    s = s.strip(" -–—:")
    return s

def is_descriptor_segment(seg):
    clean = seg.strip().lower()
    clean = re.sub(r'[\(\[\{\)\]\}]', '', clean)
    tags = [
        'female key', 'male key', 'lower female key', 'lower key', 'higher key',
        'full band karaoke', 'karaoke', 'instrumental', 'live version', 'full band'
    ]
    return any(clean == t or clean == t.replace(' ', '') for t in tags)

def parse_playlist_entry(raw_title):
    raw = raw_title.strip()
    lower_raw = raw.lower()
    
    # 1. Key Label
    if "lower female key" in lower_raw:
        key_label = "Lower Female Key"
    elif "lower key" in lower_raw:
        key_label = "Lower Key"
    elif "higher key" in lower_raw:
        key_label = "Higher Key"
    elif "female key" in lower_raw:
        key_label = "Female Key"
    elif re.search(r'\bmale key\b', lower_raw):
        key_label = "Male Key"
    elif "live version" in lower_raw:
        key_label = "Female Key - Live"
    else:
        key_label = "Female Key"

    # Pattern 1: Title - Artist (Full Band Karaoke)...
    idx_paren = raw.find('(')
    if idx_paren != -1 and ' - ' in raw[:idx_paren]:
        before_paren = raw[:idx_paren].strip()
        parts = before_paren.split(' - ')
        title = parts[0].strip()
        artist = ' - '.join(parts[1:]).strip()
    else:
        # Pattern 2: Segment by hyphen
        segments = re.split(r'\s*[-–—]\s*', raw)
        valid_segments = [s for s in segments if not is_descriptor_segment(s) and s.strip()]
        if len(valid_segments) >= 2:
            title = valid_segments[0].strip()
            artist = valid_segments[-1].strip()
        elif len(valid_segments) == 1:
            title = valid_segments[0].strip()
            artist = "Unknown"
        else:
            title = raw
            artist = "Unknown"

    title = clean_str(title)
    artist = clean_str(artist)
    
    # Specific cleanups
    artist = re.sub(r'\s+VERSION\b.*$', '', artist, flags=re.I).strip()
    # Normalize slash spacing e.g., Rivermaya/Bamboo -> Rivermaya / Bamboo
    artist = re.sub(r'\s*/\s*', ' / ', artist)
    
    title_formatted = f"{title_case(title)} ({key_label})"
    artist_formatted = title_case(artist)
    
    # Language detection
    clean_title_no_key = re.sub(r'\(.*?\)', '', title_formatted).strip().lower()
    words = re.findall(r'[a-zA-Z\']+', clean_title_no_key)
    is_tagalog = any(w in TAGALOG_KEYWORDS for w in words)
    language = "Tagalog" if is_tagalog else "English"
    
    return title_formatted, artist_formatted, language

def fetch_playlist_entries():
    print(f"Fetching playlist metadata from: {PLAYLIST_URL}...")
    cmd = ["python", "-m", "yt_dlp", "--flat-playlist", "-J", PLAYLIST_URL]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        print("Error fetching playlist:", res.stderr)
        sys.exit(1)
    data = json.loads(res.stdout)
    entries = data.get("entries", [])
    print(f"Retrieved {len(entries)} items from playlist.")
    return entries

def main():
    entries = fetch_playlist_entries()
    
    # Read existing songs to get next ID and verify no video duplicate
    existing_songs_path = "src/data/songs.json"
    with open(existing_songs_path, "r", encoding="utf-8") as f:
        existing_songs = json.load(f)
        
    start_id = len(existing_songs) + 1  # 524
    start_code = 2001
    
    scraped_songs = []
    seen_yt_ids = {s["youtube_id"] for s in existing_songs}
    
    for idx, e in enumerate(entries):
        vid_id = e.get("id")
        if not vid_id or vid_id in seen_yt_ids:
            continue
        seen_yt_ids.add(vid_id)
        
        raw_title = e.get("title") or ""
        duration = int(e.get("duration") or 240)
        
        title, artist, language = parse_playlist_entry(raw_title)
        song_id = start_id + idx
        code = f"{start_code + idx:05d}"
        
        search_tokens = f"{title.lower()} {artist.lower()} {code} female key"
        
        song_record = {
            "id": song_id,
            "code": code,
            "title": title,
            "artist": artist,
            "language": language,
            "youtube_id": vid_id,
            "lrc_content": None,
            "key_offset": 0,
            "duration": duration,
            "search_tokens": search_tokens,
            "created_at": "2026-10-16T00:00:00.000Z"
        }
        scraped_songs.append(song_record)
        
    print(f"Parsed {len(scraped_songs)} new tracks (IDs {start_id}..{start_id + len(scraped_songs) - 1}, Codes {start_code:05d}..{start_code + len(scraped_songs) - 1:05d})")
    
    os.makedirs("scripts", exist_ok=True)
    with open("scripts/scraped-female-keys.json", "w", encoding="utf-8") as f:
        json.dump(scraped_songs, f, indent=2, ensure_ascii=False)
    print("Saved scraped songs to scripts/scraped-female-keys.json")
    
    # If --merge flag is provided, append into src/data/songs.json
    if "--merge" in sys.argv:
        merged = existing_songs + scraped_songs
        with open(existing_songs_path, "w", encoding="utf-8") as f:
            json.dump(merged, f, indent=2, ensure_ascii=False)
        print(f"Successfully merged! Total songs in {existing_songs_path}: {len(merged)}")

if __name__ == "__main__":
    main()
