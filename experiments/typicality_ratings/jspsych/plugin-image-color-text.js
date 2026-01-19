const jsPsychImageColorText = (function (jspsych) {
    'use strict';
  
    const info = {
      name: 'image-color-text',
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
          default: '',
          description: 'The prompt text displayed above the input box.'
        },
        image_width: {
          type: jspsych.ParameterType.INT,
          pretty_name: 'Image width',
          default: 400,
          description: 'Width of the image in pixels.'
        },
        case_sensitive: {
          type: jspsych.ParameterType.BOOL,
          pretty_name: 'Case sensitive',
          default: false,
          description: 'Whether the answer should be case sensitive.'
        },
        require_response: {
          type: jspsych.ParameterType.BOOL,
          pretty_name: 'Require response',
          default: true,
          description: 'Whether to require a response before continuing.'
        }
      }
    };
  
    /**
     * Plugin class
     */
    class ImageColorTextPlugin {
      constructor(jsPsych) {
        this.jsPsych = jsPsych;
      }
  
      trial(display_element, trial) {
        const startTime = performance.now();
  
        // Create HTML structure
        const html = `
          <div id="jspsych-image-color-text-container" style="width: 100%; text-align: center;">
            <canvas id="jspsych-image-color-text-canvas" width="${trial.image_width}" style="border: none; max-width: 100%;"></canvas>
            <div style="margin: 20px 0;">
              ${trial.prompt && `<p style="font-size: 18px;">${trial.prompt}</p>`}
              <input type="text" id="jspsych-image-color-text-textbox" 
                     style="font-size: 18px; padding: 10px; width: 300px; text-align: center; border: 2px solid #ccc; border-radius: 5px;"
                     ${trial.require_response ? '' : 'placeholder="Press Enter to continue"'}>
            </div>
          </div>
        `;
  
        display_element.innerHTML = html;
  
        // Get elements
        const canvas = display_element.querySelector('#jspsych-image-color-text-canvas');
        const ctx = canvas.getContext('2d');
        const textbox = display_element.querySelector('#jspsych-image-color-text-textbox');
  
  
        // Load and draw the image
        const img = new Image();
        img.onload = () => {
          // Set canvas height to maintain aspect ratio
          const aspectRatio = img.height / img.width;
          canvas.height = trial.image_width * aspectRatio;
  
          // Clear the canvas 
          ctx.clearRect(0, 0, canvas.width, canvas.height);
  
          // Fill with color first, then draw the image on top
          ctx.fillStyle = trial.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image on top
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = trial.image;
  
        // Focus on textbox
        textbox.focus();
  
        // Handle form submission
        const handleSubmit = () => {
          const endTime = performance.now();
          const rt = endTime - startTime;
          const response = textbox.value.trim();
          
          // Don't submit if no response and required
          if (trial.require_response && !response) {
            return;
          }
  
          // Check if answer is correct (but don't display feedback)
          let correct = false;
          if (trial.correct_answer !== undefined) {
            if (trial.case_sensitive) {
              correct = response === trial.correct_answer;
            } else {
              correct = response.toLowerCase() === trial.correct_answer.toLowerCase();
            }
          }
  
          // Prepare trial data
          const trialData = {
            rt: rt,
            response: response,
            correct: correct,
            correct_answer: trial.correct_answer,
            image: trial.image,
            color: trial.color,
            stimulus: trial.image 
          };
  
          // End trial immediately
          this.jsPsych.finishTrial(trialData);
        };
  
        // Event listeners
        textbox.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            // Only allow submission if there's a response or if response isn't required
            if (!trial.require_response || textbox.value.trim().length > 0) {
              handleSubmit();
            }
          }
        });
      }
    }
  
    ImageColorTextPlugin.info = info;
  
    return ImageColorTextPlugin;
  
  })(jsPsychModule);