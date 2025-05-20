// Define global variables
var participant_id = generateParticipantId(); 
var novel_words = ["tinch", "neft", "bine", "palt"];
var condition;
var jsPsychInstance;
var global_trial_number = 0;

// Function to generate a random participant ID
function generateParticipantId() {
    const baseId = Math.floor(Math.random() * 999) + 1;
    return `participant${baseId}`;
}

// Shuffle the novel words
novel_words = shuffle(novel_words);

// Set condition
if (Math.floor(Math.random() * 2) == 0) {
    condition = "between_categories";
} else {
    condition = "within_category";
}

async function loadTrialData(csvFilePath) {
    try {
        const response = await fetch(csvFilePath);
        const csvText = await response.text();
        
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        
        const trials = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const trial = {};
            
            headers.forEach((header, index) => {
                trial[header.trim()] = values[index] ? values[index].trim() : '';
            });
            
            trials.push(trial);
        }
        
        return trials;
    } catch (error) {
        console.error('Error loading trial data:', error);
        return [];
    }
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
            jsPsychInstance.endExperiment('Thank you for your time. The experiment has been ended.');
        }
    }
};

const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "sPY6vEQmdfQL",
    filename: function() {
        return `borrowing_continuous_${participant_id}.csv`;
    },
    data_string: function() {
        try {
            // get all trials
            const allTrials = jsPsychInstance.data.get().values();
            
            // filter to get only the image trials with responses 
            const relevantTrials = allTrials.filter(trial => 
                trial.response !== undefined && 
                (trial.word !== undefined || trial.correct_answer !== undefined));
            
            // create headers
            const headers = 'participant_id,trial_num,shape,filename,color,word,response,rt,isRight,trial_type';
            
            // map trial data 
            const rows = relevantTrials.map(trial => {
                const trial_num = trial.trial_number

                // extract the filename from the image path
                const imagePath = trial.image || '';
                const filename = imagePath.split('/').pop() || '';
                
                // get response and reaction time
                const response = trial.response !== undefined ? String(trial.response) : '';
                const rt = trial.rt !== undefined ? String(trial.rt) : '';
                
                // check if response is correct
                const isRight = (String(trial.response) === String(trial.correct_answer || trial.word)) ? 'true' : 'false';
                
                // determine trial type
                const trialType = trial.trial_kind || '';
                
                return `${trial.participant_id || participant_id}, ${trial_num} ,${trial.shape || ''},${filename},${trial.color || ''},${trial.word || trial.correct_answer || ''},${response},${rt},${isRight},${trialType}`;
            });

            // Return the CSV string
            return [headers, ...rows].join('\n');
        } catch (error) {
            console.error("Error generating data string:", error);
            return "participant_id,shape,filename,color,word,response,rt,isRight,trial_type\nERROR," + 
                   error.toString() + ",,,,,,,";
        }
    },
    on_finish: function() {
        console.log("Data saving complete, redirecting to Prolific");
        window.location.href = "https://app.prolific.com/submissions/complete?cc=CR3289CP";
    }
};

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

const instructions2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="width: 800px;">
            <h2>Instructions</h2>
            <p>Now you will apply your knowledge of the new categories. You will type in the text box to label the object, but you'll no longer get feedback. If you aren't sure, still make your best guess!</p>
            <p>Click "Begin" when you're ready to start.</p>
        </div>
    `,
    choices: ['Begin'],
    data: {
        trial_type: 'instructions'
    }
};

// Function to create training trial
function createTrainingTrial(trialData, trialNumber, participantId, studyId, sessionId, condition) {
    // additional console logging for debugging 
    console.log('Creating trial with data:', trialData);
    global_trial_number = global_trial_number + 1;

    return {
        type: jsPsychImageColorTextFeedback, 
        image: `stimuli/continuous_stimuli/${trialData.filename}`,
        color: trialData.color,
        correct_answer: trialData.word,
        prompt: '',
        feedback_duration: 2000,
        image_width: 400,
        data: {
            trial_kind: 'training',
            trial_number: global_trial_number,
            participant_id: participantId,
            study_id: studyId,
            session_id: sessionId,
            condition: condition,
            category: trialData.category,
            word: trialData.word,
            shape: trialData.shape,
            color: trialData.color
        }
    };
}

// Function to create testing trial
function createTestingTrial(trialData, trialNumber, participantId, studyId, sessionId, condition) {
    // additional console logging for debugging 
    console.log('Creating test trial with data:', trialData);
    global_trial_number = global_trial_number + 1;

    return {
        type: jsPsychImageColorText, 
        image: `stimuli/continuous_stimuli/${trialData.filename}`,
        color: trialData.color,
        correct_answer: trialData.word,
        prompt: '',
        image_width: 400,
        data: {
            trial_kind: 'test', 
            trial_number: global_trial_number,
            participant_id: participantId,
            study_id: studyId,
            session_id: sessionId,
            condition: condition,
            category: trialData.category,
            word: trialData.word,
            shape: trialData.shape,
            color: trialData.color
        }
    };
}

// initialize jsPsych when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    const jsPsych = initJsPsych({
        on_finish: function() {
            console.log('Experiment finished');
        }
    });
    
    jsPsychInstance = jsPsych;

    // get participant info
    var study_id = jsPsych.data.getURLVariable('STUDY_ID');
    var session_id = jsPsych.data.getURLVariable('SESSION_ID');
    
    // If PROLIFIC_PID is provided, override the random generated ID
    var prolific_pid = jsPsych.data.getURLVariable('PROLIFIC_PID');
    if (prolific_pid) {
        participant_id = prolific_pid;
    }

    jsPsych.data.addProperties({
        participant_id: participant_id,
        study_id: study_id,
        session_id: session_id,
        condition: condition
    });

    // load trial data from CSV
    console.log('Loading trial data from CSV...');
    const trialData = await loadTrialData('demo_trials.csv');
    console.log(`Loaded ${trialData.length} trials`);

    // check if data loaded 
    if (trialData.length === 0) {
        alert('Error: Could not load trial data. Please check that demo_trials.csv exists and is properly formatted.');
        return;
    }

    // shuffle trials
    const shuffledTrials = shuffle(trialData);

    // create timeline
    const timeline = [
        consent,
        instructions
    ];

    // create training trials from CSV data
    shuffledTrials.forEach((trial, index) => {
        const trainingTrial = createTrainingTrial(trial, index + 1, participant_id, study_id, session_id, condition);
        timeline.push(trainingTrial);
    });

    timeline.push(instructions2);

    // for now, create testing trials from the same CSV data
    shuffledTrials.forEach((trial, index) => {
        const testingTrial = createTestingTrial(trial, index + 1, participant_id, study_id, session_id, condition);
        timeline.push(testingTrial);
    });
 
    timeline.push(save_data);
    
    // Run the experiment
    jsPsych.run(timeline);
});