// Title : JS script for ToVA [TASK]
// Author : kenneth.rioja@unige.ch
// Date : 27.04.2023

// ############################
// ### experiment variables ###
// ############################
// based on Denkinger Sylvie's 'TOVA_parameters_2023' excel sheet 

var pres_time = 100; // stimulus presentation time
var isi = 1900; // inter stimulus interval
var soa = pres_time + isi; // duration between the onset of two consecutive stimuli
// var o_w = window.outerWidth; // check https://www.jspsych.org/7.2/plugins/virtual-chinrest/
// var o_h = window.outerHeight;
// var d = Math.sqrt(o_w * o_w + o_h * o_h);
var stim_width = 100; // in px, check https://www.jspsych.org/7.2/plugins/resize/
var tova_up = `
<div class="up"><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
`;
var tova_down = `
<div class="down"><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
`;
// background color = black, see 'assets/css/style.css'
var fixation_cross = '<div class="fixcross">+</div>'; // to change its size, see 'assets/css/style.css'
var block_type = ["SA", "IC"]; // fixed order, sustained attention then inhibitory control
// Now for the blocks and target-to-non-target ratio :  
// 1) either you want it purely random, in that case you modifiy the variables below
var n_block_trials = 40; // number of trials per block
var p_go_sa = 0.33; // percentage of go trials for SA block
var p_nogo_sa = 1 - p_go_sa; // percentage of nogo trials for SA block
var p_go_ic = 0.66; // percentage of go trials for IC block
var p_nogo_ic = 1 - p_go_ic; // percentage of nogo trials for IC block
// 2) either you want the same succession throughout the participants, in that case enter 0 for no-go and 1 fo go separated by coma between the brackets below, e.g., [0,1] will give a block of 2 trials, first being a no-go, second being a go.
var test_block = [0,0,1,1];
var fixed_block_sa = [0, 0, 0, 1, 0, 0, 0, 0, 1, 1]; // to change
var fixed_block_ic = [1, 1, 0, 1, 1, 1, 1, 0, 1, 0]; // to change
// var pres_order // fixed, random sequence ?

// #####################################
// ### modifications in plugin files ###
// #####################################
// see marks '*MODIFIED*'

// 1) allow the recording of multiple responses during one trial
// https://github.com/jspsych/jsPsych/discussions/1302
// file : plugin-html-keyboard-response.js

// 2) change response values, when refrained : response = 0, when pressed spacebar : response = 1
// file : plugin-html-keyboard-response.js

// 3) creation of 'real_trial_index' column which is the trial_index for each block
// file : jspsych.js

// ##########################
// ### initialize jsPsych ###
// ##########################

var jsPsych = initJsPsych();

var timeline = []; // create timeline

var preload = { // preload the images
    type: jsPsychPreload,
    images: ['assets/img/square.png', // path from html
        'assets/img/tova_up.png',
        'assets/img/tova_down.png']
};
timeline.push(preload);

// #################################################
// ### display review message + fullscreen mode ###
// #################################################

var review_fullscreenOn = {
    type: jsPsychFullscreen,
    message: `
    <p>Let’s review :</p>
    <p>• Press the spacebar as fast as you can, but only when you see the small square presented at the top.<br>
    • When you press the spacebar, only press it once and don’t hold it down.<br>
    • Finally, don’t go too fast or try to guess; take enough time to see where the square is really presented.</p>
    `,
    fullscreen_mode: true
};
timeline.push(review_fullscreenOn);

// #################
// ### block : SA ###
// #################

var stimuli = [
    { // represents 0 in practice_array
        stimulus: tova_down,
        stim_img: 'squaredown',
        expected_key: 'null',
        expected_response: '0',
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up,
        stim_img: 'squareup',
        expected_key: ' ',
        expected_response: '1',
        condition: 'Go'
    }
];
// define fixation and test trials
var image = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [' '],
    stimulus_duration: pres_time,
    trial_duration: soa,
    response_ends_trial: false,
    prompt : fixation_cross,
    data: {
        block: block_type[0],
        expected_key: jsPsych.timelineVariable('expected_key'),
        condition: jsPsych.timelineVariable('condition'),
        expected_response: jsPsych.timelineVariable('expected_response'),
        effective_response: '', // will be updated after

    },
    on_finish: function (data) {
        // read data.response (= array of key) to give the right number to effective_response
        if (data.response.length >= 2) {
            data.effective_response = 2; // 2 = multiple responses
          } else {
            if (data.response[0]) {
                data.effective_response = 1; // 1 = pressed space
            } else {
                data.effective_response = 0; // 0 = refrained
            }
          }
        // compute data.correct
        data.correct = (data.expected_response == data.effective_response);
    }
};

var sa = { // define sustained attention block
    timeline: [image],
    timeline_variables: stimuli,
    sample: {
        type: 'custom',
        fn: function () {
            return test_block;
        }
    },
}
timeline.push(sa);

// ####################
// ### browser data ###
// ####################

var browsercheck = {
    type: jsPsychBrowserCheck, // allows to have data on screen width, heigth, browser used, see https://www.jspsych.org/7.2/plugins/browser-check/
    skip_features: ['webaudio', 'webcam', 'microphone']
};
timeline.push(browsercheck);

// #####################
// ### debrief block ###
// #####################

var debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    prompt: function () {

        var trials = jsPsych.data.get().filter({ block: 'sa' });
        var go_trials = trials.filter({ condition: 'Go' });
        var nogo_trials = trials.filter({ condition: 'NoGo' });
        var correct_trials = trials.filter({ correct: true });
        var correct_go_trials = correct_trials.filter({ condition: 'Go' });
        var correct_nogo_trials = correct_trials.filter({ condition: 'NoGo' });
        var go_accuracy = Math.round(correct_go_trials.count() / go_trials.count() * 100);
        var nogo_accuracy = Math.round(correct_nogo_trials.count() / nogo_trials.count() * 100);
        var correct_go_rt = Math.round(correct_go_trials.select('rt').mean());

        return `<p>SA : You responded correctly on ${go_accuracy}% of the ${go_trials.count()} go trials.</p>
        <p>Your average response time on correct go trials was ${correct_go_rt}ms.</p>
        <p>You refrained correctly on ${nogo_accuracy}% of the ${nogo_trials.count()} nogo trials.</p>
        <p>Press any key to complete the experiment. Thank you!</p>`;

    },
    // on_finish: function(data){ // for Luca
    //     console.log(jsPsychP.data.get().csv());
    //     jsPsychP.data.get().localSave('csv','mydata.csv');
    //     }
};
timeline.push(debrief_block);

// ############################
// ### exit fullscreen mode ###
// ############################

timeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    delay_after: 0,
    on_finish: function (data) {
        var final = jsPsych.data.get();
        console.log(final.csv());
        final.localSave('csv', 'mydata.csv');
    }
});

jsPsych.run(timeline); 