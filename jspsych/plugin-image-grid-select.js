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
    return array;
  }

  class ImageGridSelectPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      let clicked = 0;
      let trial_data = [];
      const start_time = performance.now();

      // Clear display and create container (but don't add it yet)
      display_element.innerHTML = '';
      const container = document.createElement('div');
      container.style.visibility = 'hidden'; // Start hidden
      container.innerHTML = `
        <div style="width: 95vw; max-width: 1200px; margin: 0 auto; padding: 20px;">
          <div style="font-size: 24px; text-align: center; margin-bottom: 20px;">
            <p>Select two ${trial.this_word}</p>
          </div>
          <div class="jspsych-image-grid" style="display: grid; gap: ${trial.grid_spacing}px; grid-template-columns: repeat(${trial.images_per_row}, 1fr); margin: 20px auto; justify-content: center;">
          </div>
        </div>
      `;

      const gridContainer = container.querySelector('.jspsych-image-grid');

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

              trial_data.push({
                rt: rt,
                participant_id: trial.data.participant_id,
                prolific_id: trial.data.prolific_id,
                trial_number: trial.data.trial_number,
                condition: trial.data.condition,
                category: trial.data.category,
                image_name: filename,
                word: trial.this_word,
                click_order: clicked,
                trial_type: 'image_grid'
              });

              if (clicked === trial.required_clicks) {
                setTimeout(() => {
                  display_element.innerHTML = '';
                  this.jsPsych.finishTrial(trial_data);
                }, 300);
              }
            }
          });

          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      });

      // Add container to display (still hidden)
      display_element.appendChild(container);

      // When all images are loaded
      Promise.all(imagePromises)
        .then(images => {
          // Add all images to grid
          images.forEach(img => gridContainer.appendChild(img));
          // Make everything visible at once
          container.style.visibility = 'visible';
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