import os
import sys
import json
from typing import List, Dict, Any, Optional
from playwright.sync_api import sync_playwright

class BrowserSession:
    """
    Manages Playwright browser lifecycle, persistent context profiles, and cookie injection.
    """
    def __init__(self, session_id: str = "default_session", headless: bool = True, hidden_headful: bool = False, profile_dir: Optional[str] = None):
        self.session_id = session_id or "default_session"
        self.headless = headless
        self.hidden_headful = hidden_headful
        self.custom_profile_dir = profile_dir
        self.playwright = None
        self.context = None
        self.page = None

    @staticmethod
    def sanitize_cookies(cookies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Normalizes sameSite values and cleans attributes for Playwright cookie compatibility.
        """
        valid_samesite = ["Strict", "Lax", "None"]
        sanitized = []
        for c in cookies:
            cookie_copy = dict(c)
            if "sameSite" in cookie_copy:
                val = str(cookie_copy["sameSite"])
                if val.lower() == "no_restriction":
                    cookie_copy["sameSite"] = "None"
                elif val.lower() == "unspecified":
                    del cookie_copy["sameSite"]
                elif val.capitalize() in valid_samesite:
                    cookie_copy["sameSite"] = val.capitalize()
                elif val not in valid_samesite:
                    del cookie_copy["sameSite"]
            sanitized.append(cookie_copy)
        return sanitized

    def start(self):
        self.playwright = sync_playwright().start()
        
        # Determine profile directory
        if self.custom_profile_dir:
            profile_dir = self.custom_profile_dir
        else:
            profile_dir = os.path.join(os.getcwd(), ".browser_profiles", self.session_id)
            
        os.makedirs(profile_dir, exist_ok=True)
        
        browser_args = ["--disable-blink-features=AutomationControlled"]
        if not self.headless:
            if self.hidden_headful:
                # Place window off-screen to avoid visual disturbance while passing bot detection
                browser_args.append("--window-position=-32000,-32000")
            else:
                browser_args.append("--start-maximized")

        self.context = self.playwright.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=self.headless,
            no_viewport=True,
            args=browser_args
        )

        self.page = self.context.pages[0] if self.context.pages else self.context.new_page()
        return self.page

    def import_cookies(self, cookies_data: List[Dict[str, Any]]) -> bool:
        if self.context and cookies_data:
            sanitized = self.sanitize_cookies(cookies_data)
            self.context.add_cookies(sanitized)
            return True
        return False

    def get_status(self) -> str:
        if self.context:
            return "READY"
        return "UNINITIALIZED"

    def stop(self):
        if self.context:
            try:
                self.context.close()
            except Exception:
                pass
            self.context = None
        if self.playwright:
            try:
                self.playwright.stop()
            except Exception:
                pass
            self.playwright = None
