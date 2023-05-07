// Title : JS script for ToVA [TASK]
// Author : kenneth.rioja@unige.ch
// Date : 27.04.2023

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
<div class="up"><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
`;
var tova_down = `
<div class="down"><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
`;
// background color = black, see 'assets/css/style.css'
var fixation_cross = '<div class="fixcross">+</div>'; // to change its size, see 'assets/css/style.css'
var block_n = 2; // number of blocks
var block_type = ["SA", "IC"]; // fixed order, sustained attention then inhibitory control
var test_block = [0, 0, 1, 1]; // enter 0 for no-go and 1 fo go separated by coma between the brackets below, e.g., [0,1] will give a block of 2 trials, first being a no-go, second being a go.
// var fixed_block_01_sa_40 = [0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,0,0,1,0,0,1,0,1,0,1,0,0,1,0,0,0,1,0,1,0,1,0];
var fixed_80_block_01_sa = [0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,1,0,0,1,0,1,0,0,0,1
];
// 0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0
// 0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,0,1
var fixed_40_block_02_ic = [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1];

// #####################################
// ### modifications in plugin files ###
// #####################################
// see marks '*MODIFIED*'

// 1) allow the recording of multiple responses during one trial
// https://github.com/jspsych/jsPsych/discussions/1302
// file : plugin-html-keyboard-response.js

// 2) in final csv, creation of 'real_trial_index' column which is the trial_index for each block, 0 if not a real trial, begin by 1 if block
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

// ######################################################################
// ### define stimuli + their inner variables and trial + its procedure ###
// ######################################################################

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
var trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [' '],
    stimulus_duration: pres_time,
    trial_duration: soa,
    response_ends_trial: false,
    prompt: fixation_cross,
    data: {
        block: '', // is modified at the begining of the block/timeline, see "var block_01_sa {'on_timeline_start'}"
        expected_key: jsPsych.timelineVariable('expected_key'),
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

// ######################
// ### 1st block : SA ###
// ######################

var block_01_sa = {
    timeline_variables: stimuli,
    timeline: [trial], // needs to be an array
    on_timeline_start: function () {
        trial.data.block = block_type[0]; // change block name to block_type[0] (= "SA")
    },
    sample: {
        type: 'custom',
        fn: function () { // SA
            var n_gotrials = 16;
            var n_nogotrials = 64;
            var arr = [];
            function rand50() {
                return Math.floor(Math.random() * 10) & 1;
            }
            function rand75() { // https://www.geeksforgeeks.org/generate-0-1-25-75-probability/
                return +!(!rand50() | !rand50());
            }
            while (arr.length < 80) {
                var rdm = rand75();
                if (arr.length == 0) { // first trial is nogo for SA
                    arr.push(0);
                    n_nogotrials--;
                } else if (arr[arr.length - 3] == 1 && arr[arr.length - 2] == 1 && arr[arr.length - 1] == 1 && n_nogotrials > 0) { // not more than 3 go in a row
                    arr.push(0);
                    n_nogotrials--;
                } else if (rdm == 1 && n_gotrials > 0) {
                    arr.push(rdm);
                    n_gotrials--;
                } else if (rdm == 0 && n_nogotrials > 0) {
                    arr.push(rdm);
                    n_nogotrials--;
                }
            }
            console.log(arr.length);
            console.log(arr.reduce((accumulator, currentValue) => {
                return accumulator + currentValue
            }, 0)); //https://www.freecodecamp.org/news/how-to-add-numbers-in-javascript-arrays/
            console.log(arr.toString());
            return test_block;
        }
    },
}
timeline.push(block_01_sa);

// ########################
// ### debrief block SA ###
// ########################

var debrief_block_sa = {
    type: jsPsychHtmlKeyboardResponse,
    prompt: function () {

        var trials = jsPsych.data.get().filter({ block: 'SA' });
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
        <p>ARE YOU READY TO CONTINUE ?</p>
        <p>Press any key to continue the experiment.</p>`;

    },
};
timeline.push(debrief_block_sa);

// ######################
// ### 2nd block : IC ###
// ######################

var block_02_ic = {
    timeline_variables: stimuli,
    timeline: [trial], // needs to be an array
    on_timeline_start: function () {
        trial.data.block = block_type[1]; // change block name to block_type[1] (= "IC")
    },
    sample: {
        type: 'custom',
        fn: function () {
            var t = [1, 1, 0, 0];
            return t;
        }
    },
}
timeline.push(block_02_ic);

// ########################
// ### debrief block IC ###
// ########################

var debrief_block_ic = {
    type: jsPsychHtmlKeyboardResponse,
    prompt: function () {

        var trials = jsPsych.data.get().filter({ block: 'IC' });
        var go_trials = trials.filter({ condition: 'Go' });
        var nogo_trials = trials.filter({ condition: 'NoGo' });
        var correct_trials = trials.filter({ correct: true });
        var correct_go_trials = correct_trials.filter({ condition: 'Go' });
        var correct_nogo_trials = correct_trials.filter({ condition: 'NoGo' });
        var go_accuracy = Math.round(correct_go_trials.count() / go_trials.count() * 100);
        var nogo_accuracy = Math.round(correct_nogo_trials.count() / nogo_trials.count() * 100);
        var correct_go_rt = Math.round(correct_go_trials.select('rt').mean());

        return `<p>IC : You responded correctly on ${go_accuracy}% of the ${go_trials.count()} go trials.</p>
        <p>Your average response time on correct go trials was ${correct_go_rt}ms.</p>
        <p>You refrained correctly on ${nogo_accuracy}% of the ${nogo_trials.count()} nogo trials.</p>
        <p>Press any key to complete the experiment. Thank you!</p>`;

    },
    // on_finish: function(data){ // for Luca
    //     console.log(jsPsychP.data.get().csv());
    //     jsPsychP.data.get().localSave('csv','mydata.csv');
    //     }
};
timeline.push(debrief_block_ic);

// ####################
// ### browser data ###
// ####################

var browsercheck = {
    type: jsPsychBrowserCheck, // allows to have data on screen width, heigth, browser used, see https://www.jspsych.org/7.2/plugins/browser-check/
    skip_features: ['webaudio', 'webcam', 'microphone']
};
timeline.push(browsercheck);

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