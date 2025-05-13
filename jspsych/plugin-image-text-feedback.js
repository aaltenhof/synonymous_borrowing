/**
 * Custom jsPsych plugin for displaying colorizable images with text input and feedback
 * 
 * 1. Displays an image with a specified color overlay/tint
 * 2. Shows a text input box for participant response
 * 3. Provides feedback after response
 * 4. Records response time and accuracy
 */

var jsPsychImageColorTextFeedback = (function() {

    const info = {
        name: 'image-color-text-feedback',
        parameters: {
            image: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Image',
                default: undefined,
                description: 'The image file path to be displayed.'
            },
            color: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Color',
                default: '#FFFFFF',
                description: 'Hex code for the color to apply to the image.'
            },
            correct_answer: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Correct answer',
                default: undefined,
                description: 'The correct answer for this trial.'
            },
            prompt: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Prompt',
                default: 'What is this?',
                description: 'The prompt text displayed above the input box.'
            },
            feedback_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'Feedback duration',
                default: 2000,
                description: 'Duration to show feedback in milliseconds.'
            },
            image_width: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'Image width',
                default: 400,
                description: 'Width of the image in pixels.'
            },
            image_height: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'Image height',
                default: null,
                description: 'Height of the image in pixels. If null, height will be determined automatically.'
            },
            button_text: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'Button text',
                default: 'Submit',
                description: 'Text for the submit button.'
            },
            case_sensitive: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'Case sensitive',
                default: false,
                description: 'Whether the answer should be case sensitive.'
            }
        }
    };

    class ImageColorTextFeedbackPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            const startTime = performance.now();

            // Create HTML structure
            const html = `
                <div id="jspsych-image-color-text-feedback-container" style="width: 100%; text-align: center;">
                    <canvas id="jspsych-image-color-text-feedback-canvas" width="${trial.image_width}" ${trial.image_height ? `height="${trial.image_height}"` : ''} style="border: none; max-width: 100%;"></canvas>
                    <div style="margin: 20px 0;">
                        <p>${trial.prompt}</p>
                        <input type="text" id="jspsych-image-color-text-feedback-textbox" style="font-size: 18px; padding: 10px; width: 300px; text-align: center;">
                        <br><br>
                        <button id="jspsych-image-color-text-feedback-submit" style="font-size: 18px; padding: 10px 20px; cursor: pointer;">${trial.button_text}</button>
                    </div>
                    <div id="jspsych-image-color-text-feedback-feedback" style="margin-top: 20px; font-size: 18px; font-weight: bold; height: 50px;"></div>
                </div>
            `;

            display_element.innerHTML = html;

            // Get elements
            const canvas = display_element.querySelector('#jspsych-image-color-text-feedback-canvas');
            const ctx = canvas.getContext('2d');
            const textbox = display_element.querySelector('#jspsych-image-color-text-feedback-textbox');
            const submitButton = display_element.querySelector('#jspsych-image-color-text-feedback-submit');
            const feedbackDiv = display_element.querySelector('#jspsych-image-color-text-feedback-feedback');

            // Load and draw the image
            const img = new Image();
            img.onload = () => {
                // Set canvas height if not specified
                if (!trial.image_height) {
                    const aspectRatio = img.height / img.width;
                    canvas.height = trial.image_width * aspectRatio;
                }

                // Draw the image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Apply color overlay using multiply blend mode
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = trial.color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Reset blend mode
                ctx.globalCompositeOperation = 'source-over';
            };
            img.src = trial.image;

            // Focus on textbox
            textbox.focus();

            // Handle form submission
            const handleSubmit = () => {
                const endTime = performance.now();
                const rt = endTime - startTime;
                const response = textbox.value.trim();
                
                // Check if answer is correct
                let correct = false;
                if (trial.case_sensitive) {
                    correct = response === trial.correct_answer;
                } else {
                    correct = response.toLowerCase() === trial.correct_answer.toLowerCase();
                }

                // Show feedback
                if (correct) {
                    feedbackDiv.innerHTML = '<span style="color: green;">Correct!</span>';
                } else {
                    feedbackDiv.innerHTML = `<span style="color: red;">Incorrect. The correct answer was "${trial.correct_answer}"</span>`;
                }

                // Disable input during feedback
                textbox.disabled = true;
                submitButton.disabled = true;

                // Prepare trial data
                const trialData = {
                    rt: rt,
                    response: response,
                    correct: correct,
                    correct_answer: trial.correct_answer,
                    image: trial.image,
                    color: trial.color
                };

                // End trial after feedback duration
                setTimeout(() => {
                    this.jsPsych.finishTrial(trialData);
                }, trial.feedback_duration);
            };

            // Event listeners
            submitButton.addEventListener('click', handleSubmit);
            textbox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSubmit();
                }
            });
        }
    }

    return ImageColorTextFeedbackPlugin;
})();