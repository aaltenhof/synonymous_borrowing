// Initialize jsPsych first
const jsPsych = initJsPsych({
    on_finish: function() {
        console.log('Experiment finished');
    }
});

// Declare variables at the top
let participant_id;
let prolific_id;
<<<<<<< HEAD


=======
let condition;
>>>>>>> f96660e1f2809d1786aa0e0dfed3175d2c0c6eff

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

<<<<<<< HEAD
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
        const response = await fetch(`https://localhost:${PORT}/get-folders`);
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
        const response = await fetch(`https://localhost:${PORT}/get-images/${folder}`);
        const imagePaths = await response.json();
        
        // Get the current Prolific ID from jsPsych's data
        const currentProlificId = jsPsych.data.get().last().select('prolific_id').values[0] || prolific_id;
        
        if (condition == "novel_word_condition") {
            word = novel_words.pop()
        } else {
            word = folder.replace('stimuli/', '')
        }
        const trial = {
            type: jsPsychImageGridSelect,
            stimulus_folder: folder.replace('stimuli/', ''),
            preserve_original_size: false,
            images_per_row: 4,
            grid_spacing: 25,
            max_image_width: 200,
            center_grid: true,
            required_clicks: 3,
            prompt: `<p>Click on three ${word}.</p>`,
            this_word: word,
            data: {
                participant_id: participant_id,
                prolific_id: currentProlificId,
                trial_number: trialCounter,
                trial_type: 'image-selection',
                category: folder,
                word: word,
                condition: condition
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
        fetch(`https://localhost:${PORT}/save-data`, {
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

=======
>>>>>>> f96660e1f2809d1786aa0e0dfed3175d2c0c6eff
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

function onSaveComplete() {
    console.log('Data saved, redirecting...');
    window.location = "https://app.prolific.co/submissions/complete?cc=XXXXXX";  // Replace XXXXXX with your code
}

// Configure save_data trial
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "sPY6vEQmdfQL",
    filename: () => `borrowing_${participant_id}.csv`,
    data_string: () => {
        const allTrials = jsPsych.data.get().values();
        const imageTrials = allTrials
            .filter(trial => trial.trial_type === 'image-grid-select')
            .flatMap(trial => [trial[0], trial[1]]);

        // Add function to extract ID and typicality from filename
        const parseImageInfo = (filename) => {
            const parts = filename.split('_');
            const numbers = parts[parts.length - 1].split('.')[0].split('_');
            return {
                id: parts[parts.length - 2],
                typicality: parts[parts.length - 1].split('.')[0]
            };
        };

        const headers = 'participant_id,prolific_id,trial_number,condition,category,image_name,word,click_order,rt,id,typicality';
        const rows = imageTrials.map(trial => {
            const imageInfo = parseImageInfo(trial.image_name);
            return `${trial.participant_id},${trial.prolific_id || ''},${trial.trial_number},${trial.condition},${trial.category},${trial.image_name},${trial.word},${trial.click_order},${trial.rt},${imageInfo.id},${imageInfo.typicality}`;
        });

        return [headers, ...rows].join('\n');
    },
    on_finish: () => {
        window.location.href = "https://app.prolific.co/submissions/complete?cc=XXXXXX";
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