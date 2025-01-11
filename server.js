const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const PORT = process.env.PORT || 5000


const app = express();

// Enable CORS for all routes
app.use(cors());

// Add middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Serve static files from the current directory
app.use(express.static('./'));

// Create data directory if it doesn't exist
const dataDir = './data';
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

// Endpoint to check if participant ID exists
app.get('/check-participant', (req, res) => {
    const participantId = req.query.id;
    const filename = path.join(dataDir, `${participantId}_borrowings.csv`);
    
    res.json({ exists: fs.existsSync(filename) });
});

// Endpoint to save data
app.post('/save-data', (req, res) => {
    try {
        const { participantId, data } = req.body;
        const filename = path.join(dataDir, `borrowing_${participantId}.csv`);

        if (!participantId || !data) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Convert data to CSV
        const csv = convertToCSV(data);

        fs.writeFile(filename, csv, (err) => {
            if (err) {
                console.error('Error saving data:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, filename });
        });
    } catch (error) {
        console.error('Error in save-data endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
    // Log the incoming data structure for debugging
    console.log('Incoming data:', JSON.stringify(data, null, 2));
    
    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : [data];
    
    // Initialize empty array for all rows
    let allRows = [];
    
    // Process each trial
    dataArray.forEach(trial => {
        // If trial has responses array, process each response
        if (trial.responses && Array.isArray(trial.responses)) {
            trial.responses.forEach(response => {
                allRows.push({
                    participant_id: response.participant_id || trial.participant_id,
                    prolific_id: response.prolific_id || trial.prolific_id,
                    trial_number: response.trial_number || trial.trial_number,
                    condition: response.condition || trial.condition,
                    category: response.category || trial.category,
                    image_name: response.image_name || '',
                    word: response.word || trial.word,
                    click_order: response.click_order || '',
                    rt: response.rt || ''
                });
            });
        } else {
            // If no responses array, process trial directly
            allRows.push({
                participant_id: trial.participant_id,
                prolific_id: trial.prolific_id,
                trial_number: trial.trial_number,
                condition: trial.condition,
                category: trial.category,
                image_name: trial.image_name,
                word: trial.word,
                click_order: trial.click_order,
                rt: trial.rt
            });
        }
    });

    // Define headers
    const headers = [
        'participant_id',
        'prolific_id',
        'trial_number',
        'condition',
        'category',
        'image_name',
        'word',
        'click_order',
        'rt'
    ];

    // Create CSV rows starting with headers
    const csvRows = [headers.join(',')];

    // Add data rows
    allRows.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] === undefined ? '' : row[header];
            // Wrap values in quotes and escape existing quotes
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
}
// Endpoint to get images from a specific folder
app.get('/get-images/:folder', (req, res) => {
    const folderPath = path.join('stimuli', req.params.folder);
    
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // Filter for image files
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif)$/i.test(file)
        );
        
        // Create full paths for the images
        const imagePaths = imageFiles.map(file => 
            `stimuli/${req.params.folder}/${file}`
        );
        
        res.json(imagePaths);
    });
});

// Endpoint to get all stimuli folders
app.get('/get-folders', (req, res) => {
    const stimuliPath = 'stimuli';
    
    fs.readdir(stimuliPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading stimuli directory:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // Filter for directories only
        const folders = files
            .filter(file => file.isDirectory())
            .map(file => file.name);
            
        res.json(folders);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});