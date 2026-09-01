# BrowserAPIFree — Conversational AI Agent Framework

## 📌 What the Project Does
BrowserAPIFree is a zero-cost Python automation framework that enables AI agents and local scripts to interact programmatically with web-based conversational AI interfaces like ChatGPT and Google NotebookLM without requiring paid API keys. It handles session authentication via sanitized cookie injection or persistent SSO profiles, bypasses Cloudflare anti-bot detection using an off-screen stealth mode, and provides full programmatic access to Web Search, Deep Research, Reasoning (o1/o3-mini), and file attachments.

---

## 🚀 Exact Commands to Run

### 1. Install Dependencies & Browser
```bash
# Navigate to the project directory
cd ishaan_chand

# Install Python requirements
pip install -r requirements.txt

# Install Playwright Chromium engine
playwright install chromium
```

### 2. Configure Authentication (Choose One)

#### Option A: Cookie Injection (for ChatGPT)
1. Log into [chatgpt.com](https://chatgpt.com) in your normal browser.
2. Export your cookies as JSON using an extension like **Cookie-Editor** or DevTools (`F12` -> `Application` -> `Cookies`).
3. Save the JSON as `cookies.json` inside this folder (see `cookies.example.json` for format).

#### Option B: 1-Time SSO Login (for Google / NotebookLM / Enterprise SSO)
Run the interactive SSO login helper once:
```bash
python auth_smoke_test.py --login-sso --adapter notebooklm --profile .browser_profiles/notebooklm
```
*A browser window will open. Log in with your account once, hit Enter in your terminal, and the persistent session is saved.*

### 3. Run the Authentication Smoke Test
Verify that your session is authenticated and accessible:
```bash
# For ChatGPT (Cookie mode):
python auth_smoke_test.py --test-cookies --adapter chatgpt --cookies cookies.json

# For NotebookLM (Persistent Profile mode):
python auth_smoke_test.py --test-profile --adapter notebooklm --profile .browser_profiles/notebooklm
```

### 4. Run the Demo Script
```bash
python example_usage.py
```

---

## 💡 What I Found Hard & What I Would Do Differently

### 1. The Cloudflare Challenge & Stealth Bypass
* **The Challenge**: Initially, running standard Playwright `headless=True` against ChatGPT resulted in Cloudflare Turnstile blocking the request with a `"Just a moment..."` challenge page.
* **The Solution**: Standard headless browser flags (`navigator.webdriver`, missing window bounds, headless user-agents) are easily fingerprinted. I developed a **`hidden_headful`** mode (`headless=False, args=["--window-position=-32000,-32000"]`). This launches a genuine, full Chromium browser instance rendered far outside the visible desktop display boundaries. It completely clears Cloudflare challenges while remaining 100% invisible to the user.

### 2. Google's Device-Bound Session Credentials (DBSC) vs Cookies
* **The Challenge**: While cookie injection works flawlessly for ChatGPT, Google products (NotebookLM, Workspace) reject raw injected JSON cookies because they bind sessions to local hardware crypto keys and OAuth tokens.
* **The Solution**: Built a **Dual-Authentication architecture**:
  1. **Mode A (Cookie Injection)** for cookie-based platforms.
  2. **Mode B (Persistent SSO Profiles)** with a 1-time interactive helper (`--login-sso`) that persists the full `user_data_dir` (IndexedDB, LocalStorage, crypto tokens) for Google / enterprise SSO.

### 3. What I Would Do Differently
* **Persistent Daemon / Hot Session Pool**: Currently, each CLI or script invocation starts a Playwright context with a ~1.5s cold-start penalty. If building this further, I would implement a lightweight local background daemon (over WebSockets or FastAPI) that keeps the browser instance hot in memory for instant (<100ms) message dispatch.
* **Streaming Generator API**: The response collector currently waits for the full text to stabilize before returning. Exposing a Python generator `yield` stream would allow real-time terminal streaming of tokens as ChatGPT types them.

---

## 🌟 Key Features

* **⚡ Zero-Cost Automation**: Use ChatGPT, NotebookLM, and AI web UIs without paid API subscriptions.
* **🔑 Dual Authentication**: JSON Cookie injection with automatic `sameSite` sanitization + Persistent SSO profile support.
* **🛡️ Triple Browser Modes**: `headless` (silent), `hidden_headful` (stealth off-screen), and `visible` (debugging).
* **💬 Sidebar Chat Management**: Searches previous chat history for a named conversation or automatically creates a new one.
* **🔍 ChatGPT Power Features**:
  * 🌐 Web Search (`use_web_search=True`)
  * 🔬 Deep Research (`use_deep_research=True`)
  * 🧠 Reasoning / Think mode (`use_reasoning=True`)
* **📎 Multi-modal File Uploads**: Drag-and-drop local files into chat dropzones via synthetic Base64 `DataTransfer`.
* **🏎️ Response Stability & TTFT Tracking**: High-speed JavaScript DOM evaluation tracks Time-To-First-Token and avoids flaky timers.
* **🔌 Decoupled JSON Adapters**: UI selectors and timing rules are stored in `adapters/*.adapter.json` so DOM changes can be fixed without touching Python code.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    UserScript[Your Script / Agent] -->|Calls .send_message()| AgentClient[ChatGPTAgentClient]
    AgentClient -->|Loads Locators| Adapter[(adapters/*.adapter.json)]
    AgentClient -->|Injects Cookies / SSO Profile| AuthLayer[Auth Layer]
    AuthLayer -->|Launches Chromium Context| BrowserSession[BrowserSession / Playwright]
    BrowserSession -->|Stealth Navigation| TargetWeb[ChatGPT / NotebookLM]
    AgentClient -->|Types prompt & drops files| ChatRuntime[ChatRuntime]
    ChatRuntime -->|Dispatches DOM Events| TargetWeb
    TargetWeb -->|Streams Output| ResponseCollector[ResponseCollector]
    ResponseCollector -->|Stabilized Text| UserScript
```

---

## 📖 Basic Code Example

```python
import os
from agent_client import ChatGPTAgentClient

# 1. Initialize client
client = ChatGPTAgentClient(
    cookies_path=os.path.abspath("cookies.json"),
    chat_name="Agent Workspace",
    headless=False,
    hidden_headful=True  # Renders off-screen: 100% invisible, bypasses Cloudflare
)

try:
    # 2. Start session
    client.start(create_if_missing=True)

    # 3. Send query
    response = client.send_message("Explain the CAP theorem in 3 bullet points.")
    print("Response:\n", response)

finally:
    # 4. Clean up
    client.close()
```

---

## 🔒 Security Notice

* Real session cookies (`cookies.json`) and browser profiles (`.browser_profiles/`) contain private session credentials and are strictly excluded via `.gitignore`.
* A sample template `cookies.example.json` is provided for reference.

---

## 📄 License

MIT License.
