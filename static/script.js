// Save template
document.getElementById('save-template').addEventListener('click', async () => {
    const templateText = document.getElementById('template-text').value;
    const statusDiv = document.getElementById('template-status');

    if (!templateText.trim()) {
        statusDiv.textContent = 'Please enter a template';
        statusDiv.className = 'status-message error';
        return;
    }

    try {
        const response = await fetch('/api/save-template', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'default',
                text: templateText
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.textContent = 'Template saved successfully!';
            statusDiv.className = 'status-message success';
        } else {
            statusDiv.textContent = 'Error saving template';
            statusDiv.className = 'status-message error';
        }
    } catch (error) {
        statusDiv.textContent = 'Error: ' + error.message;
        statusDiv.className = 'status-message error';
    }
});

// Generate draft
document.getElementById('generate-draft').addEventListener('click', async () => {
    const outputDiv = document.getElementById('output');
    const copyBtn = document.getElementById('copy-draft');

    // Collect all case facts
    const facts = {
        plaintiff_name: document.getElementById('plaintiff_name').value,
        plaintiff_address: document.getElementById('plaintiff_address').value,
        defendant_name: document.getElementById('defendant_name').value,
        defendant_address: document.getElementById('defendant_address').value,
        incident_date: document.getElementById('incident_date').value,
        injury_description: document.getElementById('injury_description').value,
        medical_expenses: document.getElementById('medical_expenses').value,
        lost_wages: document.getElementById('lost_wages').value,
        pain_suffering: document.getElementById('pain_suffering').value
    };

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                template: 'default',
                facts: facts
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            outputDiv.textContent = data.draft;
            outputDiv.classList.remove('placeholder-text');
            copyBtn.style.display = 'block';
        } else {
            outputDiv.innerHTML = `<p class="placeholder-text" style="color: #dc2626;">${data.message}</p>`;
        }
    } catch (error) {
        outputDiv.innerHTML = `<p class="placeholder-text" style="color: #dc2626;">Error: ${error.message}</p>`;
    }
});

// Copy to clipboard
document.getElementById('copy-draft').addEventListener('click', () => {
    const output = document.getElementById('output').textContent;
    navigator.clipboard.writeText(output).then(() => {
        const btn = document.getElementById('copy-draft');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
});
