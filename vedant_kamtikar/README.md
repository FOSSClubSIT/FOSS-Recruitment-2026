# Academic Task & Announcement Aggregator Agent

An autonomous background automation agent in Python that aggregates academic deadlines and announcements across Moodle LMS and Google Workspace (Gmail), filters tasks specifically for **Batch C3**, uses Google Gemini for importance/urgency classification, prevents duplicate alerts via SQLite, and delivers deterministic Telegram notifications.

---

## Architecture Overview

```
                        ┌───────────────────────────────┐
                        │       Data Ingestion          │
                        │  Moodle API  │   Gmail OAuth  │
                        └───────┬───────────────┬───────┘
                                │               │
                        (moodle_api)     (llm_extracted)
                                │               │
                                ▼               ▼
                        ┌───────────────────────────────┐
                        │      TaskItem Pipeline        │
                        │  - Batch C3 Relevance Filter  │
                        │  - Native Timestamp Integrity │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │   State & Deduplication (DB)  │
                        │ MD5(source+item_id+due_date)  │
                        └───────────────┬───────────────┘
                                        │ (new / changed items only)
                                        ▼
                        ┌───────────────────────────────┐
                        │   Gemini 2.5 Intelligence     │
                        │ - Urgency (high/medium/low)   │
                        │ - Concise 1-2 sentence summary│
                        │ - Action Required judgment    │
                        │ * Moodle due_date immutable!  │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │   Telegram Template Dispatch  │
                        │ - Urgent (<48h or high) Alert │
                        │ - Batched Morning Digest      │
                        │ - Zero-LLM Deterministic HTML │
                        └───────────────────────────────┘
```

### Key Engineering Guarantees
1. **Timestamp Immutability**: Moodle `due_date` values are native Unix timestamps converted deterministically. The LLM is never given permission or opportunity to modify them.
2. **Provenance Tracking**: Every item carries `due_date_origin: "moodle_api" | "llm_extracted"`, documenting why items are handled differently downstream.
3. **Dynamic Re-triggering**: SQLite hashes combine `MD5(source + item_id + due_date)`. If a professor extends an assignment deadline, the hash automatically shifts and delivers a new alert.
4. **Resilient Formatting**: Telegram alerts use deterministic HTML templates (`parse_mode="HTML"`) rather than MarkdownV2, eliminating escaping errors from user-generated course names.

---

## Directory Structure

```
c:\Users\LOQ\Desktop\Assistant\
├── .env.example              # Configuration template
├── .gitignore
├── requirements.txt
├── README.md
├── main.py                   # Orchestrator & CLI entry point
│
├── src/
│   ├── __init__.py
│   ├── config.py             # Typed settings loader
│   ├── models.py             # Canonical TaskItem and Pydantic schemas
│   ├── moodle_client.py      # Module A: Moodle Web Services client
│   ├── gmail_client.py       # Module B: Gmail API client stub
│   ├── llm_processor.py      # Module C: Gemini classification & date extraction
│   ├── db_manager.py         # Module D: SQLite state & deduplication
│   └── telegram_notifier.py  # Module E: Telegram HTML templated alerts
│
├── tests/
│   ├── __init__.py
│   ├── test_moodle_client.py # Batch filtering & parsing tests
│   ├── test_db_manager.py    # Deduplication & deadline shift tests
│   └── test_llm_processor.py # Date immutability & fallback tests
│
├── data/
│   └── notifications.db      # SQLite database (auto-generated)
│
└── credentials/
    └── .gitkeep              # OAuth credentials (credentials.json, token.json)
```

---

## Setup & Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
- `MOODLE_BASE_URL`: Base URL of your portal (e.g., `https://moodle.youruniv.edu`)
- `MOODLE_USERNAME`: Your PRN or student ID
- `MOODLE_PASSWORD`: Your portal password
- `MOODLE_TARGET_BATCH`: Target batch name (default: `Batch C3`)
- `GEMINI_API_KEY`: API key from [Google AI Studio](https://aistudio.google.com/)
- `TELEGRAM_BOT_TOKEN`: From Telegram's [@BotFather](https://t.me/BotFather)
- `TELEGRAM_CHAT_ID`: Your numerical Telegram user/channel ID

### 3. Run Automated Tests
```bash
pytest -v tests
```

### 4. Run Dry-Run Simulation
To test the pipeline without sending real Telegram messages or persisting to the database:
```bash
python main.py --dry-run
```

### 5. Run Live Pipeline
```bash
python main.py
```
To bypass the database deduplication filter and re-evaluate all items:
```bash
python main.py --force
```

---

## Scheduling Daily Execution (Cron)

To run the agent automatically every morning at 07:00 AM:

### Linux / macOS (System Cron)
Open your crontab:
```bash
crontab -e
```
Add the following entry (update paths accordingly):
```cron
0 7 * * * cd /path/to/Assistant && /path/to/venv/bin/python main.py >> /path/to/Assistant/data/cron.log 2>&1
```

### Windows (Task Scheduler)
Create a Scheduled Task running daily at 07:00:
- **Program/script:** `python.exe` (or your virtual environment's `python.exe`)
- **Arguments:** `main.py`
- **Start in:** `c:\Users\LOQ\Desktop\Assistant`
