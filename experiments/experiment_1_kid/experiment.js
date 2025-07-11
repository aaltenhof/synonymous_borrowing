// Initialize jsPsych first
var jsPsych = initJsPsych({
    override_safe_mode: true,
    on_finish: function() {
        console.log('Experiment finished');
    }
});

// Declare variables at the top
var study_id = "borrowing_kids_pilot";
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
const session_time = today.toLocaleTimeString();

const session_date = mm + '/' + dd + '/' + yyyy;

jsPsych.data.addProperties({
    session_date: session_date,
    session_time: session_time
});

let condition;

const novel_words = ["tinches", "nefts", "bines", "palts"];

// Set condition
if (Math.floor(Math.random() * 2) == 0) {
    condition = "novel_word_condition";
} else {
    condition = "familiar_word_condition";
}

var preload = {
    type: jsPsychPreload,
    audio: ['audio/pick2_apples1.wav','audio/pick2_carrots1.wav',
        'audio/pick2_mushrooms1.wav','audio/pick2_leaves1.wav','audio/pick2_flowers1.wav','audio/pick2_shells1.wav',
        'audio/pick2_bines1.wav','audio/pick2_palts1.wav','audio/pick2_tinches1.wav','audio/pick2_nefts1.wav'
    ],
    show_detailed_errors: true
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

const practiceCategories = {
    'carrots': [
        'carrot_1.png', 'carrot_2.png', 'carrot_3.png',
        'carrot_4.png', 'carrot_5.png', 'carrot_6.png',
        'broccoli_1.png', 'broccoli_2.png', 'broccoli_3.png',
        'broccoli_4.png', 'broccoli_5.png', 'broccoli_6.png'
    ],
    'apples': [
        'apple_1.png', 'apple_2.png', 'apple_3.png',
        'apple_4.png', 'apple_5.png', 'apple_6.png',
        'strawberry_1.png', 'strawberry_2.png', 'strawberry_3.png',
        'strawberry_4.png', 'strawberry_5.png', 'strawberry_6.png'
    ]
}

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

// Create pre-survey trial
var pre_survey_trial =  {
    type: jsPsychSurveyText,
    questions: [
        {prompt: 'Participant ID', name: 'participant_id'},
        {prompt: 'Age', name: 'participant_age'}
    ],
    on_finish: function(data) {
        const responses = JSON.parse(data.responses);
        console.log("Survey data:", data);
        if (data.responses) {
            const responses = JSON.parse(data.responses);
            jsPsych.data.addProperties({
                participant_id: responses.participant_id,
                participant_age: responses.participant_age
         });
        } else {
            console.warn("No responses found in survey data.");
        }
        jsPsych.data.addProperties({
            participant_id: responses.participant_id,
            participant_age: responses.participant_age
        });
    }
}

function onSaveComplete() {
    console.log('Data saved');
}

// Generate random ID
function generateRandomId() {
    const baseId = Math.floor(Math.random() * 999) + 1;
    return baseId;
}

const random_id = generateRandomId()

var start_button = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '',
    choices: ['smiley'],
    button_html: ['<img src=stimuli/misc/%choice%.png></img>']
}

var post = {
    type: jsPsychCategorizeImage,
    stimulus: 'stimuli/misc/smiley.png',
    key_answer: '',
    text_answer: '',
    choices: ['b'],
}

// Configure save_data trial
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "sPY6vEQmdfQL",
    filename: () => `borrowing_kid_${random_id}.csv`,
    data_string: () => {
        const allTrials = jsPsych.data.get().values();

        const surveyTrial = allTrials.filter(trial => trial.trial_type === 'survey-text')
            .flatMap(trial => [trial[0], trial[1]]);
        console.log(surveyTrial)
        
        const imageTrials = allTrials
            .filter(trial => trial.trial_type === 'image-grid')
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

        const headers = 'participant_id,study_id,participant_age,session_date,session_time,trial_number,condition,category,image_name,image_location,word,click_order,rt,id,typicality';
        const rows = imageTrials.map(trial => {
            const imageInfo = parseImageInfo(trial.image_name);
            return `${trial.participant_id},${trial.study_id || ''},${trial.participant_age || ''},${session_date || ''},${session_time || ''},${trial.trial_number},${trial.condition},${trial.category},${trial.image_name},${trial.button},${trial.word},${trial.click_order},${trial.rt},${imageInfo.id},${imageInfo.typicality}`;
        });

        return [headers, ...rows].join('\n');
    },
};

// Function to create image grid trial
function createImageGridTrial(category, trialNumber) {
    const trialWord = condition === "novel_word_condition" ? 
                     novel_words[trialNumber % novel_words.length] : 
                     category;
    
    return {
        type: jsPsychImageGridSelectAudio,
        stimulus: `audio/pick2_${trialWord}1.wav`,
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
            study_id: study_id,
            condition: condition,
            category: category,
            word: trialWord
        }
    };
}

// Function to create practice image grid trial
function createPracticeImageGridTrial(category, trialNumber) {
    const trialWord = category;
    
    return {
        type: jsPsychImageGridSelectAudio,
        stimulus: `audio/pick2_${category}1.wav`,
        stimulus_folder: `stimuli/${category}`,
        this_word: trialWord,
        required_clicks: 2,
        images_per_row: 4,
        grid_spacing: 20,
        max_image_width: 200,
        image_names: practiceCategories[category],
        data: {
            trial_type: 'image_grid',
            trial_number: trialNumber,
            study_id: study_id,
            session_date: session_date,
            session_time: session_time,
            condition: condition,
            category: category,
            word: trialWord
        }
    };
}

// Wait for document to be ready
document.addEventListener('DOMContentLoaded', () => {
   
    // Add properties to jsPsych data
    jsPsych.data.addProperties({
        random_id: random_id,
        condition: condition
    });
    
    // Create timeline
    const timeline = [];
    timeline.push(preload)
    timeline.push(pre_survey_trial)
    timeline.push(start_button)

    
    // Get categories and shuffle them
    const categories = Object.keys(stimulusCategories);
    shuffle(categories);
    const practice_categories = Object.keys(practiceCategories);
    shuffle(practice_categories);


    // Create trials
    let trialCounter = 0;
    for (const category of practice_categories) {
        const trial = createPracticeImageGridTrial(category, trialCounter);
        timeline.push(trial);
        trialCounter++;
    }
    for (const category of categories) {
        const trial = createImageGridTrial(category, trialCounter);
        timeline.push(trial);
        trialCounter++;
    }
    
    timeline.push(save_data);
    timeline.push(post);
    

    console.log(timeline)
    // Run the experiment
    jsPsych.run(timeline);
});