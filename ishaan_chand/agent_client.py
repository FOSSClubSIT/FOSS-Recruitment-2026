import os
import sys
import json
import urllib.parse
import time
from typing import Optional, List, Union

try:
    from .framework.browser_session import BrowserSession
    from .framework.chat_runtime import ChatRuntime
    from .framework.response_collector import ResponseCollector
    from .framework.adapter_loader import load_adapter
except (ImportError, ValueError):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    from framework.browser_session import BrowserSession
    from framework.chat_runtime import ChatRuntime
    from framework.response_collector import ResponseCollector
    from framework.adapter_loader import load_adapter


class ChatGPTAgentClient:
    """
    A programmatic, zero-cost API client for AI agents and scripts to interact
    with ChatGPT (or other supported interfaces) using Playwright and session cookies / persistent SSO profiles.
    """
    def __init__(
        self,
        cookies_path: Optional[str] = None,
        chat_name: str = "Agent",
        headless: bool = True,
        hidden_headful: bool = True,
        adapter_name: str = "chatgpt",
        profile_dir: Optional[str] = None
    ):
        """
        :param cookies_path: Path to the exported cookies.json file (Optional if using persistent profile_dir).
        :param chat_name: Name/Title of the conversation in the sidebar to resume (or create).
        :param headless: If True, runs browser silently without a GUI window.
        :param hidden_headful: If True, renders a headful window positioned off-screen (bypasses bot detection).
        :param adapter_name: Name of the adapter config in adapters/ (default: "chatgpt").
        :param profile_dir: Custom directory to store persistent browser session profiles (e.g. for Google/SSO login).
        """
        self.cookies_path = cookies_path
        self.chat_name = chat_name
        self.headless = headless
        self.hidden_headful = hidden_headful
        self.adapter_name = adapter_name
        self.profile_dir = profile_dir
        
        self.session: Optional[BrowserSession] = None
        self.page = None
        self.chat_runtime: Optional[ChatRuntime] = None
        self.adapter_config: Optional[dict] = None
        self.target_url = "https://chatgpt.com"
        
    def start(self, create_if_missing: bool = True):
        """
        Initializes the Playwright browser session, injects sanitized cookies (if provided),
        navigates to the interface, clears welcome popups, and selects/creates the target chat.
        """
        mode_label = "Headless" if self.headless else ("Hidden-Headful" if self.hidden_headful else "Visible-Headful")
        print(f"[ChatGPTAgentClient] Initializing BrowserSession (mode={mode_label}, adapter={self.adapter_name})...")
        
        # 1. Load adapter configuration
        self.adapter_config = load_adapter(self.adapter_name)
        if "base_url" in self.adapter_config:
            self.target_url = self.adapter_config["base_url"]
            
        # 2. Start browser session
        self.session = BrowserSession(
            session_id=f"agent_{self.adapter_name}_{int(time.time())}",
            headless=self.headless,
            hidden_headful=self.hidden_headful,
            profile_dir=self.profile_dir
        )
        self.page = self.session.start()
        
        # 3. Load and inject cookies (if specified)
        if self.cookies_path:
            if not os.path.exists(self.cookies_path):
                raise FileNotFoundError(
                    f"Cookies file not found at: {self.cookies_path}\n"
                    f"Please export your session cookies to JSON (see cookies.example.json) or log in with SSO."
                )
                
            print(f"[ChatGPTAgentClient] Loading cookies from {self.cookies_path}...")
            with open(self.cookies_path, "r", encoding="utf-8") as f:
                cookies = json.load(f)
                
            self.session.import_cookies(cookies)
        else:
            print("[ChatGPTAgentClient] No cookies_path provided. Relying on persistent profile context.")
            
        self.chat_runtime = ChatRuntime(self.page, self.adapter_config)
        
        # 4. Navigate to interface
        print(f"[ChatGPTAgentClient] Navigating to {self.target_url}...")
        self.page.goto(self.target_url, wait_until="domcontentloaded")
        self.page.wait_for_timeout(3000)
        
        # 5. Dismiss any initial modals / prompts
        self._dismiss_modals()
            
        # 6. Locate or create chat
        self._find_and_open_chat(create_if_missing)
        print("[ChatGPTAgentClient] Ready.")

    def _dismiss_modals(self):
        """Dismiss common welcome back / consent overlays."""
        try:
            account_btn = self.page.locator("button:has-text('continue')").first
            if account_btn.is_visible(timeout=1500):
                account_btn.click()
                self.page.wait_for_timeout(1000)
        except Exception:
            pass
            
        try:
            close_btn = self.page.locator("button[aria-label='Close'], button:has-text('Dismiss')").first
            if close_btn.is_visible(timeout=1000):
                close_btn.click()
        except Exception:
            pass

    def _find_and_open_chat(self, create_if_missing: bool):
        """
        Searches the sidebar for self.chat_name.
        """
        print(f"[ChatGPTAgentClient] Searching for chat titled '{self.chat_name}'...")
        sidebar = self.adapter_config.get("selectors", {}).get("sidebar", {})
        
        if "search_results" not in sidebar:
            print("[ChatGPTAgentClient] Info: 'search_results' selector not configured. Operating in current conversation.")
            return
            
        try:
            # Ensure sidebar is open
            try:
                sidebar_toggle = self.page.locator("button[aria-label*='sidebar' i]").first
                if sidebar_toggle.is_visible(timeout=1500):
                    sidebar_toggle.click()
                    self.page.wait_for_timeout(1000)
            except Exception:
                pass

            results_loc = self.page.locator(sidebar["search_results"])
            results_loc.first.wait_for(state="attached", timeout=5000)
            count = results_loc.count()
            
            found = False
            for i in range(min(count, 35)):
                el = results_loc.nth(i)
                title = el.inner_text().strip()
                if self.chat_name.lower() in title.lower():
                    href = el.get_attribute("href")
                    if href and not href.startswith("http"):
                        href = urllib.parse.urljoin(self.target_url, href)
                        
                    print(f"[ChatGPTAgentClient] Found conversation. Opening: {href}")
                    self.page.goto(href, wait_until="domcontentloaded")
                    self.page.wait_for_timeout(2000)
                    found = True
                    break
                    
            if not found:
                if create_if_missing:
                    print(f"[ChatGPTAgentClient] Chat '{self.chat_name}' not found. Initializing new conversation...")
                    new_chat_btn = sidebar.get("new_chat_button")
                    if new_chat_btn:
                        self.page.locator(new_chat_btn).first.click(timeout=5000, force=True)
                        self.page.wait_for_timeout(1000)
                else:
                    raise ValueError(f"Chat '{self.chat_name}' not found in the sidebar.")
                    
        except Exception as e:
            print(f"[ChatGPTAgentClient] Notice during sidebar scan: {str(e)}")

    def send_message(
        self,
        prompt: str,
        file_paths: Optional[List[str]] = None,
        use_web_search: bool = False,
        use_deep_research: bool = False,
        use_reasoning: bool = False
    ) -> str:
        """
        Sends a prompt (with optional file attachments or special tool modes) and
        synchronously awaits the fully generated response.

        :param prompt: The message/question text.
        :param file_paths: Optional list of absolute paths to local files to attach.
        :param use_web_search: If True, activates ChatGPT Web Search tool.
        :param use_deep_research: If True, activates ChatGPT Deep Research mode.
        :param use_reasoning: If True, activates Reasoning / Thinking mode.
        :return: Extracted text of the assistant's response.
        """
        if not self.chat_runtime or not self.page:
            raise RuntimeError("Client not started. Call .start() before sending messages.")
            
        # Handle search / research tool toggles
        if use_web_search or use_deep_research:
            try:
                attach_btn = self.page.locator("button[aria-label*='Attach']").first
                if attach_btn.is_visible(timeout=2000):
                    attach_btn.click(force=True)
                    self.page.wait_for_timeout(800)
                
                if use_web_search:
                    self.page.get_by_text("Web search").first.click(timeout=3000, force=True)
                elif use_deep_research:
                    self.page.get_by_text("Deep research").first.click(timeout=3000, force=True)
                self.page.wait_for_timeout(500)
            except Exception as e:
                print(f"[ChatGPTAgentClient] Warning: Could not toggle search tool: {e}")
                
        if use_reasoning:
            try:
                self.page.get_by_text("Reason").first.click(timeout=2000)
            except Exception:
                pass
                
        preview = prompt[:60].replace('\n', ' ')
        print(f"[ChatGPTAgentClient] Sending message: '{preview}...' (attachments: {len(file_paths) if file_paths else 0})")
        
        self.chat_runtime.send_message(prompt, file_paths=file_paths)
        
        collector = ResponseCollector(self.page, self.adapter_config)
        response_text, metrics = collector.wait_and_collect()
        
        return response_text

    def close(self):
        """
        Closes the active browser session and frees resources.
        """
        if self.session:
            print("[ChatGPTAgentClient] Closing browser session...")
            self.session.stop()
            self.session = None
            self.page = None
            self.chat_runtime = None
