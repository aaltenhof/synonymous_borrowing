// Initialize jsPsych first
const jsPsych = initJsPsych({
    on_finish: function() {
        console.log('Experiment finished');
    }
});

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

// Define all stimulus categories and their images
const stimulusCategories = {
    'flowers': [
        'flower_iris_1_2.png', 'flower_iris_2_2.png', 'flower_iris_3_2.png',
        'flower_round_1_1.png', 'flower_round_2_1.png', 'flower_round_3_1.png',
        'flower_star_1_1.png', 'flower_star_2_1.png', 'flower_star_3_1.png',
        'flower_trumpet_1_2.png', 'flower_trumpet_2_2.png', 'flower_trumpet_3_2.png'
    ],
    'leaves': [
        'leaf_bean_1_2.png', 'leaf_bean_2_2.png', 'leaf_bean_3_2.png',
        'leaf_droplet_1_1.png', 'leaf_droplet_2_1.png', 'leaf_droplet_3_1.png',
        'leaf_heart_1_2.png', 'leaf_heart_2_2.png', 'leaf_heart_3_2.png',
        'leaf_oak_1_1.png', 'leaf_oak_2_1.png', 'leaf_oak_3_1.png'
    ],
    'mushrooms': [
        'mushroom_bell_1_2.png', 'mushroom_bell_2_2.png', 'mushroom_bell_3_2.png',
        'mushroom_disc_1_2.png', 'mushroom_disc_2_2.png', 'mushroom_disc_3_2.png',
        'mushroom_enoki_1_1.png', 'mushroom_enoki_2_1.png', 'mushroom_enoki_3_1.png',
        'mushroom_toadstool_1_1.png', 'mushroom_toadstool_2_1.png', 'mushroom_toadstool_3_1.png'
    ],
    'shells': [
        'shell_fan_1_1.png', 'shell_fan_2_1.png', 'shell_fan_3_1.png',
        'shell_spiral_1_1.png', 'shell_spiral_2_1.png', 'shell_spiral_3_1.png',
        'shell_stingray_1_2.png', 'shell_stingray_2_2.png', 'shell_stingray_3_2.png',
        'shell_urn_1_2.png', 'shell_urn_2_2.png', 'shell_urn_3_2.png'
    ]
};

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

if (condition === "novel_word_condition") {
    shuffle(novel_words);
}

// Generate participant ID
function generateParticipantId() {
    const baseId = Math.floor(Math.random() * 999) + 1;
    return `participant${baseId}`;
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
    filename: () => `borrowing_${participant_id}.csv`,
    data_string: () => {
        const relevantData = jsPsych.data.get().filter({trial_type: 'image_grid'});
        const flat_data = relevantData.values().flat();  // Flatten the array of trial data
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
        
        // Convert to CSV manually
        const csv_rows = [headers.join(',')];
        flat_data.forEach(row => {
            const csv_row = headers.map(header => row[header]).join(',');
            csv_rows.push(csv_row);
        });
        
        return csv_rows.join('\n');
    },
    success_callback: function() {
        window.location = "https://app.prolific.co/submissions/complete?cc=XXXXXX";  // Replace XXXXXX with your completion code
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
function createImageGridTrial(category, trialNumber) {
    const trialWord = condition === "novel_word_condition" ? 
                     novel_words[trialNumber % novel_words.length] : 
                     category;
    
    return {
        type: jsPsychImageGridSelect,
        stimulus_folder: `stimuli/${category}`,
        this_word: trialWord,
        required_clicks: 2,
        images_per_row: 4,
        grid_spacing: 20,
        max_image_width: 200,
        image_names: stimulusCategories[category],
        data: {
            trial_type: 'image_grid',
            trial_number: trialNumber,
            participant_id: participant_id,
            prolific_id: prolific_id,
            condition: condition,
            category: category,
            word: trialWord
        }
    };
}

// Wait for document to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Generate participant ID
    participant_id = generateParticipantId();
    
    // Add properties to jsPsych data
    jsPsych.data.addProperties({
        participant_id: participant_id,
        condition: condition
    });
    
    // Create timeline
    const timeline = [
        consent,
        pid,
        instructions
    ];
    
    // Get categories and shuffle them
    const categories = Object.keys(stimulusCategories);
    shuffle(categories);

    // Create trials
    let trialCounter = 0;
    for (const category of categories) {
        const trial = createImageGridTrial(category, trialCounter);
        timeline.push(trial);
        trialCounter++;
    }
    
    timeline.push(save_data);
    
    // Run the experiment
    jsPsych.run(timeline);
});