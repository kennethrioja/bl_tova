// Title : JS script for ToVA [PRACTICE]
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
var practice_array = [1,1,0,1,0,1,1,1,0,0]; // 1 for go, 0 for no go – modify this array to suit your needs
var feedback_color = true; // change to false to prevent colored feedback at the end of each trial, see plugin-html-keyboard-response.js

// strings
var welcome_str = `
<p>Welcome to the experiment.</p>
<p>Please enter in full screen mode, for Windows press 'F11', for MacOS press 'control' + 'command' + 'F' at the same time.</p>
<p>Click the button below to continue.</p>
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
<p>Press the spacebar to continue the experiment.</p>
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

var welcome_fullscreenOn = { // welcome and fullscreen mode
    type: jsPsychFullscreen,
    message: welcome_str,
    fullscreen_mode: true
};
timeline.push(welcome_fullscreenOn);

var browsercheck = { // get browser data
    type: jsPsychBrowserCheck, // allows to have data on screen width, heigth, browser used, see https://www.jspsych.org/7.2/plugins/browser-check/
    skip_features: ['webaudio', 'webcam', 'microphone']
};
timeline.push(browsercheck);

// ####################
// ### instructions ###
// ####################

var instructions = {
    type: jsPsychInstructions,
    pages: [
    // 1
    'This test measures your ability to pay attention. You will be presented with briefly flashed displays that contain a square.',
    // 2
    'If the square is presented at the TOP, please <span class="highlight-green">press the spacebar</span>' +
    '<br>' +
    '<img src="assets/img/tova_up.png"></img>',
    // 3
    'If the square is presented at the BOTTOM, <span class="highlight-red">don’t press the spacebar</span>' +
    '<br>' +
    '<img src="assets/img/tova_down.png"></img>',
    // 4
    'Don’t guess where the square will flash, make sure you see it before you press the button. Try to balance speed and accuracy : press the button as fast as you can, but also try not to make any mistakes. If you do make a mistake, don’t worry : anyone can make a mistake on this test.',
    // 5
    'You are about to take a short practice test.' +
    '<br>' +
    `You are going to see a cross appear in the middle of the screen - please fixate there. After a few seconds, the square will flash either above the cross (TOP -> press the spacebar) or down the cross (BOTTOM -> don't press the spacebar).` +
    '<br>' +
    'Remember, the whole idea is to be as fast AND accurate as you can be.' +
    '<br>' +
    'Whenever you are ready, click the button below to begin the practice, the first trial will begin after 2 seconds.'
    ],
    show_clickable_nav: true,
    on_finish: function(data){ // wait 2000 ms before getting to the next block
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, 2000);
    }
}
timeline.push(instructions);

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
        block: '', // is modified at the begining of the block/timeline, see on_timeline_start
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

// create block 
var block = {
    timeline_variables: stimuli,
    timeline: [trial], // needs to be an array
    on_timeline_start: function () {
        trial.data.block = 'practice';
    },
    sample: {
        type: 'custom',
        fn: function () {
            return practice_array;
        }
    },
}
timeline.push(block);

// debrief block
var debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    choices: [' '],
    prompt: function () {

        var trials = jsPsych.data.get().filter({ block: 'practice' });
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
    on_finish: function(data){ // wait 1000 ms before getting to the next block
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, 1000);
    }
}

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
        final.localSave('csv', 'mydatapractice.csv');
    }
});

jsPsych.run(timeline); 