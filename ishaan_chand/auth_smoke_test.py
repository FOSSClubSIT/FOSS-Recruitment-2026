"""
BrowserAPIFree - Authentication Smoke Test & SSO Profile Helper

Usage:
  1. Test Cookie Injection:
     python auth_smoke_test.py --test-cookies --adapter chatgpt --cookies cookies.json

  2. Interactive 1-Time SSO Login (for Google/NotebookLM or SSO-enforced accounts):
     python auth_smoke_test.py --login-sso --adapter notebooklm --profile .browser_profiles/notebooklm

  3. Test Existing Persistent Profile:
     python auth_smoke_test.py --test-profile --adapter notebooklm --profile .browser_profiles/notebooklm
"""

import os
import sys
import time
import json
import argparse

# Ensure local package modules are accessible
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from framework.browser_session import BrowserSession
from framework.adapter_loader import load_adapter


def run_cookie_smoke_test(adapter_name: str, cookies_path: str, hidden_headful: bool = True):
    print("=" * 65)
    print(f" SMOKE TEST: Cookie Injection Authentication [{adapter_name.upper()}]")
    print("=" * 65)

    if not os.path.exists(cookies_path):
        print(f"[-] Error: Cookies file '{cookies_path}' not found!")
        print("[-] Please export cookies to JSON first (see cookies.example.json).")
        return False

    try:
        adapter_config = load_adapter(adapter_name)
    except Exception as e:
        print(f"[-] Error loading adapter '{adapter_name}': {e}")
        return False

    target_url = adapter_config.get("base_url", "https://chatgpt.com")
    print(f"[*] Target URL: {target_url}")
    print(f"[*] Cookies File: {cookies_path}")
    print(f"[*] Mode: {'Hidden-Headful (Stealth)' if hidden_headful else 'Headless'}")

    session = BrowserSession(
        session_id=f"smoke_test_{int(time.time())}",
        headless=False if hidden_headful else True,
        hidden_headful=hidden_headful
    )

    try:
        print("[*] Launching browser engine...")
        page = session.start()

        with open(cookies_path, "r", encoding="utf-8") as f:
            cookies = json.load(f)
        session.import_cookies(cookies)
        print(f"[+] Injected {len(cookies)} cookies into browser context.")

        print(f"[*] Navigating to {target_url}...")
        page.goto(target_url, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)

        current_url = page.url
        title = page.title()
        print(f"[*] Landed URL: {current_url}")
        print(f"[*] Page Title: {title}")

        # Check for Cloudflare / Turnstile
        if "Just a moment" in title or "Cloudflare" in title:
            print("\n[!] CHALLENGE DETECTED: Cloudflare Turnstile blocked standard headless request.")
            print("[!] Recommendation: Run with hidden_headful=True or use a persistent profile.")
            return False

        # Check for login redirects
        auth_redirect_indicators = [
            "accounts.google.com",
            "auth.openai.com",
            "/auth/login",
            "/login",
            "signin",
            "identifier"
        ]
        is_redirected_to_auth = any(ind in current_url.lower() for ind in auth_redirect_indicators)

        # Check for main UI selector
        input_selector = adapter_config.get("selectors", {}).get("chat_input")
        input_visible = False
        if input_selector:
            try:
                input_visible = page.locator(input_selector).first.is_visible(timeout=5000)
            except Exception:
                input_visible = False

        print("\n" + "-" * 40)
        print(" DIAGNOSTIC RESULT:")
        print("-" * 40)
        if input_visible:
            print(f"[SUCCESS] Cookie injection is FULLY SUPPORTED and ACTIVE on {adapter_name}!")
            print(f"          Chat input locator '{input_selector}' found and accessible.")
            return True
        elif is_redirected_to_auth:
            print(f"[AUTH REQUIRED] The service redirected to login: {current_url}")
            print(f"               This occurs when session cookies have expired or when the provider")
            print(f"               (e.g., Google/NotebookLM) enforces device-bound tokens / SSO.")
            print(f"\n[ACTION] Run 1-time SSO login to create a persistent profile:")
            print(f"         python auth_smoke_test.py --login-sso --adapter {adapter_name} --profile .browser_profiles/{adapter_name}")
            return False
        else:
            print(f"[INCONCLUSIVE] Landed on '{title}' ({current_url}).")
            print(f"              Verify that '{adapter_name}.adapter.json' locators match the live UI.")
            return False

    finally:
        session.stop()


def run_interactive_sso_login(adapter_name: str, profile_dir: str):
    print("=" * 65)
    print(f" INTERACTIVE SSO LOGIN HELPER [{adapter_name.upper()}]")
    print("=" * 65)

    try:
        adapter_config = load_adapter(adapter_name)
    except Exception as e:
        print(f"[-] Error loading adapter '{adapter_name}': {e}")
        return

    target_url = adapter_config.get("base_url", "https://chatgpt.com")
    profile_path = os.path.abspath(profile_dir)
    print(f"[*] Target URL: {target_url}")
    print(f"[*] Profile Directory: {profile_path}")
    print("\n[!] A visible browser window will now open.")
    print("[!] Log in using your Google / Microsoft / SSO account in the browser.")

    session = BrowserSession(
        session_id=adapter_name,
        headless=False,
        hidden_headful=False,
        profile_dir=profile_path
    )

    try:
        page = session.start()
        print(f"[*] Navigating to {target_url}...")
        page.goto(target_url)

        print("\n" + "=" * 65)
        print(" >>> Complete your login in the browser window now. <<<")
        print(" >>> Once you see your chat dashboard, return here and press [ENTER]. <<<")
        print("=" * 65)
        input("\nPress ENTER here after you have successfully logged in...")

        page.wait_for_timeout(2000)
        print(f"[+] Saved persistent session state into: {profile_path}")
        print("[+] You can now run this adapter headlessly with profile_dir!")

    finally:
        session.stop()


def run_profile_smoke_test(adapter_name: str, profile_dir: str):
    print("=" * 65)
    print(f" SMOKE TEST: Persistent Profile Authentication [{adapter_name.upper()}]")
    print("=" * 65)

    profile_path = os.path.abspath(profile_dir)
    if not os.path.exists(profile_path):
        print(f"[-] Error: Profile directory '{profile_path}' does not exist.")
        print(f"[-] Run '--login-sso' first to generate this profile.")
        return False

    adapter_config = load_adapter(adapter_name)
    target_url = adapter_config.get("base_url", "https://chatgpt.com")

    session = BrowserSession(
        session_id=adapter_name,
        headless=False,
        hidden_headful=True,
        profile_dir=profile_path
    )

    try:
        print(f"[*] Launching browser with profile: {profile_path}...")
        page = session.start()
        page.goto(target_url, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        input_selector = adapter_config.get("selectors", {}).get("chat_input")
        is_authenticated = False
        if input_selector:
            try:
                is_authenticated = page.locator(input_selector).first.is_visible(timeout=5000)
            except Exception:
                is_authenticated = False

        if is_authenticated:
            print(f"[SUCCESS] Persistent profile is AUTHENTICATED on {adapter_name}!")
            return True
        else:
            print(f"[FAILED] Profile did not bypass login on {target_url}. Current URL: {page.url}")
            return False
    finally:
        session.stop()


def main():
    parser = argparse.ArgumentParser(description="BrowserAPIFree Authentication Smoke Tester & SSO Helper")
    parser.add_argument("--test-cookies", action="store_true", help="Test cookie injection authentication")
    parser.add_argument("--login-sso", action="store_true", help="Launch interactive browser to log in with Google/SSO and save persistent profile")
    parser.add_argument("--test-profile", action="store_true", help="Test existing persistent profile")
    parser.add_argument("--adapter", type=str, default="chatgpt", help="Adapter name (default: chatgpt)")
    parser.add_argument("--cookies", type=str, default="cookies.json", help="Path to cookies JSON file")
    parser.add_argument("--profile", type=str, default=".browser_profiles/default", help="Path to profile directory")

    args = parser.parse_args()

    if args.test_cookies:
        run_cookie_smoke_test(args.adapter, args.cookies)
    elif args.login_sso:
        run_interactive_sso_login(args.adapter, args.profile)
    elif args.test_profile:
        run_profile_smoke_test(args.adapter, args.profile)
    else:
        # Default: run cookie test if cookies exist, otherwise show help
        if os.path.exists(args.cookies):
            run_cookie_smoke_test(args.adapter, args.cookies)
        else:
            parser.print_help()


if __name__ == "__main__":
    main()
