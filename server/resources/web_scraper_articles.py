import os
import requests
from selenium import webdriver
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# List of URLs to scrape
URLS = [
    "https://www.geeksforgeeks.org/system-design/unified-modeling-language-uml-introduction/",
    "https://www.exoway.io/blog/cloud-architecture-diagram",
    "https://www.lucidchart.com/blog/how-to-draw-architectural-diagrams",
    "https://www.visual-paradigm.com/guide/data-modeling/what-is-entity-relationship-diagram/",
]

def scrape_url(url, driver, file, image_counter):
    driver.get(url)
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # Remove headers and footers
    for tag in soup.find_all(["header", "footer"]):
        tag.decompose()
    for cls in ['site-header', 'page-footer', 'header', 'footer', 'main-header', 'main-footer']:
        for tag in soup.select(f".{cls}, #{cls}"):
            tag.decompose()

    for elem in soup.body.descendants:
        if elem.name in ["script", "style", "noscript"]:
            continue
        if elem.name == "img":
            src = elem.get("src")
            if src:
                src = urljoin(url, src)
                file.write(src + "\n")
                try:
                    ext = os.path.splitext(src)[1].split("?")[0].lower()
                    if ext not in [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]:
                        ext = ".jpg"
                    filename = os.path.join("downloaded_images", f"image_{image_counter}{ext}")
                    img_data = requests.get(src).content
                    with open(filename, "wb") as img_file:
                        img_file.write(img_data)
                    image_counter += 1
                except Exception as e:
                    file.write(f"Failed to download image {src}: {e}\n")
        elif elem.name and elem.get_text(strip=True):
            file.write(elem.get_text(strip=True) + "\n")
        elif isinstance(elem, str):
            text = elem.strip()
            if text:
                file.write(text + "\n")

    return image_counter

def main():
    os.makedirs("downloaded_images", exist_ok=True)
    driver = webdriver.Chrome()

    try:
        image_counter = 1
        with open("scraped_content.txt", "w", encoding="utf-8") as file:
            for url in URLS:
                file.write(f"\n===== START {url} =====\n")
                image_counter = scrape_url(url, driver, file, image_counter)
                file.write(f"\n===== END {url} =====\n\n")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
