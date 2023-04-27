// Title : JS script for ToVA [TASK]
// Author : kenneth.rioja@unige.ch
// Date : 27.04.2023

// ############################
// ### experiment variables ###
// ############################
// based on Denkinger Sylvie's 'TOVA_parameters_2023' excel sheet 

var pres_time = 100; // stimulus presentation time
var isi = 1900; // inter stimulus interval
var soa = pres_time + isi; // duration bw the onset of two consecutive stimuli
var resp_time = 600; // time given to answer
// var o_w = window.outerWidth; // check https://www.jspsych.org/7.2/plugins/virtual-chinrest/
// var o_h = window.outerHeight;
// var d = Math.sqrt(o_w * o_w + o_h * o_h);
var stim_width = 100; // in px, check https://www.jspsych.org/7.2/plugins/resize/
var tova_up = `
<div class="up"><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
<div class="fixcross">+</div>
`;
var tova_down = `
<div class="fixcross">+</div>
<div class="down"><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
`;
// background color = black, see 'assets/css/style.css'
var fixation_cross = '<div class="fixcross">+</div>'; // to change its size, see 'assets/css/style.css'
var block_type = ["SA", "IC"]; // fixed order, sustained attention then inhibitory control
var p_go_sa = 0.33; // percentage of go trials for SA block
var p_nogo_sa = 1 - p_go_sa; // percentage of nogo trials for SA block
var p_go_ic = 0.66; // percentage of go trials for IC block
var p_nogo_ic = 1 - p_go_ic; // percentage of nogo trials for IC block
// var pres_order // fixed, random sequence ?
var n_block_trials = 40; // number of trials per block
var fixed_block_sa = [0,0,0,1,0,0,0,0,1,1]; // to change
var fixed_block_ic = [1,1,0,1,1,1,1,0,1,0]; // to change

// ##########################
// ### initialize jsPsych ###
// ##########################

var jsPsych = initJsPsych();

// create timeline
var timeline = [];

// preload the images
var preload = {
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

// ######################
// ### practice phase ###
// ######################
// https://sources.univ-jfc.fr/aobert/SART_jsPsych/-/blob/5b17d65170876e92db918e82b59c4af2820d587a/experiment_v1.6.html
var stimuli = [
    { // represents 0 in practice_array
        stimulus: tova_down,
        correct_response: 'null',
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up,
        correct_response: ' ',
        condition: 'Go'
    }
];
// define fixation and test trials
var image = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [' '],
    trial_duration: 2000,
    data: {
        task: 'response',
        correct_response: jsPsych.timelineVariable('correct_response'),
        condition: jsPsych.timelineVariable('condition'),
    },
    on_finish: function (data) {
        if (data.condition == 'Go') {
            data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
        } else {
            data.correct = !jsPsych.pluginAPI.compareKeys(data.response, ' ');
        }
    }
};
var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class="fixcross">+</div>',
    choices: "NO_KEYS",
    trial_duration: isi,
    data: {
        task: 'fixation'
    }
};
// define test procedure
var test_procedure = {
    timeline: [image, fixation],
    timeline_variables: stimuli,
    sample: {
        type: 'custom',
        fn: function () { 
            return fixed_block_sa;
        }
    },
}
timeline.push(test_procedure);

// ####################
// ### browser data ###
// ####################

var browsercheck = {
    type: jsPsychBrowserCheck // allows to have data on screen width, heigth, browser used, see https://www.jspsych.org/7.2/plugins/browser-check/
};
timeline.push(browsercheck);

// #####################
// ### debrief block ###
// #####################

var debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {

        var trials = jsPsych.data.get().filter({ task: 'response' });
        var go_trials = trials.filter({ condition: 'Go' });
        var nogo_trials = trials.filter({ condition: 'NoGo' });
        var correct_trials = trials.filter({ correct: true });
        var correct_go_trials = correct_trials.filter({ condition: 'Go' });
        var correct_nogo_trials = correct_trials.filter({ condition: 'NoGo' });
        var go_accuracy = Math.round(correct_go_trials.count() / go_trials.count() * 100);
        var nogo_accuracy = Math.round(correct_nogo_trials.count() / nogo_trials.count() * 100);
        var correct_go_rt = Math.round(correct_go_trials.select('rt').mean());

        return `<p>You responded correctly on ${go_accuracy}% of the ${go_trials.count()} go trials.</p>
        <p>Your average response time on correct go trials was ${correct_go_rt}ms.</p>
        <p>You refrained correctly on ${nogo_accuracy}% of the ${nogo_trials.count()} nogo trials.</p>
        <p>Press any key to complete the experiment. Thank you!</p>`;

    },
    // on_finish: function(data){ // for Luca
    //     console.log(jsPsychP.data.get().csv());
    //     jsPsychP.data.get().localSave('csv','mydata.csv');
    //     }
};

// var debrief_blockP = {
//     type: jsPsychInstructions,
//     pages: [
//         'Good job ! The practice phase is done. Before getting to the task, let’s review one more last time :' +
//         '<br>' +
//         '• Press the spacebar as fast as you can, but only when you see the small square presented at the top.' +
//         '<br>' +
//         '• When you press the spacebar, only press it once and don’t hold it down.' +
//         '<br>' +
//         '• Finally, don’t go too fast or try to guess; take enough time to see where the square is really presented.' +
//         '<br>' +
//         '<br>' +
//         'Press the space bar to begin the experiment.</p>'
//     ],
//     allow_backward: false,
//     show_clickable_nav: true
// };

timeline.push(debrief_block);

// ############################
// ### exit fullscreen mode ###
// ############################

timeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    delay_after: 0,
    on_finish: function(data){
        console.log(jsPsych.data.get().csv());
        jsPsych.data.get().localSave('csv','mydata.csv');
    }
});

jsPsych.run(timeline); 