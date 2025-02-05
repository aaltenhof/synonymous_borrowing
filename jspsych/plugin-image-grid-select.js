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
        default: 2
      },
      grid_spacing: {
        type: jspsych.ParameterType.INT,
        default: 20
      },
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null
      },
      max_image_width: {
        type: jspsych.ParameterType.INT,
        default: 300
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
  }

  class ImageGridSelectPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    calculateOptimalDimensions(containerWidth, imagesPerRow, gridSpacing, maxWidth) {
      const totalSpacing = gridSpacing * (imagesPerRow - 1);
      const availableWidth = containerWidth - totalSpacing;
      const imageWidth = Math.min(
        Math.floor(availableWidth / imagesPerRow),
        maxWidth
      );
      return imageWidth;
    }

    trial(display_element, trial) {
      let clicked = 0;
      const responses = [];
      const start_time = performance.now();

      // Clear display
      display_element.innerHTML = '';

      // Create container
      const container = document.createElement('div');
      container.style.width = '95vw';
      container.style.maxWidth = '1200px';
      container.style.margin = '0 auto';
      container.style.padding = '20px';
      display_element.appendChild(container);

      // Add prompt if there is one
      if (trial.prompt !== null) {
        container.innerHTML += trial.prompt;
      }

      // Show the word for this trial
      if (trial.this_word) {
        const wordDisplay = document.createElement('div');
        wordDisplay.style.fontSize = '24px';
        wordDisplay.style.textAlign = 'center';
        wordDisplay.style.marginBottom = '20px';
        wordDisplay.innerHTML = `<strong>${trial.this_word}</strong>`;
        container.appendChild(wordDisplay);
      }

      // Add grid container
      const gridContainer = document.createElement('div');
      gridContainer.style.display = 'grid';
      gridContainer.style.gap = trial.grid_spacing + 'px';
      gridContainer.style.gridTemplateColumns = `repeat(auto-fit, minmax(200px, 1fr))`;
      gridContainer.style.margin = '20px auto';
      gridContainer.style.justifyContent = 'center';
      container.appendChild(gridContainer);

      // Function to handle window resize
      const handleResize = () => {
        const imageWidth = this.calculateOptimalDimensions(
          container.clientWidth,
          trial.images_per_row,
          trial.grid_spacing,
          trial.max_image_width
        );
        
        const images = gridContainer.getElementsByTagName('img');
        for (let img of images) {
          img.style.width = imageWidth + 'px';
          img.style.height = 'auto';
        }
      };

      // Add resize event listener
      window.addEventListener('resize', handleResize);

      // Create paths from image names
      const imagePaths = trial.image_names.map(name => 
        `${trial.stimulus_folder}/${name}`
      );
      
      // Shuffle the paths
      shuffle(imagePaths);

      // Create and load all images
      const imageLoadPromises = imagePaths.map(path => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');
          img.src = path;
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.cursor = 'pointer';
          img.style.transition = 'transform 0.2s ease';
          img.style.border = '3px solid #FFFFFF';
          
          // Add hover effect
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

              // Visual feedback
              img.style.border = '3px solid #4CAF50';
              img.style.transform = 'scale(1)';
              img.style.pointerEvents = 'none';

              // Store response
              responses.push({
                rt: rt,
                image_name: filename,
                click_order: clicked
              });

              if (clicked === trial.required_clicks) {
                setTimeout(() => {
                  window.removeEventListener('resize', handleResize);
                  display_element.innerHTML = '';
                  
                  // Finish trial
                  this.jsPsych.finishTrial({
                    rt: responses.map(r => r.rt),
                    response: responses.map(r => r.image_name),
                    click_order: responses.map(r => r.click_order),
                    stimulus_folder: trial.stimulus_folder,
                    this_word: trial.this_word
                  });
                }, 300);
              }
            }
          });

          img.onload = () => resolve(img);
          img.onerror = () => {
            console.error(`Failed to load image: ${path}`);
            reject(new Error(`Failed to load image: ${path}`));
          };
        });
      });

      // Add all images to grid when loaded
      Promise.all(imageLoadPromises)
        .then(images => {
          images.forEach(img => gridContainer.appendChild(img));
          handleResize();
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