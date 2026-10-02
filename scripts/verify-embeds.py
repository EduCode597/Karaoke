import urllib.request
import json
import sys

def verify_embed(video_id):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return True, data.get('title', '')
    except Exception as e:
        return False, str(e)

if __name__ == '__main__':
    with open('scripts/scraped-songs-ordered.json', 'r', encoding='utf-8') as f:
        songs = json.load(f)

    print(f"Testing embed status for top 30 songs...")
    blocked = 0
    for s in songs[:30]:
        ok, msg = verify_embed(s['youtube_id'])
        if ok:
            print(f"[OK] [{s['code']}] {s['title']} - {s['artist']}: Embed OK")
        else:
            print(f"[BLOCKED] [{s['code']}] {s['title']} - {s['artist']}: BLOCKED ({msg})")
            blocked += 1

    print(f"\nDone! {30 - blocked}/30 top songs verified embeddable.")
