# Supio Draft by Example - MVP

A simple web application for generating legal documents (complaints, demand letters) from example templates.

## Features

- Upload/paste example legal documents with placeholder variables
- Fill in case-specific facts via web form
- Generate customized drafts instantly
- Simple variable substitution using `{{placeholder}}` syntax

## Quick Start

1. Install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Run the application:
```bash
python3 app.py
```

3. Open your browser to: `http://localhost:5000`

## How to Use

1. **Create a Template**: Paste your example document in the left panel. Use `{{variable_name}}` for fields you want to customize.
2. **Enter Case Facts**: Fill in the form on the right with specific case details.
3. **Generate Draft**: Click "Generate Draft" to see your customized document.

## Example Template Format

```
COMPLAINT FOR PERSONAL INJURY

Plaintiff: {{plaintiff_name}}
vs.
Defendant: {{defendant_name}}

On {{incident_date}}, the plaintiff sustained {{injury_description}}...
```

## Tech Stack

- Backend: Python Flask
- Frontend: HTML/CSS/JavaScript
- Storage: In-memory (for MVP)
