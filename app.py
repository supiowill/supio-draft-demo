from flask import Flask, render_template, request, jsonify
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
from openai import OpenAI

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = '/tmp/supio-uploads'

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Store data in memory for MVP
complaint_examples = []  # List of example complaint texts
case_data_files = []  # List of parsed case data
openai_api_key = None

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'json', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_pdf(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        return f"Error parsing PDF: {str(e)}"

def parse_docx(file_path):
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        return f"Error parsing DOCX: {str(e)}"

def parse_json(file_path):
    """Extract and format JSON data"""
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            # Pretty print JSON for better readability
            return json.dumps(data, indent=2)
    except Exception as e:
        return f"Error parsing JSON: {str(e)}"

def parse_file(file_path, filename):
    """Parse file based on extension"""
    ext = filename.rsplit('.', 1)[1].lower()

    if ext == 'pdf':
        return parse_pdf(file_path)
    elif ext == 'docx':
        return parse_docx(file_path)
    elif ext == 'json':
        return parse_json(file_path)
    elif ext == 'txt':
        with open(file_path, 'r') as f:
            return f.read()
    else:
        return "Unsupported file type"

@app.route('/')
def index():
    return render_template('index_ai.html')

@app.route('/api/set-api-key', methods=['POST'])
def set_api_key():
    """Store OpenAI API key"""
    global openai_api_key
    data = request.json
    openai_api_key = data.get('api_key', '')
    return jsonify({'status': 'success', 'message': 'API key set'})

@app.route('/api/upload-examples', methods=['POST'])
def upload_examples():
    """Upload and store complaint examples"""
    global complaint_examples

    if 'files' not in request.files:
        return jsonify({'status': 'error', 'message': 'No files provided'}), 400

    files = request.files.getlist('files')
    parsed_examples = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Parse the file
            text = parse_file(file_path, filename)
            parsed_examples.append({
                'filename': filename,
                'text': text
            })

            # Clean up
            os.remove(file_path)

    complaint_examples = parsed_examples

    return jsonify({
        'status': 'success',
        'message': f'{len(parsed_examples)} example(s) uploaded',
        'examples': [ex['filename'] for ex in parsed_examples]
    })

@app.route('/api/upload-case-data', methods=['POST'])
def upload_case_data():
    """Upload and store case data files"""
    global case_data_files

    if 'files' not in request.files:
        return jsonify({'status': 'error', 'message': 'No files provided'}), 400

    files = request.files.getlist('files')
    parsed_files = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Parse the file
            text = parse_file(file_path, filename)
            parsed_files.append({
                'filename': filename,
                'text': text
            })

            # Clean up
            os.remove(file_path)

    case_data_files = parsed_files

    return jsonify({
        'status': 'success',
        'message': f'{len(parsed_files)} file(s) uploaded',
        'files': [f['filename'] for f in parsed_files]
    })

@app.route('/api/generate-complaint', methods=['POST'])
def generate_complaint():
    """Generate complaint using GPT-4"""
    global openai_api_key, complaint_examples, case_data_files

    if not openai_api_key:
        return jsonify({'status': 'error', 'message': 'OpenAI API key not set'}), 400

    if not complaint_examples:
        return jsonify({'status': 'error', 'message': 'No complaint examples uploaded'}), 400

    if not case_data_files:
        return jsonify({'status': 'error', 'message': 'No case data uploaded'}), 400

    try:
        # Build the prompt
        examples_text = "\n\n---EXAMPLE COMPLAINT---\n\n".join([ex['text'] for ex in complaint_examples])
        case_data_text = "\n\n---CASE FILE---\n\n".join([f"{file['filename']}:\n{file['text']}" for file in case_data_files])

        prompt = f"""You are a legal document drafter for a personal injury law firm specializing in motor vehicle accident cases.

Your task is to draft a new complaint based on the example complaints provided and the case-specific data.

EXAMPLE COMPLAINTS (use these as style and format reference):
{examples_text}

CASE DATA FOR NEW COMPLAINT:
{case_data_text}

Instructions:
1. Analyze the example complaints to understand the firm's style, structure, and legal language
2. Review all case data files to extract relevant facts (client info, incident details, injuries, damages, defendants, etc.)
3. Draft a new complaint that:
   - Follows the same structure and style as the examples
   - Incorporates all relevant facts from the case data
   - Uses appropriate legal language and formatting
   - Includes all necessary sections (parties, jurisdiction, facts, causes of action, damages, prayer for relief)
4. Be thorough but avoid including irrelevant information
5. If case data is unclear or contradictory, make reasonable assumptions based on typical MVA cases

Generate the complete complaint now:"""

        # Call OpenAI API
        client = OpenAI(api_key=openai_api_key)

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert legal document drafter specializing in personal injury complaints."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )

        generated_complaint = response.choices[0].message.content

        return jsonify({
            'status': 'success',
            'complaint': generated_complaint
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error generating complaint: {str(e)}'
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current status of uploaded files"""
    return jsonify({
        'api_key_set': openai_api_key is not None,
        'examples_count': len(complaint_examples),
        'examples': [ex['filename'] for ex in complaint_examples],
        'case_files_count': len(case_data_files),
        'case_files': [f['filename'] for f in case_data_files]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
