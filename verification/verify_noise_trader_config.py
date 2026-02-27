from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173/")

        # Wait for the NoiseTrader heading to load
        # Use a more specific selector to avoid ambiguity
        noise_trader_heading = page.get_by_role("heading", name="NoiseTrader")
        noise_trader_heading.wait_for()
        noise_trader_heading.scroll_into_view_if_needed()

        # Take a screenshot of the NoiseTrader configuration
        page.screenshot(path="verification/noise_trader_config.png")
        browser.close()

if __name__ == "__main__":
    run()
