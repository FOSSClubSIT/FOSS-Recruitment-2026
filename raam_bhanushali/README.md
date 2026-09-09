# ResumeForge

ResumeForge is an AI-powered resume-to-portfolio platform that converts a user's resume into a structured professional portfolio. Users can upload a PDF or DOCX resume, extract its contents, analyze the information with an AI model, select a portfolio theme, and publish a personalized portfolio with visitor analytics.

## Features

- User registration and authentication
- PDF and DOCX resume upload
- Resume text extraction
- AI-powered resume analysis
- Structured resume data using JSON
- Professional profile detection
- Automatic portfolio generation
- Multiple portfolio themes
- Portfolio publishing with unique URLs
- Visitor/view tracking
- Portfolio analytics dashboard
- PostgreSQL database with Prisma ORM
- Responsive UI

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Auth.js
- **AI:** Ollama with Qwen
- **Resume Processing:** PDF/DOCX text extraction
- **Deployment:** Vercel

## How It Works

```text
Resume Upload
      ↓
File Validation
      ↓
PDF/DOCX Text Extraction
      ↓
AI Resume Analysis
      ↓
Structured JSON Resume Data
      ↓
Data Validation & Repair
      ↓
Theme Selection
      ↓
Portfolio Generation
      ↓
Publish Portfolio
      ↓
Visitor Tracking & Analytics