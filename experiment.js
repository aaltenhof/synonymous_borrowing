// Declare participant_id at the top
let participant_id;
let prolific_id;


// Generate participant ID
async function generateParticipantId() {
    const baseId = Math.floor(Math.random() * 999) + 1;
    return `participant${baseId}`;
}

// Initialize and run the experiment
async function initializeAndRun() {
    // Set participant_id first before creating any trials
    participant_id = await generateParticipantId();
    
    // Then create and run timeline
    const timeline = await createTimeline();
    await jsPsych.run(timeline);
}

// Function to get all stimuli folders
async function getStimulusFolders() {
    try {
        const response = await fetch('http://localhost:3000/get-folders');
        const folders = await response.json();
        return folders;
    } catch (error) {
        console.error('Error getting folders:', error);
        return [];
    }
}

// Function to create a grid trial for any folder
async function createImageGridTrial(folder, trialCounter) {
    try {
        const response = await fetch(`http://localhost:3000/get-images/${folder}`);
        const imagePaths = await response.json();
        
        // Get the current Prolific ID from jsPsych's data
        const currentProlificId = jsPsych.data.get().last().select('prolific_id').values[0] || prolific_id;
        
        const trial = {
            type: jsPsychImageGridSelect,
            stimulus_folder: folder.replace('stimuli/', ''),
            preserve_original_size: true,
            images_per_row: 5,
            images_per_column: 2,
            grid_spacing: 20,
            center_grid: true,
            required_clicks: 2,
            prompt: `<p>Select two ${2} ${folder.replace('stimuli/', '')}s by clicking on them</p>`,
            data: {
                participant_id: participant_id,
                prolific_id: currentProlificId,
                trial_number: trialCounter,
                trial_type: 'image-selection',
                category: folder
            }
        };
        
        return trial;
    } catch (error) {
        console.error('Error loading images:', error);
        return null;
    }
}

// Initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: function() {
        // Get the final Prolific ID
        const finalProlificId = jsPsych.data.get().last().select('prolific_id').values[0] || prolific_id;
        
        // Get only the image selection trials
        const experimentData = jsPsych.data.get()
            .filter({trial_type: 'image-grid-select'})
            .values()
            .flatMap(trial => {
                if (trial.responses && Array.isArray(trial.responses)) {
                    return trial.responses.map(response => ({
                        ...response,
                        prolific_id: finalProlificId
                    }));
                }
                return {
                    ...trial,
                    prolific_id: finalProlificId
                };
            });

        console.log('Final data being sent:', experimentData);
        
        // Save the data
        fetch('http://localhost:3000/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                participantId: participant_id,
                data: experimentData
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log('Data saved successfully:', result);
            window.location.href = "https://www.prolific.com/";
        })
        .catch(error => {
            console.error('Error saving data:', error);
            window.location.href = "https://www.prolific.com/";
        });
    }
});

// Create consent trial
const consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="width: 800px;">
            <h3>Consent to Participate in Research</h3>
            <p>Consent will go here</p>
            <p>Please click "I Agree" if you wish to participate.</p>
        </div>
    `,
    choices: ['I Agree', 'I Do Not Agree'],
    data: {
        trial_type: 'consent'
    },
    on_finish: function(data) {
        if(data.response == 1) {
            jsPsych.endExperiment('Thank you for your time. The experiment has been ended.');
        }
    }
};


// Create Prolific ID trial
const pid = {
    type: jsPsychSurveyText,
    questions: [
        {prompt: `<p>Please enter your Prolific ID</p>`}
    ],
    data: {
        trial_type: 'pid'
    },
    on_finish: function(data) {
        // Store Prolific ID from the response - survey-text stores it in response object
        prolific_id = data.response.Q0.trim(); // trim to remove any whitespace
        console.log('Captured Prolific ID:', prolific_id);
        
        // Store it in jsPsych's data
        jsPsych.data.addProperties({
            prolific_id: prolific_id
        });
    }
};

// Create instructions trial
const instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="width: 800px;">
            <h2>Instructions</h2>
            <p>Instructions here.</p>
            <p>Click "Begin" when you're ready to start.</p>
        </div>
    `,
    choices: ['Begin'],
    data: {
        trial_type: 'instructions'
    }
};

// Function to create and run timeline
async function createTimeline() {
    // Initialize timeline array
    const timeline = [
        consent,
        pid,
        instructions
    ];
    
    // Get and randomize folders
    const folders = await getStimulusFolders();
    const randomizedFolders = jsPsych.randomization.shuffle(folders);

    // Add a trial number counter
    let trialCounter = 0;
    
    // Add image grid trials to timeline
    for (const folder of randomizedFolders) {
        const trial = await createImageGridTrial(folder, trialCounter);
        if (trial) timeline.push(trial)
        trialCounter++;
    }
    
    return timeline;
}

// Start the experiment
initializeAndRun();