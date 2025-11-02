// File storage
let examplesFiles = [];
let caseFiles = [];

// Update status footer
async function updateStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();

        document.getElementById('status-api-key').textContent = data.api_key_set ? 'Set ✓' : 'Not set';
        document.getElementById('status-api-key').style.color = data.api_key_set ? '#10b981' : '#ef4444';

        document.getElementById('status-examples').textContent = `${data.examples_count} files`;
        document.getElementById('status-case').textContent = `${data.case_files_count} files`;
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Save API Key
document.getElementById('save-api-key').addEventListener('click', async () => {
    const apiKey = document.getElementById('api-key').value.trim();
    const statusDiv = document.getElementById('api-key-status');

    if (!apiKey) {
        statusDiv.textContent = 'Please enter an API key';
        statusDiv.className = 'status-message error';
        return;
    }

    try {
        const response = await fetch('/api/set-api-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: apiKey })
        });

        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.textContent = 'API key saved successfully!';
            statusDiv.className = 'status-message success';
            updateStatus();
        }
    } catch (error) {
        statusDiv.textContent = 'Error saving API key: ' + error.message;
        statusDiv.className = 'status-message error';
    }
});

// Examples upload - drag and drop
const examplesDropZone = document.getElementById('examples-drop-zone');
const examplesInput = document.getElementById('examples-input');

examplesDropZone.addEventListener('click', () => examplesInput.click());

examplesDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    examplesDropZone.classList.add('dragover');
});

examplesDropZone.addEventListener('dragleave', () => {
    examplesDropZone.classList.remove('dragover');
});

examplesDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    examplesDropZone.classList.remove('dragover');
    examplesFiles = Array.from(e.dataTransfer.files);
    displayFileList(examplesFiles, 'examples-list');
});

examplesInput.addEventListener('change', (e) => {
    examplesFiles = Array.from(e.target.files);
    displayFileList(examplesFiles, 'examples-list');
});

// Case data upload - drag and drop
const caseDropZone = document.getElementById('case-drop-zone');
const caseInput = document.getElementById('case-input');

caseDropZone.addEventListener('click', () => caseInput.click());

caseDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    caseDropZone.classList.add('dragover');
});

caseDropZone.addEventListener('dragleave', () => {
    caseDropZone.classList.remove('dragover');
});

caseDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    caseDropZone.classList.remove('dragover');
    caseFiles = Array.from(e.dataTransfer.files);
    displayFileList(caseFiles, 'case-list');
});

caseInput.addEventListener('change', (e) => {
    caseFiles = Array.from(e.target.files);
    displayFileList(caseFiles, 'case-list');
});

// Display file list
function displayFileList(files, elementId) {
    const listDiv = document.getElementById(elementId);
    if (files.length === 0) {
        listDiv.innerHTML = '<p style="color: #94a3b8; text-align: center;">No files selected</p>';
        return;
    }

    listDiv.innerHTML = files.map(file =>
        `<div class="file-item">${file.name} (${formatFileSize(file.size)})</div>`
    ).join('');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Upload examples
document.getElementById('upload-examples').addEventListener('click', async () => {
    const statusDiv = document.getElementById('examples-status');

    if (examplesFiles.length === 0) {
        statusDiv.textContent = 'Please select files first';
        statusDiv.className = 'status-message error';
        return;
    }

    const formData = new FormData();
    examplesFiles.forEach(file => formData.append('files', file));

    statusDiv.textContent = 'Uploading and parsing files...';
    statusDiv.className = 'status-message loading';

    try {
        const response = await fetch('/api/upload-examples', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.textContent = data.message;
            statusDiv.className = 'status-message success';
            updateStatus();
        } else {
            statusDiv.textContent = data.message;
            statusDiv.className = 'status-message error';
        }
    } catch (error) {
        statusDiv.textContent = 'Error uploading files: ' + error.message;
        statusDiv.className = 'status-message error';
    }
});

// Upload case data
document.getElementById('upload-case-data').addEventListener('click', async () => {
    const statusDiv = document.getElementById('case-status');

    if (caseFiles.length === 0) {
        statusDiv.textContent = 'Please select files first';
        statusDiv.className = 'status-message error';
        return;
    }

    const formData = new FormData();
    caseFiles.forEach(file => formData.append('files', file));

    statusDiv.textContent = 'Uploading and parsing files...';
    statusDiv.className = 'status-message loading';

    try {
        const response = await fetch('/api/upload-case-data', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.textContent = data.message;
            statusDiv.className = 'status-message success';
            updateStatus();
        } else {
            statusDiv.textContent = data.message;
            statusDiv.className = 'status-message error';
        }
    } catch (error) {
        statusDiv.textContent = 'Error uploading files: ' + error.message;
        statusDiv.className = 'status-message error';
    }
});

// Generate complaint
document.getElementById('generate-complaint').addEventListener('click', async () => {
    const statusDiv = document.getElementById('generate-status');
    const outputDiv = document.getElementById('output');
    const copyBtn = document.getElementById('copy-complaint');
    const generateBtn = document.getElementById('generate-complaint');

    generateBtn.disabled = true;
    statusDiv.innerHTML = '<div class="loading-spinner"></div> Generating complaint with GPT-4... This may take 30-60 seconds...';
    statusDiv.className = 'status-message loading';
    outputDiv.innerHTML = '<p class="placeholder-text">Generating...</p>';

    try {
        const response = await fetch('/api/generate-complaint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.textContent = 'Complaint generated successfully!';
            statusDiv.className = 'status-message success';
            outputDiv.textContent = data.complaint;
            copyBtn.style.display = 'block';
        } else {
            statusDiv.textContent = 'Error: ' + data.message;
            statusDiv.className = 'status-message error';
            outputDiv.innerHTML = '<p class="placeholder-text" style="color: #dc2626;">' + data.message + '</p>';
        }
    } catch (error) {
        statusDiv.textContent = 'Error generating complaint: ' + error.message;
        statusDiv.className = 'status-message error';
        outputDiv.innerHTML = '<p class="placeholder-text" style="color: #dc2626;">Error: ' + error.message + '</p>';
    } finally {
        generateBtn.disabled = false;
    }
});

// Copy to clipboard
document.getElementById('copy-complaint').addEventListener('click', () => {
    const output = document.getElementById('output').textContent;
    navigator.clipboard.writeText(output).then(() => {
        const btn = document.getElementById('copy-complaint');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
});

// Initial status update
updateStatus();
