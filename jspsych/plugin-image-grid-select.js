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
      const start_time = performance.now();
      let trial_data = [];

      // Clear display and create hidden container
      display_element.innerHTML = '';
      const mainContainer = document.createElement('div');
      mainContainer.style.opacity = '0';
      mainContainer.style.transition = 'opacity 0.15s ease-in';
      display_element.appendChild(mainContainer);

      // Create inner content
      const container = document.createElement('div');
      container.style.width = '95vw';
      container.style.maxWidth = '1200px';
      container.style.margin = '0 auto';
      container.style.padding = '20px';
      mainContainer.appendChild(container);

      // Create grid container
      const gridContainer = document.createElement('div');
      gridContainer.style.display = 'grid';
      gridContainer.style.gap = trial.grid_spacing + 'px';
      gridContainer.style.gridTemplateColumns = `repeat(${trial.images_per_row}, 1fr)`;
      gridContainer.style.margin = '20px auto';
      gridContainer.style.justifyContent = 'center';

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

              // Store response data
              trial_data.push({
                participant_id: trial.data.participant_id,
                prolific_id: trial.data.prolific_id,
                trial_number: trial.data.trial_number,
                condition: trial.data.condition,
                category: trial.data.category,
                image_name: filename,
                word: trial.this_word,
                click_order: clicked,
                rt: rt,
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

      // Wait for all images to load
      Promise.all(imagePromises)
        .then(images => {
          // First add the instruction text
          const promptDiv = document.createElement('div');
          promptDiv.style.fontSize = '24px';
          promptDiv.style.textAlign = 'center';
          promptDiv.style.marginBottom = '20px';
          promptDiv.innerHTML = `<p>Select two ${trial.this_word}</p>`;
          container.appendChild(promptDiv);

          // Then add the grid container
          container.appendChild(gridContainer);

          // Add all images to the grid
          images.forEach(img => gridContainer.appendChild(img));

          // Finally, make everything visible at once
          mainContainer.style.opacity = '1';
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