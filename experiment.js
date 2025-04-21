// Initialize jsPsych first
const jsPsych = initJsPsych({
    on_finish: function() {
        console.log('Experiment finished');
    }
});

// Declare variables at the top
var participant_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
var study_id = jsPsych.data.getURLVariable('STUDY_ID');
var session_id = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({
    participant_id: participant_id,
    study_id: study_id,
    session_id: session_id
});

let condition;

novel_words = ["tinch", "neft", "bine", "palt"];
novel_words = shuffle(novel_words)

// Set condition
if (Math.floor(Math.random() * 2) == 0) {
    condition = "between_categories";
} else {
    condition = "within_category";
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

function duplicateArray(arr) {
    return arr.reduce((newArr, item) => {
      newArr.push(item, item);
      return newArr;
    }, []);
}

shuffle(novel_words);

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
    experiment_id: "sPY6vEQmdfQL",
    filename: () => `borrowing_${participant_id}.csv`,
    data_string: () => {
        const allTrials = jsPsych.data.get().values();
        const imageTrials = allTrials
            .filter(trial => trial.trial_type === 'image-keyboard-response-feedback')
            .flatMap(trial => [trial[0], trial[1]]);

        const headers = 'participant_id,study_id,session_id,trial_number,condition,category,shape,color,word,rt';
        const rows = imageTrials.map(trial => {
            const imageInfo = parseImageInfo(trial.image_name);
            return `${trial.participant_id},${trial.study_id || ''},${trial.session_id || ''},${trial.trial_number},${trial.condition},${trial.category},${trial.image_name},${trial.word},${trial.click_order},${trial.rt},${imageInfo.id},${imageInfo.typicality}`;
        });

        return [headers, ...rows].join('\n');
    },
    on_finish: () => {
        window.location.href = "https://app.prolific.com/submissions/complete?cc=CR3289CP";
    }
};


// Create instructions trial
const instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="width: 800px;">
            <h2>Instructions</h2>
            <p>In this task, you will learn about some unfamiliar categories. You will type in the text box to label the unfamiliar categories. If you aren't sure at first, make your best guess; you will get feedback that allows you to learn.</p>
            <p>Click "Begin" when you're ready to start.</p>
        </div>
    `,
    choices: ['Begin'],
    data: {
        trial_type: 'instructions'
    }
};

// Function to create image grid trial
function createTrainingTrial(category, trialShape, trialWord, trialColor, trialNumber) {;
    return {
        type: jsPsychImageKeyboardResponseFeedback,
        stimulus: trialShape,
        this_word: trialWord,
        data: {
            trial_type: 'training_trial',
            trial_number: trialNumber,
            participant_id: participant_id,
            study_id: study_id,
            session_id: session_id,
            condition: condition,
            category: category,
            word: trialWord,
            shape: trialShape,
            color: trialColor
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
        instructions
    ];
    
    // Get categories and shuffle them
    shapes = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
    shapes = shuffle(shapes);

    colors = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
    colors = shuffle(colors);

    let category;

    // Create trials
    let trialCounter = 0;
    for (const shape of shapes) {
        for (const color of colors) {
            console.log(shape)
            console.log(color)
            if (shape <= 9) {
                category = 1
            } else {
                category = 2
            }
            const trial = createTrainingTrial(category, `stimuli/continuous_stimuli/shape_${shape}.png`, novel_words[category], color, trialCounter);
            timeline.push(trial);
            trialCounter++;
        }
    }
    
    timeline.push(save_data);
    
    // Run the experiment
    jsPsych.run(timeline);
});