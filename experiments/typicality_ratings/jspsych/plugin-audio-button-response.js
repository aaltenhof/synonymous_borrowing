var jsPsychAudioButtonResponse=function(e){
	"use strict";
	function t(e,t){
		for(var n=0;n<t.length;n++){
			var a=t[n];
			a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)
		}
	}
	var n={
		name:"audio-button-response",
		parameters:{
			stimulus:{
				type:e.ParameterType.AUDIO,
				pretty_name:"Stimulus",
				default:void 0
			},
			choices:{
				type:e.ParameterType.STRING,
				pretty_name:"Choices",
				default:void 0,
				array:!0
			},
			button_html:{
				type:e.ParameterType.HTML_STRING,
				pretty_name:"Button HTML",
				default:'<button class="jspsych-btn">%choice%</button>',
				array:!0
			},
			prompt:{
				type:e.ParameterType.HTML_STRING,
				pretty_name:"Prompt",
				default:null
			},
			trial_duration:{
				type:e.ParameterType.INT,
				pretty_name:"Trial duration",
				default:null
			},
			margin_vertical:{
				type:e.ParameterType.STRING,
				pretty_name:"Margin vertical",
				default:"0px"
			},
			margin_horizontal:{
				type:e.ParameterType.STRING,
				pretty_name:"Margin horizontal",
				default:"8px"
			},
			response_ends_trial:{
				type:e.ParameterType.BOOL,
				pretty_name:"Response ends trial",
				default:!0
			},
			trial_ends_after_audio:{
				type:e.ParameterType.BOOL,
				pretty_name:"Trial ends after audio",
				default:!1
			},
			response_allowed_while_playing:{
				type:e.ParameterType.BOOL,
				pretty_name:"Response allowed while playing",
				default:!0
			}
		}
	},
	a=function(){
		function e(t){
			!function(e,t){
				if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")
			}
			(this,e),this.jsPsych=t
		}
		var n,a,r;
		return n=e,(a=[{
			key:"trial",
			value:function(e,t,n){
			var a,r,i=this,
			o=this.jsPsych.pluginAPI.audioContext(),
			s={
				rt:null,button:null
			};
			this.jsPsych.pluginAPI.getAudioBuffer(t.stimulus).then((function(e){
				null!==o?(i.audio=o.createBufferSource(),i.audio.buffer=e,i.audio.connect(o.destination)):(i.audio=e,i.audio.currentTime=0),u()
			})).catch((function(e){console.error('Failed to load audio file "'.concat(t.stimulus,'". Try checking the file path. We recommend using the preload plugin to load audio files.')),
				console.error(e)
			}));
			var u=function(){
				t.trial_ends_after_audio&&i.audio.addEventListener("ended",l),
				t.response_allowed_while_playing||t.trial_ends_after_audio||i.audio.addEventListener("ended",p);
				var a=[];
				if(Array.isArray(t.button_html))t.button_html.length==t.choices.length?a=t.button_html:console.error("Error in audio-button-response plugin. The length of the button_html array does not equal the length of the choices array");else for(var s=0;s<t.choices.length;s++)a.push(t.button_html);
				var u='<div id="jspsych-audio-button-response-btngroup">';
				for(s=0;s<t.choices.length;s++){
					var c=a[s].replace(/%choice%/g,t.choices[s]);
					u+='<div class="jspsych-audio-button-response-button" style="cursor: pointer; display: inline-block; margin:'+t.margin_vertical+" "+t.margin_horizontal+'" id="jspsych-audio-button-response-button-'+s+'" data-choice="'+s+'">'+c+"</div>"
				}
				u+="</div>",null!==t.prompt&&(u+=t.prompt),e.innerHTML=u,t.response_allowed_while_playing?p():d(),r=performance.now(),null!==o?(r=o.currentTime,i.audio.start(r)):i.audio.play(),null!==t.trial_duration&&i.jsPsych.pluginAPI.setTimeout((function(){l()}),t.trial_duration),n()},l=function n(){i.jsPsych.pluginAPI.clearAllTimeouts(),null!==o?i.audio.stop():i.audio.pause(),i.audio.removeEventListener("ended",n),i.audio.removeEventListener("ended",p);
					var r={
						rt:s.rt,
						stimulus:t.stimulus,
						response:s.button
					};
					e.innerHTML="",i.jsPsych.finishTrial(r),a()
				}; 
				function c(e){
					!function(e){
						var n=performance.now(),a=Math.round(n-r);
						null!==o&&(n=o.currentTime,a=Math.round(1e3*(n-r))),s.button=parseInt(e),s.rt=a,d(),t.response_ends_trial&&l()
					}(e.currentTarget.getAttribute("data-choice"))
				}
				function d(){
					for(var e=document.querySelectorAll(".jspsych-audio-button-response-button"),t=0;t<e.length;t++){
						var n=e[t].querySelector("button");
						n&&(n.disabled=!0),e[t].removeEventListener("click",c)
					}
				}
				function p(){
					for(var e=document.querySelectorAll(".jspsych-audio-button-response-button"),t=0;t<e.length;t++){
						var n=e[t].querySelector("button");
						n&&(n.disabled=!1),e[t].addEventListener("click",c)
					}
				}
				return new Promise((function(e){a=e}))
			}
		},
		{key:"simulate",value:function(e,t,n,a){
			"data-only"==t&&(a(),this.simulate_data_only(e,n)),"visual"==t&&this.simulate_visual(e,n,a)
		}},
		{key:"create_simulation_data",value:function(e,t){
			var n={
				stimulus:e.stimulus,
				rt:this.jsPsych.randomization.sampleExGaussian(500,50,1/150,!0),
				response:this.jsPsych.randomization.randomInt(0,e.choices.length-1)
			},
			a=this.jsPsych.pluginAPI.mergeSimulationData(n,t);
			return this.jsPsych.pluginAPI.ensureSimulationDataConsistency(e,a),a
		}},
		{key:"simulate_data_only",value:function(e,t){
			var n=this.create_simulation_data(e,t);
			this.jsPsych.finishTrial(n)
		}},
		{key:"simulate_visual",value:function(e,t,n){
			var a=this,r=this.create_simulation_data(e,t),i=this.jsPsych.getDisplayElement(),o=function(){
				null!==r.rt&&a.jsPsych.pluginAPI.clickTarget(i.querySelector('div[data-choice="'.concat(r.response,'"] button')),r.rt)
			};
			this.trial(i,e,(function(){
				n(),e.response_allowed_while_playing?o():a.audio.addEventListener("ended",o)
			}))
		}}])&&t(n.prototype,a),r&&t(n,r),Object.defineProperty(n,"prototype",{writable:!1}),e}();return a.info=n,a
	}(jsPsychModule);
//# sourceMappingURL=index.browser.min.js.map