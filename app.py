from flask import Flask, render_template, request, jsonify
import os
import re
from datetime import datetime

app = Flask(__name__)

# Store templates in memory for MVP
templates = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/save-template', methods=['POST'])
def save_template():
    """Save an example template"""
    data = request.json
    template_name = data.get('name', 'default')
    template_text = data.get('text', '')
    templates[template_name] = template_text
    return jsonify({'status': 'success', 'message': 'Template saved'})

@app.route('/api/generate', methods=['POST'])
def generate_draft():
    """Generate a new draft from template and case facts"""
    data = request.json
    template_name = data.get('template', 'default')
    case_facts = data.get('facts', {})

    if template_name not in templates:
        return jsonify({'status': 'error', 'message': 'Template not found'}), 400

    # Simple variable substitution
    draft = templates[template_name]

    # Replace placeholders like {{plaintiff_name}}, {{defendant_name}}, etc.
    for key, value in case_facts.items():
        placeholder = '{{' + key + '}}'
        draft = draft.replace(placeholder, str(value))

    # Add generation date
    draft = draft.replace('{{date}}', datetime.now().strftime('%B %d, %Y'))

    return jsonify({
        'status': 'success',
        'draft': draft
    })

@app.route('/api/templates', methods=['GET'])
def list_templates():
    """List available templates"""
    return jsonify({
        'templates': list(templates.keys())
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
