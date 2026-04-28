let credit = 100;

document.getElementById('featureInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addFeature();
    }
});

document.getElementById('descriptionInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addFeature();
    }
});

function addFeature() {
    const featureInput = document.getElementById('featureInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const featureName = featureInput.value.trim();
    const featureDescription = descriptionInput.value.trim();
    
    if (featureName && featureDescription) {
        addFeatureFromCSV(featureName, featureDescription, '', 0, true);
        featureInput.value = '';
        descriptionInput.value = '';
    }
}

function addFeatureFromCSV(featureName, featureDescription, notes, points, save = true) {
    const featureList = document.getElementById('featureList');

    const li = document.createElement('li');
    const topDiv = document.createElement('div');
    topDiv.classList.add('top');
    const featureText = document.createElement('span');
    featureText.classList.add('feature-text');
    featureText.textContent = `${featureName} - ${featureDescription}`;

    const pointInput = document.createElement('input');
    pointInput.type = 'number';
    pointInput.value = points;
    pointInput.min = 0;
    pointInput.max = credit;
    pointInput.oninput = updateCredit;

    const noteInput = document.createElement('textarea');
    noteInput.value = notes;
    noteInput.placeholder = 'Enter notes';
    noteInput.classList.add('note');

    const actions = document.createElement('div');
    actions.classList.add('actions');

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️';
    deleteButton.onclick = () => deleteFeature(li);

    const editButton = document.createElement('button');
    editButton.textContent = '✏️';
    editButton.onclick = () => editFeature(featureText, featureName, featureDescription);

    const moveButtons = document.createElement('div');
    moveButtons.classList.add('move-buttons');

    const moveUpButton = document.createElement('button');
    moveUpButton.textContent = '▲';
    moveUpButton.onclick = () => moveUp(li);

    const moveDownButton = document.createElement('button');
    moveDownButton.textContent = '▼';
    moveDownButton.onclick = () => moveDown(li);

    moveButtons.appendChild(moveUpButton);
    moveButtons.appendChild(moveDownButton);

    actions.appendChild(deleteButton);
    actions.appendChild(editButton);

    topDiv.appendChild(featureText);
    topDiv.appendChild(pointInput);
    topDiv.appendChild(actions);
    topDiv.appendChild(moveButtons);

    li.appendChild(topDiv);
    li.appendChild(noteInput);

    featureList.appendChild(li);

    if (save) {
        saveFeatures();
    }
}

function updateCredit(event) {
    const input = event.target;
    const previousValue = parseInt(input.getAttribute('data-previous')) || 0;
    const currentValue = parseInt(input.value) || 0;

    const difference = currentValue - previousValue;
    if (credit - difference >= 0) {
        credit -= difference;
        document.getElementById('credit').textContent = credit;
        input.setAttribute('data-previous', currentValue);
        saveFeatures();
    } else {
        input.value = previousValue;
        alert('Not enough credit');
    }
}

function moveUp(li) {
    const prev = li.previousElementSibling;
    if (prev) {
        li.parentNode.insertBefore(li, prev);
        saveFeatures();
    }
}

function moveDown(li) {
    const next = li.nextElementSibling;
    if (next) {
        li.parentNode.insertBefore(next, li);
        saveFeatures();
    }
}

function uploadCSV() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const csvData = event.target.result;
            const rows = csvData.split('\n');
            for (let row of rows) {
                const [featureName, featureDescription, notes, points] = row.split(',');
                if (featureName && featureDescription) {
                    addFeatureFromCSV(featureName.trim(), featureDescription.trim(), notes ? notes.trim() : '', points ? parseInt(points.trim()) : 0);
                }
            }
        };
        reader.readAsText(file);
    }
}

function deleteFeature(li) {
    const pointInput = li.querySelector('input[type="number"]');
    const points = parseInt(pointInput.value) || 0;
    credit += points;
    document.getElementById('credit').textContent = credit;
    li.remove();
    saveFeatures();
}

function editFeature(featureText, featureName, featureDescription) {
    const newFeatureName = prompt('Edit feature name', featureName);
    const newFeatureDescription = prompt('Edit feature description', featureDescription);
    if (newFeatureName && newFeatureDescription) {
        featureText.textContent = `${newFeatureName} - ${newFeatureDescription}`;
        saveFeatures();
    }
}

function saveFeatures() {
    const featureList = document.getElementById('featureList');
    const features = [];
    for (let li of featureList.children) {
        const topDiv = li.querySelector('.top');
        const featureText = topDiv.querySelector('span').textContent;
        const pointInput = topDiv.querySelector('input[type="number"]');
        const noteInput = li.querySelector('textarea.note');
        const [featureName, featureDescription] = featureText.split(' - ');
        const points = pointInput.value;
        const notes = noteInput.value;
        features.push({ name: featureName, description: featureDescription, notes: notes, points: parseInt(points) });
    }
    localStorage.setItem('features', JSON.stringify(features));
    localStorage.setItem('credit', credit);
}

function exportCSV() {
    const featureList = document.getElementById('featureList');
    let csvContent = 'Feature Name,Feature Description,Notes,Points\n';
    for (let li of featureList.children) {
        const topDiv = li.querySelector('.top');
        const featureText = topDiv.querySelector('span').textContent;
        const pointInput = topDiv.querySelector('input[type="number"]');
        const noteInput = li.querySelector('textarea.note');
        const [featureName, featureDescription] = featureText.split(' - ');
        const points = pointInput.value;
        const notes = noteInput.value;
        csvContent += `${featureName},${featureDescription},${notes},${points}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'features.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const featureList = document.getElementById('featureList');
    let y = 10;
    doc.text('Feature Name', 10, y);
    doc.text('Description', 70, y);
    doc.text('Notes', 130, y);
    doc.text('Points', 190, y);
    y += 10;

    for (let li of featureList.children) {
        const topDiv = li.querySelector('.top');
        const featureText = topDiv.querySelector('span').textContent;
        const pointInput = topDiv.querySelector('input[type="number"]');
        const noteInput = li.querySelector('textarea.note');
        const [featureName, featureDescription] = featureText.split(' - ');

        doc.text(featureName, 10, y);
        doc.text(featureDescription, 70, y);
        doc.text(noteInput.value, 130, y);
        doc.text(pointInput.value, 190, y);
        y += 10;
    }

    doc.save('features.pdf');
}

function downloadTemplate() {
    const templateContent = 'Feature Name,Feature Description,Notes,Points\n';
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Warn user before leaving the page
window.addEventListener('beforeunload', function(event) {
    event.preventDefault();
    event.returnValue = 'You have unsaved changes, do you really want to leave?';
});

// Load features from localStorage
window.addEventListener('load', () => {
    const savedFeatures = JSON.parse(localStorage.getItem('features')) || [];
    credit = parseInt(localStorage.getItem('credit')) || 100;
    document.getElementById('credit').textContent = credit;
    for (const feature of savedFeatures) {
        addFeatureFromCSV(feature.name, feature.description, feature.notes, feature.points, false);
    }
});
