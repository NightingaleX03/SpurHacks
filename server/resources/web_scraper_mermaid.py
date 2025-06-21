from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

BASE_URL = "https://mermaid.js.org"
START_URL = f"{BASE_URL}/syntax/flowchart.html"

driver = webdriver.Chrome()

def get_sidebar_links():
    driver.get(START_URL)

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "section.VPSidebarItem.level-0.collapsible.has-active"))
    )

    sidebar_section = driver.find_element(By.CSS_SELECTOR, "section.VPSidebarItem.level-0.collapsible.has-active")
    items_div = sidebar_section.find_element(By.CSS_SELECTOR, "div.items")
    links = items_div.find_elements(By.CSS_SELECTOR, "a.VPLink")

    diagram_links = []
    for link in links:
        href = link.get_attribute("href")
        label = link.find_element(By.CSS_SELECTOR, "p.text").text
        if href and href.startswith(BASE_URL):
            diagram_links.append((label, href))

    return diagram_links

def extract_p_and_code_texts():
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.VPDoc.has-sidebar.has-aside"))
    )
    vpdoc = driver.find_element(By.CSS_SELECTOR, "div.VPDoc.has-sidebar.has-aside")

    # Find all <p> and <code> descendants, preserving order by DOM position
    # Selenium doesn't support combined selector with order, so:
    # We'll find all <p> and <code> separately and merge by their location in DOM using JS

    # Use JS to get all <p> and <code> inside vpdoc in DOM order with tag name and text
    script = """
    let container = arguments[0];
    let elems = container.querySelectorAll('p, code');
    let results = [];
    elems.forEach(el => {
        results.push({
            tag: el.tagName.toLowerCase(),
            text: el.innerText.trim()
        });
    });
    return results;
    """

    elements = driver.execute_script(script, vpdoc)
    return elements

def scrape_and_save_txt(filename="mermaid_diagrams_p_and_code.txt"):
    links = get_sidebar_links()

    with open(filename, "w", encoding="utf-8") as f:
        for label, url in links:
            print(f"Scraping {label}: {url}")
            driver.get(url)

            try:
                elements = extract_p_and_code_texts()
                f.write(f"--- {label} Page ({url}) ---\n\n")
                for elem in elements:
                    tag = elem['tag']
                    text = elem['text']
                    if tag == "p":
                        f.write(f"[Paragraph]\n{text}\n\n")
                    elif tag == "code":
                        f.write(f"[Code]\n{text}\n\n")
                f.write("\n\n")
                time.sleep(0.5)
            except Exception as e:
                print(f"  Error scraping {url}: {e}")

    print(f"All pages saved to {filename}")

if __name__ == "__main__":
    scrape_and_save_txt()
    driver.quit()