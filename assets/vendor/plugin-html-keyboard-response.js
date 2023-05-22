var jsPsychHtmlKeyboardResponse = (function (jspsych) {
    'use strict';

    const info = {
        name: "html-keyboard-response",
        parameters: {
            /**
             * The HTML string to be displayed.
             */
            stimulus: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Stimulus",
                //   default: undefined, // *MODIFIED*
                default: "", // this prevents having 'undefined' when prompting the end of the block
            },
            /**
             * Array containing the key(s) the subject is allowed to press to respond to the stimulus.
             */
            choices: {
                type: jspsych.ParameterType.KEYS,
                pretty_name: "Choices",
                default: "ALL_KEYS",
            },
            /**
             * Any content here will be displayed below the stimulus.
             */
            prompt: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Prompt",
                default: null,
            },
            /**
             * How long to show the stimulus.
             */
            stimulus_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Stimulus duration",
                default: null,
            },
            /**
             * How long to show trial before it ends.
             */
            trial_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Trial duration",
                default: null,
            },
            /**
             * If true, trial will end when subject makes a response.
             */
            response_ends_trial: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Response ends trial",
                default: true,
            },
        },
    };
    /**
     * **html-keyboard-response**
     *
     * jsPsych plugin for displaying a stimulus and getting a keyboard response
     *
     * @author Josh de Leeuw
     * @see {@link https://www.jspsych.org/plugins/jspsych-html-keyboard-response/ html-keyboard-response plugin documentation on jspsych.org}
     */
    class HtmlKeyboardResponsePlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }
        trial(display_element, trial) {
            var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";
            // add prompt
            if (trial.prompt !== null) {
                new_html += trial.prompt;
            }
            // draw
            display_element.innerHTML = new_html;
            // store response *MODIFIED*
            var response = {
                rt: [],
                key: [],
            };
            // function to end trial when it is time
            const end_trial = () => {
                // kill any remaining setTimeout handlers
                this.jsPsych.pluginAPI.clearAllTimeouts();
                // kill keyboard listeners
                if (typeof keyboardListener !== "undefined") {
                    this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                }
                // gather the data to store for the trial *MODIFIED*
                var trial_data = {
                    rt: response.rt.toString(),
                    stimulus: trial.stimulus,
                    response: response.key,
                };
                // clear the display
                display_element.innerHTML = "";
                // move on to the next trial
                this.jsPsych.finishTrial(trial_data);
            };
            // handle non responses by the subject : correct nogo trial = cross turns green 250ms before end of trial *MODIFIED*
            if (feedback_color == true
                && trial.trial_duration !== null) {
                if (display_element.querySelector("#square").className == 'down') { // if stimulus' className is 'down' (nogo trial)
                    var corr_nogo = this.jsPsych.pluginAPI.setTimeout(() => { // correct_nogo : setTimeout will change cross to green 250ms before end of nogo trial
                        display_element.querySelector("#cross").style.color = "green";
                    }, trial.trial_duration - 250);
                } else if (display_element.querySelector("#square").className == 'up') { // if stimulus' className is 'up' (go trial)
                    var incorr_go = this.jsPsych.pluginAPI.setTimeout(() => { // incorrect_go : setTimeout will change cross to red 250ms before end of go trial
                        display_element.querySelector("#cross").style.color = "red";
                    }, trial.trial_duration - 250);
                }
            };
            // function to handle responses by the subject
            var after_response = (info) => {
                // after a valid response, the stimulus will have the CSS class 'responded'
                // which can be used to provide visual feedback that a response was recorded
                display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className +=
                    " responded";
                // record all the responses // *MODIFIED*
                response.rt.push(info.rt);
                response.key.push(info.key);
                if (trial.response_ends_trial) {
                    end_trial();
                }
                // correct go trial : if feedback_color = true and real trial, then change CSS to green or red depending on true or false response *MODIFIED*
                if (feedback_color == true
                    && trial.trial_duration !== null) {
                    if (display_element.querySelector("#square").className == 'up' // if did a response and stimulus' className is 'up'
                        && response.key.length == 1) { // and first response
                        display_element.querySelector("#cross").style.color = "green";
                        clearTimeout(incorr_go); // incorrect go trial : cancel the 'setTimeout' (see "handle non responses") = cross does not turn red after non-response on go trial
                    } else {
                        display_element.querySelector("#cross").style.color = "red";
                        clearTimeout(corr_nogo); // incorrect nogo trial : cancel the 'setTimeout' (see "handle non responses") = cross does not turn green after response on nogo trial
                    }
                }
            };
            // start the response listener
            if (trial.choices != "NO_KEYS") {
                var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response,
                    valid_responses: trial.choices,
                    rt_method: "performance",
                    persist: true, // *MODIFIED*
                    allow_held_key: false,
                });
            }
            // hide stimulus if stimulus_duration is set
            if (trial.stimulus_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    display_element.querySelector("#jspsych-html-keyboard-response-stimulus").style.visibility = "hidden";
                }, trial.stimulus_duration);
            }
            // end trial if trial_duration is set
            if (trial.trial_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
            }
        }
        simulate(trial, simulation_mode, simulation_options, load_callback) {
            if (simulation_mode == "data-only") {
                load_callback();
                this.simulate_data_only(trial, simulation_options);
            }
            if (simulation_mode == "visual") {
                this.simulate_visual(trial, simulation_options, load_callback);
            }
        }
        create_simulation_data(trial, simulation_options) {
            const default_data = {
                stimulus: trial.stimulus,
                rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
                response: this.jsPsych.pluginAPI.getValidKey(trial.choices),
            };
            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
            return data;
        }
        simulate_data_only(trial, simulation_options) {
            const data = this.create_simulation_data(trial, simulation_options);
            this.jsPsych.finishTrial(data);
        }
        simulate_visual(trial, simulation_options, load_callback) {
            const data = this.create_simulation_data(trial, simulation_options);
            const display_element = this.jsPsych.getDisplayElement();
            this.trial(display_element, trial);
            load_callback();
            if (data.rt !== null) {
                this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
            }
        }
    }
    HtmlKeyboardResponsePlugin.info = info;

    return HtmlKeyboardResponsePlugin;

})(jsPsychModule);
