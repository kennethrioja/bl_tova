// Title : JS script for ToVA
// Author : kenneth.rioja@unige.ch
// Date : 19.06.2023

// ############################
// ### experiment variables ###
// ############################
// based on Denkinger Sylvie's 'TOVA_parameters_2023' excel sheet 

const   pres_time = 250; // stimulus presentation time
const   soa = 2000; // duration between the onset of two consecutive stimuli
// const isi = soa - pres_time; // inter stimulus interval, NOT USE IN THE CODE
const   width_px = window.outerWidth; // check https://www.jspsych.org/7.2/plugins/virtual-chinrest/
const   height_px = window.outerHeight;
const   d_px = Math.sqrt(width_px * width_px + height_px * height_px);
const   stim_diag_px = d_px * 0.2;
const   stim_width_px = width_px * 0.2; // in px, if needed check https://www.jspsych.org/7.2/plugins/resize/
// const root_path = 'https://s3.amazonaws.com/BavLab/TOVA/';
const   root_path = './';
const   tova_up = `
<div class='up' id='shape'><img src='${root_path}assets/img/shape.png' style="width:${stim_width_px}px"></img></div>
`; // id='shape' is mandatory, without it it won't work, see plugin-html-keyboard-response.js
const   tova_down = `
<div class='down' id='shape'><img src='${root_path}assets/img/shape.png' style="width:${stim_width_px}px"></img></div>
`; // id='shape' is mandatory, without it it won't work, see plugin-html-keyboard-response.js
// background color = black, see 'assets/css/style.css'
const   fixation_cross = '<div class="fixcross" id="cross">+</div>'; // to change its size, see 'assets/css/style.css'
const   practice_array = [1, 1, 0, 1, 0]; // 1 for go, 0 for no go – modify this array to suit your needs
const   block_type = ["SA", "IC"]; // fixed order, sustained attention then inhibitory control. Note : those are the names under the column "block", they are not used for functional code - esthetic only
const   fixed_80_block_01_sa = [0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,1,0,0,1,0,1,0,0,0,1]; // fixed 80 SA (20% go / 80% nogo) block was computed through this function : lines 145-174 from https://github.com/kennethrioja/bl_tova/blob/46aa36a51c6cf42021ec62204e2b4b18bc6be4c5/assets/js/bl_tova.js. 1) Multiple sequences were computed, 2) 3 were selected by hand while having in mind to keep a distributed distribution of 1 across the entire block, 3) the selection of the chosen block was done with SD and DB
// 0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0
// 0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,0,1
const   fixed_40_block_02_ic = [1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,0,1,1,0,1,1,1,1,1,1]; // fixed 40 IC (80% go / 20% nogo) block was computed through this : lines 145-174 https://github.com/kennethrioja/bl_tova/blob/46aa36a51c6cf42021ec62204e2b4b18bc6be4c5/assets/js/bl_tova.js, selection was made the same than for SA.
// 1,0,1,1,1,1,1,1,0,1,0,1,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1
// 1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,0,1
const   fixed_blocks_array = [fixed_80_block_01_sa, fixed_40_block_02_ic] // this is the  array on which the code is based
const   post_instructions_time = 2000; // time to wait after instruction to begin the trials
const   show_fixcross_array = [true, false]; // true = show fixation cross. First one is for practice, second is for main task
const   feedback_color_array = [true, false]; // set for each block, if you want a colored feedback on your fixation cross. First one is for practice, second is for main task
var     feedback_color = false; // this global variable will be updated depending on feedback_color_array. True = changes fixation cross to green/red depending of correct/incorrect response at the end of each trial, see plugin-html-keyboard-response.js
const   ask_for_id = true; // true = displays a form asking for subject id, study id and session id. BACKEND : if false the URL MUST CONTAIN '?PROLIFIC_PID=*&STUDY_ID=*&SESSION_ID=*' with '*' being the corresponding values to variables.
var     do_practice = true; // true = do practice, false = don't. Can be a way to skip practice if problem during task.


// strings
function showHideDiv(hide, show) { // see review_str
    const srcShow = document.getElementById(show);
    const srcHide = document.getElementById(hide);
    if (srcShow != null) {
        if (srcShow.style.display == "block") {
            srcShow.style.display = 'none';
            srcHide.style.display = 'block';
        }
        else {
            srcShow.style.display = 'block';
            srcHide.style.display = 'none';
        }
        return false;
    }
};
const welcome_str = `
<p>Please enter in full screen mode, for Windows press 'F11', for MacOS press 'control' + 'command' + 'F' at the same time.</p>
<p>Click the button below to continue.</p>
`;
const endblock_practice_str1 = `
<p>Well done !</p>
<p>% of correctly answering to TOP shape = 
`;
const endblock_practice_str2 = `
%</p>
<p>% of correctly refraining answers to BOTTOM shape = 
`;
const endblock_practice_str3 = `
%</p>
<p>Press the spacebar to continue.</p>
`;
const review_str = `
<div id="review" style="display:block;">
<p>We are ready for the task now.</p>
<p>Please press "Instructions" if you want a refresher, otherwise "Begin Task".</p>
<input type="button" value="Instructions" class="jspsych-btn" style="color:grey; background-color:#303030" onClick="showHideDiv('review', 'refresher')"/>
</div>
<div id="refresher" style="display:none;">
<p>If the shape is presented at the TOP, please press the spacebar.</p>
<p>If the shape is presented at the BOTTOM, don’t press the spacebar.</p>
</div>
<br>
`;
const endblock_str1 = `
<p>Well done !</p>
<p>% of correctly answering to TOP shape = 
`
const endblock_str2 = `
%</p>
<p>% of correctly refraining answers to BOTTOM shape = `
const endblock_str3 = `
%</p>
<p>Press the spacebar to start the next block.</p>
`;
const endblock_str4 = `
%</p>
<p>Press the spacebar to complete the task.</p>
`;
// ending strings : see the end of the code to choose the one you want
const completion_code_str =`<p style="text-align:center"><br><br><br><br><br>
This is the end of the task.<br><br>
Thank you for your participation.<br><br>
You can now go back to Prolific and enter the following completion code : <br><br>
<strong>XXXX</strong>
</p>`;
const inlab_final_str =`<p style="text-align:center"><br><br><br><br><br>
This is the end of the task.<br><br>
Thank you for your participation.<br><br>
You can call the experimenter.
</p>`;
const classic_end_str =`<p style="text-align:center"><br><br><br><br><br>
This is the end of the task.<br><br>
Thank you for your participation.
</p>`;

// #####################################
// ### modifications in plugin files ###
// #####################################
// see marks '*MODIFIED*'

// 1) allow the recording of multiple responses during one trial
// https://github.com/jspsych/jsPsych/discussions/1302
// file : plugin-html-keyboard-response.js

// 2) if feedback_color = true, the CSS of the fixation cross changes to green or red depending on true or false response on go and no-go trials
// file : plugin-html-keyboard-response.js

// 3) for stimulus, I changed default: undefined to default: "" to avoid having a 'undefined' word at the end of a block
// file : plugin-html-keyboard-response.js

// 4) in final csv, creation of 'real_trial_index' column which is the trial_index for each block, 0 if not a real trial, begin by 1 if block
// file : jspsych.js

// 5) grey previous buttons in instructions
// file : plugin-instructions.js

// ###################
// ### Precautions ###
// ###################

// prevent ctrl+r or cmd+r : https://stackoverflow.com/questions/46882116/javascript-prevent-page-refresh-via-ctrl-and-r, https://stackoverflow.com/questions/3902635/how-does-one-capture-a-macs-command-key-via-javascript
$(document).ready(function () {
    $(document).on("keydown", function(e) {
        e = e || window.event;
        if (e.ctrlKey || e.metaKey) {
            let c = e.which || e.keyCode;
            if (c == 82) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });
});

// prevent getting back or closing the window : https://stackoverflow.com/questions/12381563/how-can-i-stop-the-browser-back-button-using-javascript
window.onbeforeunload = function() { return "Your work will be lost."; };

// ##########################
// ### initialize jsPsych ###
// ##########################

var jsPsych = initJsPsych();

var timeline = []; // create timeline

// capture info from Prolific through the URL
const get_subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
const get_study_id = jsPsych.data.getURLVariable('STUDY_ID');
const get_session_id = jsPsych.data.getURLVariable('SESSION_ID');

if (!ask_for_id) {
    // add variables to data
    jsPsych.data.addProperties({
        subject_id: get_subject_id,
        study_id: get_study_id,
        session_id: get_session_id,
        presentation_time: pres_time,
        soa: soa,
        stimulus_diagonal_in_px: stim_diag_px
    });
} else { // otherwise if you asked for entring manually the IDs
    var pp_id = {
        type: jsPsychSurvey,
        pages: function () { // chooses which questions to ask depending on URL infos
            // creates objects
            const id_q = { type: 'text', prompt: 'What is your Prolific PID ?', name: 'survey_subject_id', required: true };
            const study_q = { type: 'text', prompt: 'What is the Study ID ?', name: 'survey_study_id', required: true };
            const session_q = { type: 'text', prompt: 'What is the Session ID ?', name: 'survey_session_id', required: true };
            let id_questions = [[]];
            // ternary, if the previous info is not caught, then ask the question about it else do nothing
            !get_subject_id ? id_questions[0].push(id_q) : null;
            !get_study_id ? id_questions[0].push(study_q) : null;
            !get_session_id ? id_questions[0].push(session_q) : null;
            return (id_questions);
        },
        on_finish: function (data) {
            // add variables to data
            get_subject_id ?
                jsPsych.data.addProperties({ subject_id: get_subject_id })
                : jsPsych.data.addProperties({ subject_id: data.response.survey_subject_id });
            // console.log(jsPsych.data.get().last(1).values()[0]);
            // console.log(data.subject_id);
            get_study_id ?
                jsPsych.data.addProperties({ study_id: get_study_id })
                : jsPsych.data.addProperties({ study_id: data.response.survey_study_id });
            get_session_id ?
                jsPsych.data.addProperties({ session_id: get_session_id })
                : jsPsych.data.addProperties({ session_id: data.response.survey_session_id });
            jsPsych.data.addProperties({
                presentation_time: pres_time,
                soa: soa,
                stimulus_diagonal: stim_diag_px
            });
        }
    };
    timeline.push(pp_id);
}

var preload = { // preload the images
    type: jsPsychPreload,
    images: [root_path + 'assets/img/shape.png', // path from root
        root_path + 'assets/img/tova_up.png',
        root_path + 'assets/img/tova_down.png']
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

// ################
// ### PRACTICE ###
// ################

// ####################
// ### instructions ###
// ####################

var instructions = {
    type: jsPsychInstructions,
    pages: [
        // 1
        'This test measures your ability to pay attention.' + '<br>' +
        '<br>' +
        'You will be presented with briefly flashed displays that contain a shape.',
        // 2
        'If the shape is presented at the TOP, please <span class="highlight-green">press the spacebar</span>' + '<br>' +
        '<br>' +
        '<img src="assets/img/tova_up.png" width="800" heigth="auto"></img>',
        // 3
        'If the shape is presented at the BOTTOM, <span class="highlight-red">don’t press the spacebar</span>' + '<br>' +
        '<br>' +
        '<img src="assets/img/tova_down.png" width="800" heigth="auto"></img>',
        // 4
        'Don’t guess where the shape will flash, make sure you see it before you press the button.' + '<br>' +
        '<br>' +
        'Try to balance speed and accuracy : press the button as fast as you can, but also try not to make any mistakes.' + '<br>' +
        '<br>' +
        'If you do make a mistake, don’t worry : anyone can make a mistake on this test.',
        // 5
        'Remember : ' + '<br>' +
        '<br>' +
        `If the shape is presented at the TOP, please press the spacebar.` + '<br>' +
        `If the shape is presented at the BOTTOM, don’t press the spacebar.` + '<br>' +
        'Please be as fast and as accurate as possible.' + '<br>' +
        '<br>' +
        'Click the button "Next" to start the parctice.'
    ],
    show_clickable_nav: true,
    on_finish: function (data) { // change color to black and wait post_instructions_time ms before getting to the first block
        document.body.style.backgroundColor = '#000000';
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, post_instructions_time);
    }
}
do_practice ? timeline.push(instructions) : null;  // ternary to say to do push this in the timeline if we want to go through the practice

// ########################################################################
// ### define stimuli + their inner variables and trial + its procedure ###
// ########################################################################

var stimuli_practice = [
    { // represents 0 in practice_array
        stimulus: tova_down,
        stim_img: 'shapedown',
        expected_response: '0',
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up,
        stim_img: 'shapeup',
        expected_response: '1',
        condition: 'Go'
    }
];
var trial_practice = {
    type: jsPsychHtmlKeyboardResponse, // this records RT from the begining of the stim onset, see "../vendor/plugin-html-keyboard-response.js"
    stimulus: jsPsych.timelineVariable('stimulus'), // this will show the 'stimulus'
    choices: [' '], // this is the array of choices
    stimulus_duration: pres_time, // this is the stimulus presentation
    trial_duration: soa, // this is the soa
    response_ends_trial: false, // false means when a response is done, the trial is not stopping
    prompt: function () {
        if (show_fixcross_array[0])
            return (fixation_cross); // this show the fixation cross all along
    },
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

// ##################################
// ### create blocks and feedback ###
// ##################################

// create block 
var block_practice = {
    timeline_variables: stimuli_practice,
    timeline: [trial_practice], // needs to be an array
    on_timeline_start: function () {
        trial.data.block = 'practice';
        feedback_color_array[0] ? feedback_color = true : feedback_color = false; // global variable that will be set at each block. True = colored fixation cross depending on correct/incorrect at the end of each trial, see plugin-html-keyboard-response.js. 
    },
    sample: {
        type: 'custom',
        fn: function () {
            return practice_array;
        }
    },
}
do_practice ? timeline.push(block_practice) : null;

// debrief block
var debrief_block_practice = {
    type: jsPsychHtmlKeyboardResponse,
    choices: [' '],
    prompt: function () {
        const trials_practice = jsPsych.data.get().filter({ block: 'practice' });
        const go_trials_practice = trials_practice.filter({ condition: 'Go' });
        const nogo_trials_practice = trials_practice.filter({ condition: 'NoGo' });
        const correct_trials_practice = trials_practice.filter({ correct: true });
        const correct_go_trials_practice = correct_trials_practice.filter({ condition: 'Go' });
        const correct_nogo_trials_practice = correct_trials_practice.filter({ condition: 'NoGo' });
        const go_accuracy_practice = Math.round(correct_go_trials_practice.count() / go_trials_practice.count() * 100);
        const nogo_accuracy_practice = Math.round(correct_nogo_trials_practice.count() / nogo_trials_practice.count() * 100);
        const correct_go_rt_practice = Math.round(correct_go_trials_practice.select('rt').mean());
        return `${endblock_practice_str1}${go_accuracy_practice}${endblock_practice_str2}${nogo_accuracy_practice}${endblock_practice_str3}`;
    },
    on_start: function () {
        document.body.style.backgroundColor = '#202020'; // back to grey
    },
    on_finish: function (data) { // wait post_instructions_time ms before getting to the next block
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, post_instructions_time);

        const date = new Date();
        const month = date.getMonth() + 1 < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1).toString();
        const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate().toString();
        const final = jsPsych.data.get();
        console.log(final.csv()); // can be removed
        final.localSave('csv', data.subject_id + "_blTova_practice_" + date.getFullYear() + month + day + ".csv"); // BACKEND : need to save this csv
        // window.onbeforeunload = null; // disables the prevention, no need to now
        // window.location.replace("../../bl_tova/index.html?PROLIFIC_PID=" + data.subject_id + "&STUDY_ID=" + data.study_id + "&SESSION_ID=" + data.session_id); // autoredirects to task, whenever the folder of the practice is at the same level than the folder of the task, no need to now
    }
}

do_practice ? timeline.push(debrief_block_practice) : null;

// ############################
// ### exit fullscreen mode ###
// ############################

// timeline.push({
//     type: jsPsychFullscreen,
//     fullscreen_mode: false,
//     delay_after: 0,
//     on_finish: function (data) {
//         const date = new Date();
//         const month = date.getMonth() + 1 < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1).toString();
//         const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate().toString();
//         const final = jsPsych.data.get();
//         console.log(final.csv()); // can be removed
//         final.localSave('csv', data.subject_id + "_blTova_practice_" + date.getFullYear() + month + day + ".csv"); // BACKEND : need to save this csv
//         window.onbeforeunload = null; // disables the prevention
//         // window.location.replace("../../bl_tova/index.html?PROLIFIC_PID=" + data.subject_id + "&STUDY_ID=" + data.study_id + "&SESSION_ID=" + data.session_id); // autoredirects to task, whenever the folder of the practice is at the same level than the folder of the task
//     }
// });

// jsPsych.run(timeline);

// #################
// ### MAIN TASK ###
// #################

// var jsPsych = initJsPsych();

// // capture info from Prolific through the URL
// var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
// var study_id = jsPsych.data.getURLVariable('STUDY_ID');
// var session_id = jsPsych.data.getURLVariable('SESSION_ID');

// // add variables to data
// jsPsych.data.addProperties({
//     subject_id: subject_id,
//     study_id: study_id,
//     session_id: session_id,
//     presentation_time: pres_time,
//     soa: soa,
//     stimulus_diagonal_in_px: stim_diag_px
// });

// var timeline1 = []; // create timeline

// REMOVE
// var preload = { // preload the images
//     type: jsPsychPreload,
//     images: ['assets/img/shape.png', // path from html
//         'assets/img/tova_up.png',
//         'assets/img/tova_down.png']
// };
// timeline.push(preload); // same than practice

var review_fullscreenOn = { // fullscreen mode
    type: jsPsychFullscreen,
    message: review_str,
    fullscreen_mode: true,
    button_label: "Begin Task",
    on_finish: function(data){ // change color to black and wait post_instructions_time ms before getting to the first block
        document.body.style.backgroundColor = '#000000';
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, post_instructions_time);
    }
};
timeline.push(review_fullscreenOn);

// var browsercheck = { // get browser data
//     type: jsPsychBrowserCheck, // allows to have data on screen width, heigth, browser used, see https://www.jspsych.org/7.2/plugins/browser-check/
//     skip_features: ['webaudio', 'webcam', 'microphone']
// };
// timeline.push(browsercheck);

// ########################################################################
// ### define stimuli + their inner variables and trial + its procedure ###
// ########################################################################

var stimuli = [
    { // represents 0 in practice_array
        stimulus: tova_down,
        stim_img: 'shapedown',
        expected_response: '0',
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up,
        stim_img: 'shapeup',
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
    prompt: function() {
        if (show_fixcross_array[1])
            return (fixation_cross); // this show the fixation cross all along
    },
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
            feedback_color_array[1] ? feedback_color = true : feedback_color = false;
        },
        sample: {
            type: 'custom',
            fn: function () {
                // return fixed_blocks_array[i];
                return [0,1]; // for debugging
            }
        },
    }
    timeline.push(block);

    // debrief block
    var debrief_block = {
        type: jsPsychHtmlKeyboardResponse,
        choices: [' '],
        prompt: function () {
            let trials = jsPsych.data.get().filter({ block: block_type[i] });
            let go_trials = trials.filter({ condition: 'Go' });
            let nogo_trials = trials.filter({ condition: 'NoGo' });
            let correct_trials = trials.filter({ correct: true });
            let correct_go_trials = correct_trials.filter({ condition: 'Go' });
            let correct_nogo_trials = correct_trials.filter({ condition: 'NoGo' });
            let go_accuracy = Math.round(correct_go_trials.count() / go_trials.count() * 100);
            let nogo_accuracy = Math.round(correct_nogo_trials.count() / nogo_trials.count() * 100);
            let correct_go_rt = Math.round(correct_go_trials.select('rt').mean());
            if (i === fixed_blocks_array.length - 1) {
                return `${endblock_str1}${go_accuracy}${endblock_str2}${nogo_accuracy}${endblock_str4}`;
            }
            return `${endblock_str1}${go_accuracy}${endblock_str2}${nogo_accuracy}${endblock_str3}`;
        },
        on_start: function() {
            document.body.style.backgroundColor = '#202020'; // back to grey
        },
        on_finish: function(data){ // wait post_instructions_time ms before getting to the next block
            document.body.style.backgroundColor = '#000000'; // back to black
            jsPsych.pauseExperiment();
            setTimeout(jsPsych.resumeExperiment, post_instructions_time);
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
    on_finish: function (data) {
        // document.body.innerHTML = completion_code_str; // enable to show completion_code_str
        // document.body.innerHTML = inlab_final_str; 
        document.body.innerHTML = classic_end_str
        // BACKEND - WHAT DO YOU WANT TO BE DISPLAYED AT THE END OF THE TASK ?

        const date = new Date();
        const month = date.getMonth() + 1 < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1).toString();
        const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate().toString();
        const final = jsPsych.data.get();

        console.log(final.csv());
        final.localSave('csv', data.subject_id + "_blTova_task_" + date.getFullYear() + month + day + ".csv"); // BACKEND MUST SAVE FINAL.CSV() AT THIS POINT
        window.onbeforeunload = null; // disable the prevention
    }
});

jsPsych.run(timeline); 