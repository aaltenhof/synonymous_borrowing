// Initialize jsPsych first
var jsPsych = initJsPsych({
    override_safe_mode: true,
    on_finish: function() {
        console.log('Experiment finished');
    }
});

function generateRandomId() {
    const baseId = Math.floor(Math.random() * 999) + 1;
    return baseId;
}

// reCAPTCHA object
var recaptcha = {
    type: jsPsychExternalHtml,
    url: "recaptcha.html",
    cont_btn: "proceed_button",
    force_refresh: true,
    execute_script: true
};

const random_id = generateRandomId()


// Declare vars
var study_id = "borrowing_adult_artifacts";
var participant_id = jsPsych.data.getURLVariable('PROLIFIC_PID')  || random_id;
var session_id = jsPsych.data.getURLVariable('SESSION_ID');

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
const session_time = today.toLocaleTimeString();

const session_date = mm + '/' + dd + '/' + yyyy;

jsPsych.data.addProperties({
    participant_id: participant_id,
    study_id: study_id,
    session_id: session_id,
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

// Create consent trial
const consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="width: 800px;">
            <h3>Consent to Participate in Research</h3>
            <p>Protocol Director: Robert Hawkins </p>
            <p>Protocol Title: Communication and social cognition in natural audiovisual contexts IRB# 77226 </p>

            <p>DESCRIPTION: You are invited to participate in a research study about language and communication. The purpose of the research is to understand how you use and learn about words. This research will be conducted through the Prolific platform, including participants from the US, UK, and Canada. If you decide to participate in this research, you will play a short language game. </p>
            <p>TIME INVOLVEMENT: The task is estimated to last less than 5 minutes. You are free to withdraw from the study at any time. </p>
            <p>RISKS AND BENEFITS: You may become frustrated or bored if you do not like the task. Study data will be stored securely, in compliance with Stanford University standards, minimizing the risk of confidentiality breach. This study advances our scientific understanding of how people communicate. We cannot and do not guarantee or promise that you will receive any benefits from this study.</p>
            <p>PAYMENTS: You will receive payment in the amount advertised on Prolific. If you do not complete this study, you will receive prorated payment based on the time that you have spent if you contact the experimenters.</p>
            <p>PARTICIPANT'S RIGHTS: If you have read this form and have decided to participate in this project, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. The alternative is not to participate. You have the right to refuse to answer particular questions. The results of this research study may be presented at scientific or professional meetings or published in scientific journals. Your individual privacy will be maintained in all published and written data resulting from the study. In accordance with scientific norms, the data from this study may be used or shared with other researchers for future research (after removing personally identifying information) without additional consent from you.</p>
            <p>CONTACT INFORMATION: Questions: If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact the Protocol Director, Robert Hawkins (
rdhawkins@stanford.edu, 217-549-6923). </p>
            <p>Independent Contact: If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at 650-723-2480 or toll free at 1-866-680-2906, or email at irbnonmed@stanford.edu. You can also write to the Stanford IRB, Stanford University, 1705 El Camino Real, Palo Alto, CA 94306. Please save or print a copy of this page for your records.</p>
            <p>Please click "I Agree" if you wish to participate.</p>
        </div>
    `,
    choices: ['I Agree', 'I Do Not Agree'],
    button_html: ['<button class="jspsych-btn">%choice%</button>', '<button class="jspsych-btn">%choice%</button>'],
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
    console.log('Data saved');
    window.location = "https://app.prolific.com/submissions/complete?cc=CGQ0UW9E";  // Replace XXXXXX with your code
}




// Configure save_data trial
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "RfN6XiuGFFg3",
    filename: () => `borrowing_adult2_${random_id}.csv`,
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

        const headers = 'participant_id,study_id,session_id,trial_number,condition,category,image_name,word,click_order,rt,id,typicality';
        const rows = imageTrials.map(trial => {
            const imageInfo = parseImageInfo(trial.image_name);
            return `${trial.participant_id},${trial.study_id || ''},${trial.session_id || ''},${trial.trial_number},${trial.condition},${trial.category},${trial.image_name},${trial.word},${trial.click_order},${trial.rt},${imageInfo.id},${imageInfo.typicality}`;
        });

        return [headers, ...rows].join('\n');
    },
    on_finish: () => {
        window.location.href = "https://app.prolific.com/submissions/complete?cc=CR3289CP"; //update with new prolifci complete
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
            study_id: study_id,
            session_id: session_id,
            condition: condition,
            category: category,
            word: trialWord
        }
    };
}

// Create instructions trial
const instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="width: 800px;">
            <h2>Instructions</h2>
            <p>In this task, you will select images to indicate your understanding of new or familiar words. If you encounter an unfamiliar word and are unsure about its meaning, select what makes the most sense to you.</p>
            <p>Click "Begin" when you're ready to start.</p>
        </div>
    `,
    choices: ['Begin'],
    button_html: ['<button class="jspsych-btn">%choice%</button>'],
    data: {
        trial_type: 'instructions'
    }
};


// Wait for document to be ready
document.addEventListener('DOMContentLoaded', () => {
   
    // Add properties to jsPsych data
    jsPsych.data.addProperties({
        random_id: random_id,
        condition: condition
    });
    
    // Create timeline
    const timeline = [
        consent,
        instructions,
        recaptcha
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