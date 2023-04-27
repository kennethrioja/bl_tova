// Title : JS script for ToVA [PRACTICE]
// Author : kenneth.rioja@unige.ch
// Date : 27.04.2023

// ############################
// ### experiment variables ###
// ############################
// based on Denkinger Sylvie's 'TOVA_parameters_2023' excel sheet 

var pres_time_p = 100; // stimulus presentation time
var isi_p = 500; // CHANGE TO 1900 ! inter stimulus interval
var soa_p = pres_time_p + isi_p; // duration bw the onset of two consecutive stimuli
var resp_time_p = 600; // not used
// var o_w = window.outerWidth; // check https://www.jspsych.org/7.2/plugins/virtual-chinrest/
// var o_h = window.outerHeight;
// var d = Math.sqrt(o_w * o_w + o_h * o_h);
var stim_width_p = 100; // in px, check https://www.jspsych.org/7.2/plugins/resize/
var tova_up_p = `
<div class="up"><img src='assets/img/square.png' style="width:${stim_width_p}px"></img></div>
<div class="fixcross">+</div>
`;
var tova_down_p = `
<div class="fixcross">+</div>
<div class="down"><img src='assets/img/square.png' style="width:${stim_width_p}px"></img></div>
`;
// background color = black, see 'assets/css/style.css'
var fixation_cross_p = '<div class="fixcross">+</div>'; // to change its size, see 'assets/css/style.css'
// var block_type = ["SA", "IC"]; // fixed order, sustained attention then inhibitory control
var practice_array = [1,1,0,1,0,1,1,1,0,0]; // 1 for go, 0 for no go – modify this array to suit your needs

// ##########################
// ### initialize jsPsych ###
// ##########################

var jsPsychP = initJsPsych();

// create timeline
var timelineP = [];

// preload the images
var preloadP = {
    type: jsPsychPreload,
    images: ['assets/img/square.png', // path from html
        'assets/img/tova_up.png',
        'assets/img/tova_down.png']
};
timelineP.push(preloadP);

// #################################################
// ### display welcome message + fullscreen mode ###
// #################################################

var welcome_fullscreenOnP = {
    type: jsPsychFullscreen,
    message: `
    <p>Welcome to the experiment.</p>
    <p>Please enter in full screen mode, for Windows press 'F11', for MacOS press 'control' + 'command' + 'F' at the same time.</p>
    <p>Press the button below to continue.</p>
    `,
    fullscreen_mode: true
};
timelineP.push(welcome_fullscreenOnP);

// ####################
// ### instructions ###
// ####################

var instructionsP = {
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
    'You are about to take a short practice test. You are going to see a cross appear in the middle of the screen - please fixate there. After a countdown (3...2...1...),  the first square will flash on the screen. Remember, the whole idea is to be as fast AND accurate as you can be.' +
    '<br>' +
    'If the square is presented on TOP, please <span class="highlight-green">press the spacebar</span>' +
    '<br>' +
    'If the square is presented at the BOTTOM, <span class="highlight-red">don’t press the spacebar</span>.</p>'
    ],
    show_clickable_nav: true
}
timelineP.push(instructionsP);

// ######################
// ### practice phase ###
// ######################
// https://sources.univ-jfc.fr/aobert/SART_jsPsych/-/blob/5b17d65170876e92db918e82b59c4af2820d587a/experiment_v1.6.html
var stimuliP = [
    { // represents 0 in practice_array
        stimulus: tova_down_p,
        correct_response: 'null',
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up_p,
        correct_response: ' ',
        condition: 'Go'
    }
];
// define fixation and test trials
var imageP = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsychP.timelineVariable('stimulus'),
    choices: [' '],
    trial_duration: 2000,
    data: {
        task: 'response',
        correct_response: jsPsychP.timelineVariable('correct_response'),
        condition: jsPsychP.timelineVariable('condition'),
    },
    on_finish: function (data) {
        if (data.condition == 'Go') {
            data.correct = jsPsychP.pluginAPI.compareKeys(data.response, data.correct_response);
        } else {
            data.correct = !jsPsychP.pluginAPI.compareKeys(data.response, ' ');
        }
    }
};
var fixationP = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class="fixcross">+</div>',
    choices: "NO_KEYS",
    trial_duration: isi_p,
    data: {
        task: 'fixation'
    }
};
// define test procedure
var test_procedureP = {
    timeline: [imageP, fixationP],
    timeline_variables: stimuliP,
    sample: {
        type: 'custom',
        fn: function () { 
            return practice_array;
        }
    },
}
timelineP.push(test_procedureP); // timeline = [preload, welcome, instructions1, instructions2, test_procedure]

// ####################
// ### browser data ###
// ####################

var browsercheckP = {
    type: jsPsychBrowserCheck // allows to have data on screen width, heigth, browser used, see https://www.jspsych.org/7.2/plugins/browser-check/
};
timelineP.push(browsercheckP);

// #####################
// ### debrief block ###
// #####################

var debrief_blockP = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {

        var trials = jsPsychP.data.get().filter({ task: 'response' });
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

timelineP.push(debrief_blockP);

// ############################
// ### exit fullscreen mode ###
// ############################

timelineP.push({
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    delay_after: 0,
    on_finish: function(data){
        console.log(jsPsychP.data.get().csv());
        jsPsychP.data.get().localSave('csv','mydata.csv');
    }
});

jsPsychP.run(timelineP); 