# GrowEasy AI-Powered CSV Importer

An intelligent CSV importer that uses AI to map any CSV format into GrowEasy CRM lead format. Upload CSVs from Facebook Lead Exports, Google Ads, Excel sheets, marketing agency data, or any custom spreadsheet — the AI automatically identifies and maps the correct fields.

![GrowEasy CSV Importer](https://img.shields.io/badge/GrowEasy-CSV_Importer-1a7a4c?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express-5-black?style=flat-square&logo=express)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-blue?style=flat-square&logo=google)

## ✨ Features

- **🤖 AI-Powered Field Mapping** — Uses Google Gemini to intelligently map arbitrary CSV columns to CRM fields
- **📁 Drag & Drop Upload** — Beautiful drag-and-drop file upload with validation
- **👀 CSV Preview** — Virtualized table preview before processing (handles 10,000+ rows)
- **📊 Import Statistics** — Total processed, imported, skipped with success rate
- **🔄 Batch Processing** — Records processed in optimized batches with retry logic
- **🌙 Dark Mode** — Full dark/light theme support with system preference detection
- **📱 Responsive Design** — Works beautifully on desktop, tablet, and mobile
- **📥 CSV Export** — Download extracted CRM records as CSV
- **💾 Sample Template** — Download a sample CSV template for reference

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (React 19), TypeScript |
| **Backend** | Node.js, Express 5, TypeScript |
| **AI** | Google Gemini 2.0 Flash |
| **Styling** | Vanilla CSS with CSS Variables |

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Gemini API Key** — Get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/groweasy-csv-importer.git
   cd groweasy-csv-importer
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables**

   **Backend** (`backend/.env`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Running Locally

1. **Start the Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs at `http://localhost:3001`

2. **Start the Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs at `http://localhost:3000`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Docker

```bash
# Build and run both services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

## 📖 Usage

1. **Upload** — Drag & drop or click to select a CSV file
2. **Preview** — Review the raw CSV data in a scrollable table
3. **Confirm** — Click "Confirm Import" to start AI processing
4. **Results** — View extracted CRM records with import statistics

## 🧠 AI Extraction Details

The AI system:
- **Maps arbitrary columns** to CRM fields (e.g., "Phone Number", "Contact", "Mobile" all → `mobile_without_country_code`)
- **Normalizes dates** to JavaScript-parseable format
- **Extracts country codes** from phone numbers
- **Handles multiple emails/phones** (first used, rest in `crm_note`)
- **Validates CRM status** against allowed values
- **Skips invalid records** (no email + no phone)
- **Processes in batches** of 25 with exponential backoff retry

### Supported CRM Fields

| Field | Description |
|-------|-------------|
| `created_at` | Lead creation date |
| `name` | Lead name |
| `email` | Primary email |
| `country_code` | Country code |
| `mobile_without_country_code` | Mobile number |
| `company` | Company name |
| `city` | City |
| `state` | State |
| `country` | Country |
| `lead_owner` | Lead owner |
| `crm_status` | GOOD_LEAD_FOLLOW_UP / DID_NOT_CONNECT / BAD_LEAD / SALE_DONE |
| `crm_note` | Notes/remarks |
| `data_source` | Data source |
| `possession_time` | Property possession time |
| `description` | Additional description |

## 📁 Project Structure

```
├── frontend/                    # Next.js frontend app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Main page (4-step wizard)
│   │   │   └── globals.css      # Design system
│   │   ├── components/
│   │   │   ├── FileUpload.tsx   # Drag & drop upload
│   │   │   ├── CSVPreview.tsx   # Virtualized CSV table
│   │   │   ├── ResultsTable.tsx # CRM results table
│   │   │   ├── ImportStats.tsx  # Import statistics
│   │   │   ├── ProgressBar.tsx  # Processing animation
│   │   │   └── ThemeToggle.tsx  # Dark/light toggle
│   │   ├── lib/
│   │   │   ├── api.ts           # Backend API client
│   │   │   └── csvParser.ts     # Client-side CSV parser
│   │   └── types/
│   │       └── index.ts         # TypeScript types
│   └── package.json
│
├── backend/                     # Express API server
│   ├── src/
│   │   ├── index.ts             # Server entry point
│   │   ├── routes/
│   │   │   └── import.ts        # Import routes
│   │   ├── services/
│   │   │   ├── csvService.ts    # CSV parsing
│   │   │   └── aiService.ts     # AI extraction
│   │   ├── prompts/
│   │   │   └── extraction.ts    # AI prompts
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   └── utils/
│   │       └── validation.ts    # Validation utils
│   └── package.json
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/import` | Upload CSV + AI extraction |
| `POST` | `/api/import/parse` | Parse CSV for preview only |

## 📄 License

MIT

---

**Built with ❤️ for GrowEasy**
