// Initialize jsPsych first
var jsPsych = initJsPsych({
    override_safe_mode: true,
    on_finish: function() {
        console.log('Experiment finished');
    }
});

var pids = {}

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

const novel_words = ["tinches", "nefts", "bines", "palts", "datches", "serns", "gades", "leams"];

// Set condition
if (Math.floor(Math.random() * 2) == 0) {
    condition = "novel_word_condition";
} else {
    condition = "familiar_word_condition";
}

var preload = {
    type: jsPsychPreload,
    audio: ['audio/pick_two_apples.wav','audio/pick_two_carrots.wav',
        'audio/pick_two_mushrooms.wav','audio/pick_two_leaves.wav','audio/pick_two_flowers.wav','audio/pick_two_shells.wav',
        'audio/pick_two_cups.wav', 'audio/pick_two_spoons.wav', 'audio/pick_two_hats.wav', 'audio/pick_two_shoes.wav',
        'audio/pick_two_bines.wav','audio/pick_two_palts.wav','audio/pick_two_tinches.wav','audio/pick_two_nefts.wav',
        'audio/pick_two_datches.wav', 'audio/pick_two_serns.wav', 'audio/pick_two_leams.wav', 'audio/pick_two_gades.wav'
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
    ],
    'cups': [
        'cup_glass_1_1.png', 'cup_glass_2_1.png', 'cup_glass_3_1.png',
        'cup_teacup_1_1.png', 'cup_teacup_2_1.png', 'cup_teacup_3_1.png',
        'cup_twohandled_1_2.png', 'cup_twohandled_2_2.png', 'cup_twohandled_3_2.png',
        'cup_sherry_1_2.png', 'cup_sherry_2_2.png', 'cup_sherry_3_2.png'
    ],
    'shoes': [
        'shoe_sneaker_1_1.png', 'shoe_sneaker_2_1.png', 'shoe_sneaker_3_1.png',
        'shoe_loafer_1_1.png', 'shoe_loafer_2_1.png', 'shoe_loafer_3_1.png',
        'shoe_elf_1_2.png', 'shoe_elf_2_2.png', 'shoe_elf_3_2.png',
        'shoe_ghillie_1_2.png', 'shoe_ghillie_2_2.png', 'shoe_ghillie_3_2.png'
    ],
    'spoons': [
        'spoon_teaspoon_1_1.png', 'spoon_teaspoon_2_1.png', 'spoon_teaspoon_3_1.png',
        'spoon_soup_1_1.png', 'spoon_soup_2_1.png', 'spoon_soup_3_1.png',
        'spoon_slotted_1_2.png', 'spoon_slotted_2_2.png', 'spoon_slotted_3_2.png',
        'spoon_square_1_2.png', 'spoon_square_2_2.png', 'spoon_square_3_2.png'
    ],
    'hats': [
        'hat_ballcap_1_1.png', 'hat_ballcap_2_1.png', 'hat_ballcap_3_1.png',
        'hat_sun_1_1.png', 'hat_sun_2_1.png', 'hat_sun_3_1.png',
        'hat_jester_1_2.png', 'hat_jester_2_2.png', 'hat_jester_3_2.png',
        'hat_party_1_2.png', 'hat_party_2_2.png', 'hat_party_3_2.png'
    ]
};

const practiceCategories = {
    'carrots': [
        'carrot_carrot_1_0.png', 'carrot_carrot_2_0.png', 'carrot_carrot_3_0.png',
        'carrot_carrot_4_0.png', 'carrot_carrot_5_0.png', 'carrot_carrot_6_0.png',
        'broccoli_broccoli_1_0.png', 'broccoli_broccoli_2_0.png', 'broccoli_broccoli_3_0.png',
        'broccoli_broccoli_4_0.png', 'broccoli_broccoli_5_0.png', 'broccoli_broccoli_6_0.png'
    ],
    'apples': [
        'apple_apple_1_0.png', 'apple_apple_2_0.png', 'apple_apple_3_0.png',
        'apple_apple_4_0.png', 'apple_apple_5_0.png', 'apple_apple_6_0.png',
        'strawberry_strawberry_1_0.png', 'strawberry_strawberry_2_0.png', 'strawberry_strawberry_3_0.png',
        'strawberry_strawberry_4_0.png', 'strawberry_strawberry_5_0.png', 'strawberry_strawberry_6_0.png'
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

var pre_survey_trial =  {
    type: jsPsychSurveyText,
    questions: [
        {prompt: 'Participant ID', name: 'participant_id'},
        {prompt: 'Age', name: 'participant_age'}
    ],
    on_finish: function() {
        try {
            const responseData = jsPsych.data.getLastTrialData().values()[0].response;
            console.log("PID:", responseData.participant_id);
            console.log("Age:", responseData.participant_age);
            pids.participant_id = responseData.participant_id
            pids.participant_age = responseData.participant_age
        } catch (e) {
            console.error("Error parsing survey responses:", e);
        }
    }
}

function onSaveComplete() {
    console.log('Data saved');
}

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

        const imageTrials = allTrials
            .filter(trial => trial.trial_type === 'image-grid-select-audio')
            .flatMap(trial => [trial[0], trial[1]]);

        console.log(allTrials)
        console.log("PIDs are")
        console.log(pids)
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
            return `${pids.participant_id || ''},${trial.study_id || ''},${pids.participant_age || ''},${session_date || ''},${session_time || ''},${trial.trial_number},${trial.condition},${trial.category},${trial.image_name},${trial.image_location},${trial.word},${trial.click_order},${trial.rt},${imageInfo.id},${imageInfo.typicality}`;
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
        stimulus: `audio/pick_two_${trialWord}.wav`,
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
        stimulus: `audio/pick_two_${category}.wav`,
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
    
    // Run the experiment
    jsPsych.run(timeline);
});