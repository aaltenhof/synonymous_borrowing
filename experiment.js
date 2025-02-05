// Declare participant_id at the top
let participant_id;
let prolific_id;
let condition;  // Moved condition declaration to top

const novel_words = ["tinches", "nefts", "bines", "palts"];
// Set condition
if (Math.floor(Math.random() * 2) == 0) {
    condition = "novel_word_condition";
} else {
    condition = "familiar_word_condition";
}

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

shuffle(novel_words);

// Generate participant ID
async function generateParticipantId() {
    const baseId = Math.floor(Math.random() * 999) + 1;
    return `participant${baseId}`;
}

// Initialize and run the experiment
async function initializeAndRun() {
    // Set participant_id first before creating any trials
    participant_id = await generateParticipantId();
    
    // Add participant_id and condition to jsPsych data
    jsPsych.data.addProperties({
        participant_id: participant_id,
        condition: condition  // Add condition as a property
    });
    
    // Then create and run timeline
    const timeline = await createTimeline();
    await jsPsych.run(timeline);
}

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

// Configure DataPipe save trial
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "sPY6vEQmdfQL",
    filename: () => `${participant_id}_${prolific_id}.csv`,
    data_string: () => {
        // Get all data
        let data = jsPsych.data.get();
        
        // Add final metadata
        data.addProperties({
            timestamp: new Date().toISOString(),
            experiment_complete: true
        });
        
        return data.csv();
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
        // Store Prolific ID from the response
        prolific_id = data.response.Q0.trim();
        
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
    folders = await getStimulusFolders();
    shuffle(folders);

    // Add a trial number counter
    let trialCounter = 0;
    // Add image grid trials to timeline
    for (const folder of folders) {
        const trial = await createImageGridTrial(folder, trialCounter);
        if (trial) {
            timeline.push(trial);
        } else {
            console.log("trial could not be added");
        }
        trialCounter++;
    }
    
    timeline.push(save_data);
    
    return timeline;
}

// Start the experiment
initializeAndRun();