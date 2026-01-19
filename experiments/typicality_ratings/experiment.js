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


// define all stimulus categories with their subtypes
const stimulusCategories = {
    'flowers': {
        'iris': ['flower_iris_1_2.png', 'flower_iris_2_2.png', 'flower_iris_3_2.png'],
        'round': ['flower_round_1_1.png', 'flower_round_2_1.png', 'flower_round_3_1.png'],
        'star': ['flower_star_1_1.png', 'flower_star_2_1.png', 'flower_star_3_1.png'],
        'trumpet': ['flower_trumpet_1_2.png', 'flower_trumpet_2_2.png', 'flower_trumpet_3_2.png']
    },
    'leaves': {
        'bean': ['leaf_bean_1_2.png', 'leaf_bean_2_2.png', 'leaf_bean_3_2.png'],
        'droplet': ['leaf_droplet_1_1.png', 'leaf_droplet_2_1.png', 'leaf_droplet_3_1.png'],
        'heart': ['leaf_heart_1_2.png', 'leaf_heart_2_2.png', 'leaf_heart_3_2.png'],
        'oak': ['leaf_oak_1_1.png', 'leaf_oak_2_1.png', 'leaf_oak_3_1.png']
    },
    'mushrooms': {
        'bell': ['mushroom_bell_1_2.png', 'mushroom_bell_2_2.png', 'mushroom_bell_3_2.png'],
        'disc': ['mushroom_disc_1_2.png', 'mushroom_disc_2_2.png', 'mushroom_disc_3_2.png'],
        'enoki': ['mushroom_enoki_1_1.png', 'mushroom_enoki_2_1.png', 'mushroom_enoki_3_1.png'],
        'toadstool': ['mushroom_toadstool_1_1.png', 'mushroom_toadstool_2_1.png', 'mushroom_toadstool_3_1.png']
    },
    'shells': {
        'fan': ['shell_fan_1_1.png', 'shell_fan_2_1.png', 'shell_fan_3_1.png'],
        'spiral': ['shell_spiral_1_1.png', 'shell_spiral_2_1.png', 'shell_spiral_3_1.png'],
        'stingray': ['shell_stingray_1_2.png', 'shell_stingray_2_2.png', 'shell_stingray_3_2.png'],
        'urn': ['shell_urn_1_2.png', 'shell_urn_2_2.png', 'shell_urn_3_2.png']
    },
    'cups': {
        'glass': ['cup_glass_1_1.png', 'cup_glass_2_1.png', 'cup_glass_3_1.png'],
        'teacup': ['cup_teacup_1_1.png', 'cup_teacup_2_1.png', 'cup_teacup_3_1.png'],
        'twohandled': ['cup_twohandled_1_2.png', 'cup_twohandled_2_2.png', 'cup_twohandled_3_2.png'],
        'sherry': ['cup_sherry_1_2.png', 'cup_sherry_2_2.png', 'cup_sherry_3_2.png']
    },
    'shoes': {
        'sneaker': ['shoe_sneaker_1_1.png', 'shoe_sneaker_2_1.png', 'shoe_sneaker_3_1.png'],
        'loafer': ['shoe_loafer_1_1.png', 'shoe_loafer_2_1.png', 'shoe_loafer_3_1.png'],
        'elf': ['shoe_elf_1_2.png', 'shoe_elf_2_2.png', 'shoe_elf_3_2.png'],
        'ghillie': ['shoe_ghillie_1_2.png', 'shoe_ghillie_2_2.png', 'shoe_ghillie_3_2.png']
    },
    'spoons': {
        'teaspoon': ['spoon_teaspoon_1_1.png', 'spoon_teaspoon_2_1.png', 'spoon_teaspoon_3_1.png'],
        'soup': ['spoon_soup_1_1.png', 'spoon_soup_2_1.png', 'spoon_soup_3_1.png'],
        'slotted': ['spoon_slotted_1_2.png', 'spoon_slotted_2_2.png', 'spoon_slotted_3_2.png'],
        'square': ['spoon_square_1_2.png', 'spoon_square_2_2.png', 'spoon_square_3_2.png']
    },
    'hats': {
        'ballcap': ['hat_ballcap_1_1.png', 'hat_ballcap_2_1.png', 'hat_ballcap_3_1.png'],
        'sun': ['hat_sun_1_1.png', 'hat_sun_2_1.png', 'hat_sun_3_1.png'],
        'jester': ['hat_jester_1_2.png', 'hat_jester_2_2.png', 'hat_jester_3_2.png'],
        'party': ['hat_party_1_2.png', 'hat_party_2_2.png', 'hat_party_3_2.png']
    }
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

// select one random exemplar from each subtype
function selectOnePerSubtype(categoryData, exemplarId) {
    const selectedStimuli = [];
    
    for (const [category, subtypes] of Object.entries(categoryData)) {
        for (const [subtype, exemplars] of Object.entries(subtypes)) {
            const selectedImage = exemplars[exemplarId];
            
            const parts = selectedImage.replace('.png', '').split('_');
            const typicality = parts[parts.length - 1];
            const id = parts[parts.length - 2];
            
            selectedStimuli.push({
                category: category,
                subtype: subtype,
                image_name: selectedImage,
                image_path: `stimuli/${category}/${selectedImage}`,
                id: id,
                designed_typicality: typicality
            });
        }
    }
    
    return shuffle(selectedStimuli);
}


// Instructions trial
var instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="max-width: 800px; margin: auto; text-align: left; font-size: 18px;">
            <h2 style="text-align: center;">Instructions</h2>
            <p>In this task, you’ll be asked to rate drawings of objects for how typical they are.</p>
            <p>For each picture, we want you to rate <strong>how typical</strong> (usual, common, or normal) that object is of its category. For example, a goldfish is a very typical fish, but a blowfish might be considered atypical (unusual, rare, abnormal). </p>
            <p>For example, if you see a picture of a flower, think about how typical it is as a flower.</p>
            <p>You'll use a slider to indicate your rating, from Very atypical to Very yypical.</p>
            <p>On each trial, click and drag the slider to make your rating, then click "Continue" to move on.</p>
        </div>
    `,
    choices: ['Start']
};


function createTypicalityTrial(stimulusInfo, trialNumber) {
    return {
        type: jsPsychImageSliderResponse,
        stimulus: stimulusInfo.image_path,
        stimulus_width: 300,
        stimulus_height: 300,
        maintain_aspect_ratio: true,
        prompt: `<p style="font-size: 20px; margin-top: 20px;">How typical is this object for a <strong>${stimulusInfo.category.slice(0, -1)}</strong>?</p>`,
        labels: ['Very atypical ', 'Somewhat typical', 'Very typical'],
        slider_width: 500,
        min: 0,
        max: 100,
        slider_start: 50,
        require_movement: true,
        data: {
            trial_type: 'typicality_rating',
            trial_number: trialNumber,
            study_id: study_id,
            category: stimulusInfo.category,
            subtype: stimulusInfo.subtype,
            image_name: stimulusInfo.image_name,
            id: stimulusInfo.id,
            designed_typicality: stimulusInfo.designed_typicality
        }
    };
}

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
    data: {
        trial_type: 'consent'
    },
    on_finish: function(data) {
        if(data.response == 1) {
            jsPsych.endExperiment('Thank you for your time. The experiment has been ended.');
        }
    }
};


// Configure save_data trial
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "ErJNDaCcNYUh",
    filename: () => `typicality_ratings_${random_id}.csv`,
    data_string: () => {
        const allTrials = jsPsych.data.get().values();

        const ratingTrials = allTrials.filter(trial => 
            trial.trial_type === 'typicality_rating'
        );

        console.log("Rating trials:", ratingTrials);
        console.log("PIDs:", pids);

        const headers = 'participant_id,study_id,session_date,session_time,trial_number,trial_type,category,subtype,image_name,id,designed_typicality,rating,rt';
        
        const rows = ratingTrials.map(trial => {
            return `${participant_id},${trial.study_id || ''},${session_date},${session_time},${trial.trial_number},${trial.trial_type},${trial.category},${trial.subtype},${trial.image_name},${trial.id},${trial.designed_typicality},${trial.response},${trial.rt}`;
        });

        return [headers, ...rows].join('\n');
    },
        on_finish: () => {
        window.location.href = "https://app.prolific.com/submissions/complete?cc=CR3289CP"; //update with new prolifcic completion code
    }
};

var end_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="max-width: 600px; margin: auto; text-align: center;">
            <h2>Thank you!</h2>
            <p>You have completed the study.</p>
        </div>
    `,
    choices: ['Finish']
};

document.addEventListener('DOMContentLoaded', async () => {

    const exemplar_condition = await jsPsychPipe.getCondition("ErJNDaCcNYUh");
    console.log("Assigned condition:", exemplar_condition);

    
    jsPsych.data.addProperties({
        random_id: random_id,
        exemplar_condition: exemplar_condition
    });
    
    // get all image paths for preloading
    const allImagePaths = [];
    for (const [category, subtypes] of Object.entries(stimulusCategories)) {
        for (const [subtype, exemplars] of Object.entries(subtypes)) {
            for (const img of exemplars) {
                allImagePaths.push(`stimuli/${category}/${img}`);
            }
        }
    }
    
    const preload = {
        type: jsPsychPreload,
        images: allImagePaths,
        show_detailed_errors: true
    };

    // Create timeline
    const timeline = [
        preload,
        consent,
        instructions,
        recaptcha
    ];

    let trialCounter = 0;

    // select stimuli (one per subtype)
    const selectedStimuli = selectOnePerSubtype(stimulusCategories, exemplar_condition);
    
    console.log("selected stimuli:", selectedStimuli);


    for (const stimInfo of selectedStimuli) {
        const trial = createTypicalityTrial(stimInfo, trialCounter);
        timeline.push(trial);
        trialCounter++;
    }

    timeline.push(save_data);
    timeline.push(end_screen);
    
    // Run the experiment
    jsPsych.run(timeline);
});