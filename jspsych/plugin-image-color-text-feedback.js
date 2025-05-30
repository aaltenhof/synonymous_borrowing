const jsPsychImageColorTextFeedback = (function (jspsych) {
  'use strict';

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
        default: '',
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
  class ImageColorTextFeedbackPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      const startTime = performance.now();

      // Create HTML structure
      const html = `
        <div id="jspsych-image-color-text-feedback-container" style="width: 100%; text-align: center;">
          <canvas id="jspsych-image-color-text-feedback-canvas" width="${trial.image_width}" style="border: none; max-width: 100%;"></canvas>
          <div style="margin: 20px 0;">
            ${trial.prompt && `<p style="font-size: 18px;">${trial.prompt}</p>`}
            <input type="text" id="jspsych-image-color-text-feedback-textbox" 
                   style="font-size: 18px; padding: 10px; width: 300px; text-align: center; border: 2px solid #ccc; border-radius: 5px;">
          </div>
          <div id="jspsych-image-color-text-feedback-feedback" style="margin-top: 20px; font-size: 18px; font-weight: bold; height: 50px;"></div>
        </div>
      `;

      display_element.innerHTML = html;

      // Get elements
      const canvas = display_element.querySelector('#jspsych-image-color-text-feedback-canvas');
      const ctx = canvas.getContext('2d');
      const textbox = display_element.querySelector('#jspsych-image-color-text-feedback-textbox');
      const feedbackDiv = display_element.querySelector('#jspsych-image-color-text-feedback-feedback');

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
        // Don't submit if no response and required
        if (trial.require_response && textbox.value.trim().length === 0) {
          return;
        }

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

        // End trial after feedback duration
        setTimeout(() => {
          this.jsPsych.finishTrial(trialData);
        }, trial.feedback_duration);
      };

      // Event listener for Enter key submission
      textbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleSubmit();
        }
      });
    }
  }

  ImageColorTextFeedbackPlugin.info = info;

  return ImageColorTextFeedbackPlugin;

})(jsPsychModule);