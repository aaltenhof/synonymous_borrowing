// Declare variables at the top
let participant_id;
let prolific_id;
let condition;

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

// Initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: function(data) {
        console.log('Experiment finished');
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

// Configure DataPipe save trial
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "sPY6vEQmdfQL",
    filename: () => `${participant_id}_${prolific_id}.csv`,
    data_string: () => {
        let data = jsPsych.data.get();
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
        prolific_id = data.response.Q0.trim();
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

// Function to create image grid trial
function createImageGridTrial(folder, trialNumber) {
    return {
        type: jsPsychImageGridSelect,
        stimulus: folder,
        grid_size: 2,  // Assuming 2x2 grid
        data: {
            trial_type: 'image_grid',
            trial_number: trialNumber,
            folder: folder,
            condition: condition  // Add condition to each trial's data
        }
    };
}

// Function to create and run timeline
async function createTimeline() {
    const timeline = [
        consent,
        pid,
        instructions
    ];
    
    // Define stimulus folders - update these paths to match your GitHub structure
    const folders = [
        'stimuli/1',
        'stimuli/2',
        'stimuli/3',
        'stimuli/4',
        'stimuli/5',
        'stimuli/6',
        'stimuli/7',
        'stimuli/8'
    ];
    
    // Shuffle the folders to randomize presentation order
    shuffle(folders);

    let trialCounter = 0;
    for (const folder of folders) {
        const trial = createImageGridTrial(folder, trialCounter);
        timeline.push(trial);
        trialCounter++;
    }
    
    timeline.push(save_data);
    return timeline;
}

// Initialize and run the experiment
async function initializeAndRun() {
    participant_id = await generateParticipantId();
    
    jsPsych.data.addProperties({
        participant_id: participant_id,
        condition: condition
    });
    
    const timeline = await createTimeline();
    await jsPsych.run(timeline);
}

// Start the experiment
initializeAndRun();