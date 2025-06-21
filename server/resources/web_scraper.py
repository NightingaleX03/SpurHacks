import os
import requests
from PIL import Image
import pytesseract
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def download_image(url, folder):
    try:
        os.makedirs(folder, exist_ok=True)
        ext = os.path.splitext(url)[1].split("?")[0]
        if ext.lower() not in [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]:
            ext = ".jpg"
        filename = os.path.join(folder, os.path.basename(url).split("?")[0])
        if not filename.lower().endswith(ext):
            filename += ext
        if not os.path.exists(filename):
            resp = requests.get(url)
            resp.raise_for_status()
            with open(filename, "wb") as f:
                f.write(resp.content)
        return filename
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None

def ocr_image(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        print(f"Failed OCR on {image_path}: {e}")
        return ""

def main():
    url = "https://www.geeksforgeeks.org/system-design/unified-modeling-language-uml-introduction/"

    driver = webdriver.Chrome()

    try:
        driver.get(url)
        soup = BeautifulSoup(driver.page_source, "html.parser")

        os.makedirs("downloaded_images", exist_ok=True)

        with open("scraped_output.txt", "w", encoding="utf-8") as f:

            # Write unordered lists
            uls = soup.find_all("ul")
            for i, ul in enumerate(uls, 1):
                items = [li.get_text(strip=True) for li in ul.find_all("li")]
                if items:
                    f.write(f"UNORDERED LIST {i}:\n")
                    for item in items:
                        f.write(f"- {item}\n")
                    f.write("\n")

            # Write OCR text from images
            images = soup.find_all("img")
            for i, img in enumerate(images, 1):
                src = img.get("src")
                if not src:
                    continue
                img_url = urljoin(url, src)
                f.write(f"IMAGE {i} URL: {img_url}\n")

                img_path = download_image(img_url, "downloaded_images")
                if img_path:
                    text = ocr_image(img_path)
                    f.write("Extracted Text:\n")
                    f.write(text + "\n")
                else:
                    f.write("Image download failed.\n")
                f.write("\n")

    finally:
        driver.quit()

if __name__ == "__main__":
    main()
