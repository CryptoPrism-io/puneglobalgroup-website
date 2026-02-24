import urllib.request
import re
from pathlib import Path

refs = Path("public/products/refs")
refs.mkdir(exist_ok=True)

base = "https://www.brotherspackaging.in/"
headers = {"User-Agent": "Mozilla/5.0"}

pages = {
    "pptray": "pp-tray-in-ahmedabad.php",
    "ppbox": "pp-box-in-ahmedabad.php",
    "esd": "esd-packaging-in-ahmedabad.php",
    "separator": "insert-and-seprator-in-ahmedabad.php",
}

to_download = {}
for key, page in pages.items():
    req = urllib.request.Request(base + page, headers=headers)
    html = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")
    pattern = r'src="(assets/images/products[^"]+)"'
    imgs = re.findall(pattern, html)
    print("{}: found {} images, first: {}".format(key, len(imgs), imgs[0] if imgs else "none"))
    if imgs:
        to_download[key] = imgs[0]

# Also get Nilkamal box image
nilkamal_imgs = {
    "nilkamal-box": "https://nilkamalmaterialhandling.com/cdn/shop/products/Customised_Crates_12.jpg",
}

for key, url in nilkamal_imgs.items():
    req = urllib.request.Request(url, headers=headers)
    data = urllib.request.urlopen(req).read()
    out = refs / "ref-{}.jpg".format(key)
    out.write_bytes(data)
    print("Saved {} ({} KB)".format(out.name, len(data)//1024))

for key, path in to_download.items():
    url = base + path
    req = urllib.request.Request(url, headers=headers)
    data = urllib.request.urlopen(req).read()
    ext = path.split(".")[-1]
    out = refs / "ref-{}.{}".format(key, ext)
    out.write_bytes(data)
    print("Saved {} ({} KB)".format(out.name, len(data)//1024))

print("\nAll refs saved to:", refs)
print(list(refs.iterdir()))
