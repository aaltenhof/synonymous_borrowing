var jsPsychImageGridSelect = (function (jspsych) {
  'use strict';

  const info = {
    name: 'image-grid-select',
    parameters: {
      stimulus_folder: {
        type: jspsych.ParameterType.STRING,
        default: undefined
      },
      this_word: {
        type: jspsych.ParameterType.STRING,
        default: undefined
      },
      image_names: {
        type: jspsych.ParameterType.STRING,
        array: true,
        default: undefined
      },
      required_clicks: {
        type: jspsych.ParameterType.INT,
        default: 2
      },
      images_per_row: {
        type: jspsych.ParameterType.INT,
        default: 4
      },
      grid_spacing: {
        type: jspsych.ParameterType.INT,
        default: 20
      },
      max_image_width: {
        type: jspsych.ParameterType.INT,
        default: 200
      }
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
    return array; // Return the shuffled array
  }

  class ImageGridSelectPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      let clicked = 0;
      const responses = [];
      const start_time = performance.now();

      display_element.innerHTML = `
        <div style="width: 95vw; max-width: 1200px; margin: 0 auto; padding: 20px;">
          <div style="font-size: 24px; text-align: center; margin-bottom: 20px;">
            <p>Select two ${trial.this_word}</p>
          </div>
          <div class="jspsych-image-grid" style="display: grid; gap: ${trial.grid_spacing}px; grid-template-columns: repeat(${trial.images_per_row}, 1fr); margin: 20px auto; justify-content: center;">
          </div>
        </div>
      `;

      const gridContainer = display_element.querySelector('.jspsych-image-grid');

      const imagePaths = shuffle([...trial.image_names]).map(name => 
        `${trial.stimulus_folder}/${name}`
      );

      const imagePromises = imagePaths.map(path => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');
          img.src = path;
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.cursor = 'pointer';
          img.style.transition = 'transform 0.2s ease';
          img.style.border = '3px solid #FFFFFF';

          img.addEventListener('mouseenter', () => {
            if (clicked < trial.required_clicks) {
              img.style.transform = 'scale(1.05)';
            }
          });

          img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
          });

          img.addEventListener('click', () => {
            if (clicked < trial.required_clicks) {
              clicked++;
              const rt = Math.round(performance.now() - start_time);
              const filename = path.split('/').pop();

              img.style.border = '3px solid #4CAF50';
              img.style.transform = 'scale(1)';
              img.style.pointerEvents = 'none';

              // Add response data
              const responseData = {
                participant_id: trial.data.participant_id,
                prolific_id: trial.data.prolific_id,
                trial_number: trial.data.trial_number,
                condition: trial.data.condition,
                category: trial.data.category,
                image_name: filename,
                word: trial.this_word,
                click_order: clicked,
                rt: rt
              };

              // Add response to jsPsych data
              jsPsych.data.write(responseData);

              if (clicked === trial.required_clicks) {
                setTimeout(() => {
                  display_element.innerHTML = '';
                  jsPsych.finishTrial();
                }, 300);
              }
            }
          });

          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      });

      Promise.all(imagePromises)
        .then(images => {
          images.forEach(img => gridContainer.appendChild(img));
        })
        .catch(error => {
          console.error('Error loading images:', error);
          display_element.innerHTML = 'Error loading images. Please try again.';
        });
    }
  }

  ImageGridSelectPlugin.info = info;
  return ImageGridSelectPlugin;
})(jsPsychModule);