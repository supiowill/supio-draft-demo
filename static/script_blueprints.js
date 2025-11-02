// File storage
let examplesFiles = [];
let caseFiles = [];
let selectedBlueprintId = null;

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');
    });
});

// Update status footer
async function updateStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();

        document.getElementById('status-api-key').textContent = data.api_key_set ? 'Set ✓' : 'Not set';
        document.getElementById('status-api-key').style.color = data.api_key_set ? '#10b981' : '#ef4444';
        document.getElementById('status-case').textContent = `${data.case_files_count} files`;

        // Load blueprints
        await loadBlueprints();
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Load and display blueprints
async function loadBlueprints() {
    try {
        const response = await fetch('/api/blueprints');
        const data = await response.json();

        const blueprints = data.blueprints || [];
        document.getElementById('status-blueprints').textContent = blueprints.length;

        // Update library grid
        const libraryDiv = document.getElementById('blueprints-library');
        if (blueprints.length === 0) {
            libraryDiv.innerHTML = '<p class="placeholder-text" style="color: rgba(255,255,255,0.8);">No blueprints saved yet. Create one below!</p>';
        } else {
            libraryDiv.innerHTML = blueprints.map(bp => `
                <div class="blueprint-card" data-id="${bp.id}">
                    <h3>${bp.name}</h3>
                    <p><strong>Created:</strong> ${new Date(bp.created_date).toLocaleDateString()}</p>
                    <p><strong>Examples:</strong> ${bp.examples.length} documents</p>
                    <p><strong>Used:</strong> ${bp.usage_count || 0} times</p>
                    <button class="delete-btn" onclick="deleteBlueprint('${bp.id}', event)">Delete</button>
                </div>
            `).join('');
        }

        // Update blueprint selector
        const selector = document.getElementById('blueprint-select');
        selector.innerHTML = '<option value="">-- Select a Blueprint --</option>' +
            blueprints.map(bp => `<option value="${bp.id}">${bp.name}</option>`).join('');

    } catch (error) {
        console.error('Error loading blueprints:', error);
    }
}

// Delete blueprint
async function deleteBlueprint(blueprintId, event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this blueprint?')) {
        return;
    }

    try {
        const response = await fetch(`/api/blueprint/${blueprintId}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.status === 'success') {
            await loadBlueprints();
        } else {
            alert('Error deleting blueprint: ' + data.message);
        }
    } catch (error) {
        alert('Error deleting blueprint: ' + error.message);
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
            statusDiv.textContent = data.message + ' - Ready to save as blueprint!';
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

// Save blueprint
document.getElementById('save-blueprint').addEventListener('click', async () => {
    const name = document.getElementById('blueprint-name').value.trim();
    const instructions = document.getElementById('custom-instructions').value.trim();
    const statusDiv = document.getElementById('blueprint-status');

    if (!name) {
        statusDiv.textContent = 'Please enter a blueprint name';
        statusDiv.className = 'status-message error';
        return;
    }

    try {
        const response = await fetch('/api/create-blueprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                custom_instructions: instructions
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.textContent = 'Blueprint saved successfully!';
            statusDiv.className = 'status-message success';

            // Clear inputs
            document.getElementById('blueprint-name').value = '';
            document.getElementById('custom-instructions').value = '';

            // Reload blueprints
            await loadBlueprints();

            // Switch to generate tab
            setTimeout(() => {
                document.querySelector('[data-tab="generate"]').click();
            }, 1500);
        } else {
            statusDiv.textContent = data.message;
            statusDiv.className = 'status-message error';
        }
    } catch (error) {
        statusDiv.textContent = 'Error saving blueprint: ' + error.message;
        statusDiv.className = 'status-message error';
    }
});

// Blueprint selection
document.getElementById('blueprint-select').addEventListener('change', (e) => {
    selectedBlueprintId = e.target.value;
    const infoDiv = document.getElementById('selected-blueprint-info');

    if (!selectedBlueprintId) {
        infoDiv.style.display = 'none';
        return;
    }

    // Load blueprint details
    fetch('/api/blueprints')
        .then(res => res.json())
        .then(data => {
            const blueprint = data.blueprints.find(bp => bp.id === selectedBlueprintId);
            if (blueprint) {
                document.getElementById('info-name').textContent = blueprint.name;
                document.getElementById('info-date').textContent = new Date(blueprint.created_date).toLocaleDateString();
                document.getElementById('info-examples').textContent = blueprint.examples.length + ' documents';
                document.getElementById('info-usage').textContent = blueprint.usage_count || 0;
                document.getElementById('info-instructions').textContent = blueprint.custom_instructions || 'None';
                infoDiv.style.display = 'block';
            }
        });
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

// Generate complaint with blueprint
document.getElementById('generate-complaint').addEventListener('click', async () => {
    const statusDiv = document.getElementById('generate-status');
    const outputDiv = document.getElementById('output');
    const copyBtn = document.getElementById('copy-complaint');
    const generateBtn = document.getElementById('generate-complaint');

    if (!selectedBlueprintId) {
        statusDiv.textContent = 'Please select a blueprint first';
        statusDiv.className = 'status-message error';
        return;
    }

    generateBtn.disabled = true;
    statusDiv.innerHTML = '<div class="loading-spinner"></div> Generating with GPT-4... This may take 30-60 seconds...';
    statusDiv.className = 'status-message loading';
    outputDiv.innerHTML = '<p class="placeholder-text">Generating...</p>';

    try {
        const response = await fetch('/api/generate-with-blueprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blueprint_id: selectedBlueprintId })
        });

        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.textContent = `Generated successfully using: ${data.blueprint_used}`;
            statusDiv.className = 'status-message success';
            outputDiv.textContent = data.complaint;
            copyBtn.style.display = 'block';

            // Reload blueprints to update usage count
            await loadBlueprints();
        } else {
            statusDiv.textContent = 'Error: ' + data.message;
            statusDiv.className = 'status-message error';
            outputDiv.innerHTML = '<p class="placeholder-text" style="color: #dc2626;">' + data.message + '</p>';
        }
    } catch (error) {
        statusDiv.textContent = 'Error generating: ' + error.message;
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

// Initial load
updateStatus();
