// Title : JS script for ToVA [TASK]
// Author : kenneth.rioja@unige.ch
// Date : 08.05.2023

// ############################
// ### experiment variables ###
// ############################
// based on Denkinger Sylvie's 'TOVA_parameters_2023' excel sheet 

var pres_time = 250; // stimulus presentation time
var soa = 2000; // duration between the onset of two consecutive stimuli
// var isi = soa - pres_time; // inter stimulus interval, NOT USE IN THE CODE
// var o_w = window.outerWidth; // check https://www.jspsych.org/7.2/plugins/virtual-chinrest/
// var o_h = window.outerHeight;
// var d = Math.sqrt(o_w * o_w + o_h * o_h);
var stim_width = 100; // in px, if needed check https://www.jspsych.org/7.2/plugins/resize/
var tova_up = `
<div class='up' id='square'><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
`;
var tova_down = `
<div class='down' id='square'><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
`;
// background color = black, see 'assets/css/style.css'
var fixation_cross = '<div class="fixcross" id="cross">+</div>'; // to change its size, see 'assets/css/style.css'
var block_type = ["SA", "IC"]; // fixed order, sustained attention then inhibitory control. Note : those are the names under the column "block", they are not used for functional code - esthetic only
var fixed_80_block_01_sa = [0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,1,0,0,1,0,1,0,0,0,1]; // fixed 80 SA (20% go / 80% nogo) block was computed through this function : lines 145-174 from https://github.com/kennethrioja/bl_tova/blob/46aa36a51c6cf42021ec62204e2b4b18bc6be4c5/assets/js/bl_tova.js. 1) Multiple sequences were computed, 2) 3 were selected by hand while having in mind to keep a distributed distribution of 1 across the entire block, 3) the selection of the chosen block was done with SD and DB
// 0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0
// 0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,0,1
var fixed_40_block_02_ic = [1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,0,1,1,0,1,1,1,1,1,1]; // fixed 40 IC (80% go / 20% nogo) block was computed through this : lines 145-174 https://github.com/kennethrioja/bl_tova/blob/46aa36a51c6cf42021ec62204e2b4b18bc6be4c5/assets/js/bl_tova.js, selection was made the same than for SA.
// 1,0,1,1,1,1,1,1,0,1,0,1,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1
// 1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,0,1
var fixed_blocks_array = [fixed_80_block_01_sa, fixed_40_block_02_ic] // this is the  array on which the code is based
var time_before_trials = 2000; // time to wait before getting into the trials
var feedback_color = true; // change to false to prevent colored feedback at the end of each trial, see plugin-html-keyboard-response.js

// strings
var review_str = `
<p>Let’s review :</p>
<p>• Press the spacebar as fast as you can, but only when you see the small square presented at the top.<br>
• When you press the spacebar, only press it once and don’t hold it down.<br>
• Finally, don’t go too fast or try to guess; take enough time to see where the square is really presented.</p>
<p>Click on the button below whenever you are ready to begin the task.</p>
`;
var endblock_str1 = `
<p>Well done !</p>
<p>% of correctly answering to TOP square = 
`
var endblock_str2 = `
%</p>
<p>% of correctly refraining answers to BOTTOM square = `
var endblock_str3 = `
%</p>
<p>Press the spacebar to continue.</p>
`;

// #####################################
// ### modifications in plugin files ###
// #####################################
// see marks '*MODIFIED*'

// 1) allow the recording of multiple responses during one trial
// https://github.com/jspsych/jsPsych/discussions/1302
// file : plugin-html-keyboard-response.js

// 2) if feedback_color = true, the CSS of the fixation cross changes to green or red depending on true or false response
// file : plugin-html-keyboard-response.js

// 3) for stimulus, I changed default: undefined to default: "" to avoid having a 'undefined' word at the end of a block
// file : plugin-html-keyboard-response.js

// 4) in final csv, creation of 'real_trial_index' column which is the trial_index for each block, 0 if not a real trial, begin by 1 if block
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

var review_fullscreenOn = { // fullscreen mode
    type: jsPsychFullscreen,
    message: review_str,
    fullscreen_mode: true,
    on_finish: function(data){ // wait time_before_trials ms before getting to the next block
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, time_before_trials);
    }
};
timeline.push(review_fullscreenOn);

var browsercheck = { // get browser data
    type: jsPsychBrowserCheck, // allows to have data on screen width, heigth, browser used, see https://www.jspsych.org/7.2/plugins/browser-check/
    skip_features: ['webaudio', 'webcam', 'microphone']
};
timeline.push(browsercheck);

// ########################################################################
// ### define stimuli + their inner variables and trial + its procedure ###
// ########################################################################

var stimuli = [
    { // represents 0 in practice_array
        stimulus: tova_down,
        stim_img: 'squaredown',
        expected_response: '0',
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up,
        stim_img: 'squareup',
        expected_response: '1',
        condition: 'Go'
    }
];
var trial = {
    type: jsPsychHtmlKeyboardResponse, // this records RT from the begining of the stim onset, see "../vendor/plugin-html-keyboard-response.js"
    stimulus: jsPsych.timelineVariable('stimulus'), // this will show the 'stimulus'
    choices: [' '], // this is the array of choices
    stimulus_duration: pres_time, // this is the stimulus presentation
    trial_duration: soa, // this is the soa
    response_ends_trial: false, // false means when a response is done, the trial is not stopping
    prompt: fixation_cross, // this show the fixation cross all along
    data: {
        block: '', // is modified at the begining of the block/timeline, see block.on_timeline_start
        condition: jsPsych.timelineVariable('condition'),
        expected_response: jsPsych.timelineVariable('expected_response'),
        effective_response: '', // is modified at the end of each trial, see "'on_finish' below
    },
    on_finish: function (data) {
        // give to data.stimulus the right label
        data.stimulus = jsPsych.timelineVariable('stim_img');
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

// ####################################################################
// ### for loop on fixed_blocks_array to create blocks and feedback ###
// ####################################################################

for (let i = 0; i < fixed_blocks_array.length; i++){
    // create block 
    var block = {
        timeline_variables: stimuli,
        timeline: [trial], // needs to be an array
        on_timeline_start: function () {
            trial.data.block = block_type[i]; // change block name to block_type[i]
        },
        sample: {
            type: 'custom',
            fn: function () {
                return fixed_blocks_array[i];
            }
        },
    }
    timeline.push(block);

    // debrief block
    var debrief_block = {
        type: jsPsychHtmlKeyboardResponse,
        choices: [' '],
        prompt: function () {

            var trials = jsPsych.data.get().filter({ block: block_type[i] });
            var go_trials = trials.filter({ condition: 'Go' });
            var nogo_trials = trials.filter({ condition: 'NoGo' });
            var correct_trials = trials.filter({ correct: true });
            var correct_go_trials = correct_trials.filter({ condition: 'Go' });
            var correct_nogo_trials = correct_trials.filter({ condition: 'NoGo' });
            var go_accuracy = Math.round(correct_go_trials.count() / go_trials.count() * 100);
            var nogo_accuracy = Math.round(correct_nogo_trials.count() / nogo_trials.count() * 100);
            var correct_go_rt = Math.round(correct_go_trials.select('rt').mean());

            return `${endblock_str1}${go_accuracy}${endblock_str2}${nogo_accuracy}${endblock_str3}`;

        },
        on_finish: function(data){ // wait time_before_trials ms before getting to the next block
            jsPsych.pauseExperiment();
            setTimeout(jsPsych.resumeExperiment, time_before_trials);
        }
    };
    timeline.push(debrief_block);
}

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