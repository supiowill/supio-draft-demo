# Supio Draft by Example - AI-Powered MVP

An AI-powered web application for generating legal documents (complaints, demand letters) using GPT-4 and example-based learning.

## Features

### AI-Powered Generation
- **Multiple file format support**: Upload PDFs, DOCX, JSON, and TXT files
- **Example-based learning**: Upload 1-5 example complaints from your firm
- **Intelligent analysis**: GPT-4 learns your firm's style, structure, and legal language
- **Multi-file case data**: Upload medical records, incident reports, Filevine JSON exports, etc.
- **Smart synthesis**: AI extracts relevant facts and drafts comprehensive complaints

### File Processing
- PDF text extraction
- DOCX document parsing
- JSON data formatting (supports complex Filevine exports)
- Text file handling

### User Experience
- Drag-and-drop file upload
- Real-time status tracking
- Clean, modern interface
- Copy-to-clipboard functionality

## Quick Start

1. **Install dependencies:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Run the application:**
```bash
python3 app.py
```

3. **Open your browser to:** `http://127.0.0.1:5000`

## How to Use

### Step 0: Set Your OpenAI API Key
Enter your OpenAI API key in the purple section at the top. Get one at: https://platform.openai.com/api-keys

### Step 1: Upload Example Complaints
- Upload 1-5 example complaints from your law firm (PDF or DOCX format)
- These serve as style and structure templates
- AI will learn your firm's specific legal language and formatting

### Step 2: Upload Case Data
- Upload all relevant case files:
  - Medical records (PDF)
  - Incident reports (PDF/DOCX)
  - Filevine JSON export
  - Any other case documentation
- AI will extract relevant facts from all files

### Step 3: Generate Complaint
Click "Generate Complaint with GPT-4" and wait 30-60 seconds while the AI:
1. Analyzes your example complaints
2. Extracts key facts from case data
3. Drafts a new complaint matching your firm's style

## Example Use Case

**Scenario:** Motor Vehicle Accident (MVA) case

**Upload Examples:**
- `Sample_Complaint_MVA_1.docx`
- `Sample_Complaint_MVA_2.pdf`

**Upload Case Data:**
- `Aziz_Jisr_Timeline.json` (Filevine export with full case details)
- `Medical_Records_HonorHealth.pdf`
- `Police_Report.pdf`

**Result:** AI-generated complaint incorporating all case facts in your firm's style.

## Tech Stack

- **Backend:** Python Flask
- **AI:** OpenAI GPT-4
- **File Parsing:** PyPDF2, python-docx
- **Frontend:** HTML/CSS/JavaScript
- **Storage:** In-memory (for MVP)

## API Key Security

For this MVP, API keys are stored in memory only (cleared on server restart). For production use, implement secure key management.

## Supported File Types

- `.pdf` - PDF documents
- `.docx` - Microsoft Word documents
- `.json` - JSON data (including Filevine exports)
- `.txt` - Plain text files

## Requirements

- Python 3.9+
- OpenAI API key
- Internet connection (for API calls)

## Future Enhancements

- Claude API support (alternative to GPT-4)
- DOCX export of generated complaints
- Multiple template styles
- Database persistence
- User authentication
- Batch processing
- Integration with case management systems

## GitHub Repository

https://github.com/supiowill/supio-draft-demo

## License

Internal demo - Plattner Verderame, PC
