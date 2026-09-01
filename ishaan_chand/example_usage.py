"""
BrowserAPIFree - Quickstart Demo
Demonstrates initializing the agent client, resuming/creating conversations,
sending queries, enabling web search/reasoning, and attaching files.
"""

import os
import sys

# Ensure local package modules are accessible
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent_client import ChatGPTAgentClient

def main():
    # 1. Path to your exported cookies file (DO NOT commit cookies.json to GitHub!)
    cookies_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cookies.json")
    
    if not os.path.exists(cookies_path):
        print(f"[-] Cookies file not found at: {cookies_path}")
        print("[-] Please export your ChatGPT cookies to 'cookies.json' (refer to cookies.example.json and README.md).")
        return

    # 2. Instantiate client
    #    - chat_name: Title of conversation in ChatGPT sidebar to open or create
    #    - headless: True for invisible execution, False for visual browser
    #    - hidden_headful: True to render off-screen (useful if bot detection triggers)
    client = ChatGPTAgentClient(
        cookies_path=cookies_path,
        chat_name="Agent Workspace",
        headless=True,
        hidden_headful=False
    )

    try:
        # 3. Start browser and establish session
        client.start(create_if_missing=True)

        # 4. Standard conversational prompt
        print("\n--- Sending Standard Query ---")
        answer = client.send_message("Explain the difference between synchronous and asynchronous Python in 3 bullet points.")
        print("\nAssistant Response:\n", answer)

        # 5. Query with Web Search enabled
        # print("\n--- Sending Query with Web Search ---")
        # news = client.send_message("What are the latest tech headlines today?", use_web_search=True)
        # print("\nAssistant Response:\n", news)

        # 6. Query with File Attachment
        # sample_file = os.path.abspath("sample.txt")
        # if os.path.exists(sample_file):
        #     print("\n--- Sending Query with File Attachment ---")
        #     file_summary = client.send_message("Summarize this attached file.", file_paths=[sample_file])
        #     print("\nAssistant Response:\n", file_summary)

    finally:
        # 7. Always close the browser session when finished
        client.close()

if __name__ == "__main__":
    main()
