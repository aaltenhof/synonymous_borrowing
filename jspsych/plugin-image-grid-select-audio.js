var jsPsychImageGridSelectAudio = (function (jspsych) {
  'use strict';

    function t(e,t){
        for(var n=0;n<t.length;n++){
            var a=t[n];
            a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)
        }
    }

    function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	// Gets all non-builtin properties up the prototype chain
	const getAllProperties = object => {
		const properties = new Set();

		do {
			for (const key of Reflect.ownKeys(object)) {
				properties.add([object, key]);
			}
		} while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);

		return properties;
	};

	var autoBind = (self, {include, exclude} = {}) => {
		const filter = key => {
			const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);

			if (include) {
				return include.some(match);
			}

			if (exclude) {
				return !exclude.some(match);
			}

			return true;
		};

		for (const [object, key] of getAllProperties(self.constructor.prototype)) {
			if (key === 'constructor' || !filter(key)) {
				continue;
			}

			const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
			if (descriptor && typeof descriptor.value === 'function') {
				self[key] = self[key].bind(self);
			}
		}

		return self;
	};

	var autoBind$1 = /*@__PURE__*/getDefaultExportFromCjs(autoBind);

    const info = {
        name: 'image-grid-select-audio',
        parameters: {
        stimulus: {
	        type: jspsych.ParameterType.AUDIO,
	        default: void 0
	    },
        response_allowed_while_playing: {
	        type: jspsych.ParameterType.BOOL,
	        default: true
	    },
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
            default: 100
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

  class ImageGridSelectAudioPlugin {
    constructor(jsPsych) {
	    this.jsPsych = jsPsych;
	    this.buttonElements = [];
	    this.response = { rt: null, button: null };
	    this.disable_buttons = () => {
	      for (const button of this.buttonElements) {
	        button.setAttribute("disabled", "disabled");
	      }
	    };
	    this.enable_buttons_without_delay = () => {
	      for (const button of this.buttonElements) {
	        button.removeAttribute("disabled");
	      }
	    };
	    this.enable_buttons_with_delay = (delay) => {
	      this.jsPsych.pluginAPI.setTimeout(this.enable_buttons_without_delay, delay);
	    };
	    // function to handle responses by the subject
	    this.after_response = (choice) => {
	      var endTime = performance.now();
	      var rt = Math.round(endTime - this.startTime);
	      if (this.context !== null) {
	        endTime = this.context.currentTime;
	        rt = Math.round((endTime - this.startTime) * 1e3);
	      }
	      this.response.button = parseInt(choice);
	      this.response.rt = rt;
	      this.disable_buttons();
	      if (this.params.response_ends_trial) {
	        this.end_trial();
	      }
	    };
	    // method to end trial when it is time
	    this.end_trial = () => {
	      this.audio.stop();
	      this.audio.removeEventListener("ended", this.end_trial);
	      this.audio.removeEventListener("ended", this.enable_buttons);
	      var trial_data = {
	        rt: this.response.rt,
	        stimulus: this.params.stimulus,
	        response: this.response.button
	      };
	      this.trial_complete(trial_data);
	    };
	    autoBind$1(this);
    }

    static {
	    this.info = info;
	  }

    async trial(display_element, trial, on_load) {
	    this.params = trial;
	    this.display = display_element;
	    this.context = this.jsPsych.pluginAPI.audioContext();
	    this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.stimulus);

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
      container.style.maxWidth = '800px';
      container.style.margin = '0 auto';
      container.style.padding = '20px';
      mainContainer.appendChild(container);

      // Create grid container
      const gridContainer = document.createElement('div');
      gridContainer.style.display = 'grid';
      gridContainer.style.gap = trial.grid_spacing + 'px';
      gridContainer.style.gridTemplateColumns = `repeat(${trial.images_per_row}, 1fr)`;
      gridContainer.style.margin = '50px auto';
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
                study_id: trial.data.study_id,
                session_id: trial.data.session_id,
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
          promptDiv.innerHTML = `<p>Can you pick two ${trial.this_word}?</p>`;
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

        //on_load();
        //this.startTime = performance.now();
        //if (this.context !== null) {
        //  this.startTime = this.context.currentTime;
        //}
        //this.audio.play();
    }
  }

  ImageGridSelectAudioPlugin.info = info;
  return ImageGridSelectAudioPlugin;
})(jsPsychModule);