// TITLE : Bavelier Lab 'Task of Variable Attention'-like in Javascript – practice & task (bl_tova.js)
// VERSION : 0.1.0 (implemented for Naïma Gradi)
// AUTHOR : Kenneth Rioja
// EMAIL : kenneth.rioja@unige.ch
// DATE : 21.06.2023
// GITLAB LINK : TOADD
// GITHUB LINK (deprecated) : https://github.com/kennethrioja/bl_tova
// NOTE FOR RESEARCHERS AND DEVS : Please carefully read the whole section below with global variables + the data dictionnary. If you have any comments, please send me an email. I would love to read from someone who got into this code ! Thanks and have fun ! 
// NOTE FOR THE PERSON IN CHARGE OF THE BACKEND IMPLEMENTATION : I notified relevant points for you though comments having 'BACKEND' inside them. Please read them before implementing this code.

// #######################
// ### input variables ###
// #######################

// BACKEND takes care of it though calibration and URL variables

// 1. to get from calibration either by injecting data or retrieve in local storage
const   monitorsize = 13.3; // monitor diagonal in inch
const   pxperdeg = 52; // pixel per degree computed in calibration, this value is coming from MacBook Pro 13.3 screen

// 2. to get from URL or other method, PROLIFIC_PID, STUDY_ID and SESSION_ID to get from url, see get_subject_id variable – if not using it then change global variable ask_for_id to false

// ################################
// ### compute stim width in px ###
// ################################

const   distance_cm = 60; // screen/eyes distance in cm
const   monitor_width_px = window.outerWidth; // monitor width in px
const   monitor_height_px = window.outerHeight; // monitor height in px
const   monitorsize_cm = monitorsize * 2.54 // monitorsize inch to cm
const   stim_diag_cm = monitorsize_cm * 0.20 // stimulus diagonal in cm is 20% of monitorsize. 1. check that the stimulus is a square, otherwise change formulas below, 2. source said stimulus diagonal is between 15 to 30% of screen diagonal
const   stim_width_cm = stim_diag_cm / Math.sqrt(2); // stimulus width in cm
const   stim_width_rad = 2 * Math.atan((stim_width_cm / 2) / distance_cm); // stimulus width in radian
const   stim_width_deg = stim_width_rad * 180 / Math.PI; // stimulus width in degrees
const   stim_width_px = stim_width_deg * pxperdeg; // stim width in px from real monitor size in cm. Note : your screen pixel is not the same PHYSICAL size than your neighbour's pixel.
const   stim_diag_px = stim_width_px * Math.sqrt(2); // stimulus diagonal in px calculated for the participant's screen.

// ############################
// ### experiment variables ###
// ############################
// based on Denkinger Sylvie's 'TOVA_parameters_2023' excel sheet 

const   pres_time = 250; // stimulus presentation time in ms
const   soa = 4100; // duration in ms between the onset of two consecutive stimuli. Note : In the original ACE-X TOVA, they have a 2000ms response-window. To be alligned with them, when analysing data, be sure that responses after 2000ms are not counted and treated as anticipatory responses.
// const isi = soa - pres_time; // inter stimulus interval, NOT USE IN THE CODE
const   root_path = './'; // BACKEND TO MODIFY IF NEEDED
// const   root_path = 'https://s3.amazonaws.com/BavLab/TOVA/'; // BACKEND TO MODIFY IF NEEDED
const   tova_up = `
                    <div class='up' id='shape'><img src='${root_path}assets/img/shape.png' style='width:${stim_width_px}px'></img></div>
                    `; // id='shape' is mandatory, without it it won't work, see plugin-html-keyboard-response.js
const   tova_down = `
                    <div class='down' id='shape'><img src='${root_path}assets/img/shape.png' style='width:${stim_width_px}px'></img></div>
                    `; // id='shape' is mandatory, without it it won't work, see plugin-html-keyboard-response.js
const   fixation_cross = `
                            <div class='fixcross' id='cross'>+</div>
                            `; // to change its size, see 'assets/css/style.css'
const   practice_array = [0,1,1,0,1]; // 1 for go, 0 for no go
const   block_type = ['SA', 'IC']; // fixed order, sustained attention then inhibitory control. Note : those are the names under the column 'block', they are not used for functional code - only aesthetical
const   fixed_80_block_01_sa = [0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0]; // fixed 80 SA (20% go / 80% nogo) block was computed through this function : lines 510-550 from https://github.com/kennethrioja/bl_tova/commit/64cf61b942450fd5e397914d371c191e109310e6 - it can create infinite loops, my bad
const   fixed_40_block_02_ic = [1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,0,1,1,0,1,1,1,1,1,1]; // fixed 40 IC (80% go / 20% nogo) block was computed through this : lines 510-550 from https://github.com/kennethrioja/bl_tova/commit/2508d50e70703f6e706a744ed47b424fac08ff6e - it can create infinite loops, my bad
const   fixed_blocks_array = [fixed_80_block_01_sa, fixed_40_block_02_ic] // this is the  array on which the code is based
const   post_instructions_time = 2000; // time to wait after instruction to begin the trials

// #######################
// ### task monitoring ###
// #######################

const   show_fixcross_array = [true, false]; // manually set this here. true = show fixation cross. First one is for practice, second is for main task
const   feedback_color_array = [true, false]; // manually set this here. true = your fixation cross become green for correct answers or red for incorrect, for no-go trials the fixation cross becomes green 250ms before the end of the trial. First one is for practice, second is for main task
var     feedback_color = false; // true = changes fixation cross to green/red depending of correct/incorrect response at the end of each trial, see plugin-html-keyboard-response.js. This global variable will be updated (var not const) depending on feedback_color_array and is needed to communicate with plugin-html-keyboard-response.js.
const   ask_for_id = true; // manually set this here. true = displays a form asking for subject id, study id and session id. BACKEND : set to false when you can retreive the following variables, for example though the URL. The latter MUST CONTAIN '?PROLIFIC_PID=*&STUDY_ID=*&SESSION_ID=*' with '*' being the corresponding values to variables.
var     do_practice = true; // manually set this here. true = do practice, false = don't. BACKEND : can be a way to skip practice if problem during task, that's why it is 'var' and not 'const'.
var     repeat_practice = []; // array containing either 1 (= practice must be repeated), or 0 (= practice is not repeated). Relevent when do_practice = true, it stores whether the participant needs to repeat the practice or not. Rule : if 3 correct responses over 5 then pass, otherwise repeat and allow 2 repetitions then pass anyway. See repeat_prac_conditional to see ending loop.

// strings templates
function showHideDiv(hide, show) { // see review_str
    const srcShow = document.getElementById(show);
    const srcHide = document.getElementById(hide);
    if (srcShow != null) {
        if (srcShow.style.display == 'block') {
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
const   welcome_str = `
                    <p>Please enter in full screen mode, for Windows press 'F11', for MacOS press 'control' + 'command' + 'F' at the same time.</p>
                    <p>Click the button below to continue.</p>
                    `;
const   endblock_practice_str1 = `
                                <p>Well done !</p>
                                <p>% of correctly answering to TOP shape = 
                                `;
const   endblock_practice_str2 = `
                                %</p>
                                <p>% of correctly refraining answers to BOTTOM shape = 
                                `;
const   endblock_practice_str3 = `
                                %</p>
                                <p>Press the spacebar to continue.</p>
                                `;
const   endblock_practice_str4 = `
                                <p>You will go through another practice block. Please be as accurate as possible.</p>
                                <p>If the shape is presented at the TOP, please press the spacebar.</p>
                                <p>If the shape is presented at the BOTTOM, don’t press the spacebar.</p>
                                <p>Press the spacebar to continue.<p>
                                `;
const   review_str = `
                        <div id='review' style='display:block;'>
                        <p>You are ready for the task now.</p>
                        <p>Please press "Instructions" if you want a refresher, otherwise "Begin Task".</p>
                        <input type='button' value='Instructions' class='jspsych-btn' style="color:grey; background-color:#303030" onClick="showHideDiv('review', 'refresher')"/>
                        </div>
                        <div id='refresher' style='display:none;'>
                        <p>If the shape is presented at the TOP, please press the spacebar.</p>
                        <p>If the shape is presented at the BOTTOM, don’t press the spacebar.</p>
                        </div>
                        <br>
                        `;
const   endblock_str1 = `
                        <p>Well done !</p>
                        <p>% of correctly answering to TOP shape = 
                        `;
const   endblock_str2 = `
                        %</p>
                        <p>% of correctly refraining answers to BOTTOM shape = 
                        `;
const   endblock_str3 = `
                        %</p>
                        <p>Press the spacebar to start the next block.</p>
                        `;
const   endblock_str4 = `
                        %</p>
                        <p>Press the spacebar to complete the task.</p>
                        `;
// ending strings : see the end of the code to choose the one you want
const   completion_code_str =`
                            <br><br><br><br><br>
                            <p style='text-align:center'>This is the end of the task.<br><br>
                            Thank you for your participation.<br><br>
                            You can now go back to Prolific and enter the following completion code : <br><br>
                            <strong>XXXX</strong>
                            </p>
                            `;
const   inlab_final_str =`
                            <br><br><br><br><br>
                            <p style='text-align:center'>This is the end of the task.<br><br>
                            Thank you for your participation.<br><br>
                            You can call the experimenter.
                            </p>`;
const   classic_end_str =`
                            <br><br><br><br><br>
                            <p style='text-align:center'>This is the end of the task.<br><br>
                            Thank you for your participation.
                            </p>`;

// #####################################
// ### modifications in plugin files ###
// #####################################
// see comments '*MODIFIED*' in the plugin files

// 1) allow the recording of multiple responses during one trial
// https://github.com/jspsych/jsPsych/discussions/1302
// file : plugin-html-keyboard-response.js

// 2) if feedback_color = true, the CSS of the fixation cross changes to green or red depending on true or false response on go and no-go trials
// file : plugin-html-keyboard-response.js

// 3) for stimulus, I changed `default: undefined` to `default: ""` to avoid having a 'undefined' word at the end of a block
// file : plugin-html-keyboard-response.js

// 4) in final csv, creation of 'real_trial_index' column which is the trial_index for each block, 0 if not a real trial, begin by 1 if block
// file : jspsych.js

// 5) grey previous buttons in instructions
// file : plugin-instructions.js

// 6) when a response is given, the trial ends 2100ms after reponse. SOA(RT<2000ms) = RT + 2100ms, data.soa is changed in this file, see 'data.soa'
// file : plugin-html-keyboard-response.js

// ###################
// ### precautions ###
// ###################

// prevent ctrl+r or cmd+r : https://stackoverflow.com/questions/46882116/javascript-prevent-page-refresh-via-ctrl-and-r, https://stackoverflow.com/questions/3902635/how-does-one-capture-a-macs-command-key-via-javascript
$(document).ready(function () {
    $(document).on('keydown', function(e) {
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
window.onbeforeunload = function() { return `Your work will be lost.`; };

// ##########################
// ### initialize jsPsych ###
// ##########################

var jsPsych = initJsPsych();

var timeline = []; // create timeline

// input variables to get from url
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
        stimulus_diagonal_in_px: stim_diag_px,
        stimulus_diagonal_in_cm: stim_diag_cm
    });
} else { // otherwise if you asked for entring manually the IDs
    var pp_id = {
        type: jsPsychSurvey,
        pages: function () { // chooses which questions to ask depending on URL infos
            // creates objects
            const id_q = { type: 'text', prompt: `What is your Prolific PID ?`, name: 'survey_subject_id', required: true };
            const study_q = { type: 'text', prompt: `What is the Study ID ?`, name: 'survey_study_id', required: true };
            const session_q = { type: 'text', prompt: `What is the Session ID ?`, name: 'survey_session_id', required: true };
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
            get_study_id ?
                jsPsych.data.addProperties({ study_id: get_study_id })
                : jsPsych.data.addProperties({ study_id: data.response.survey_study_id });
            get_session_id ?
                jsPsych.data.addProperties({ session_id: get_session_id })
                : jsPsych.data.addProperties({ session_id: data.response.survey_session_id });
            jsPsych.data.addProperties({
                presentation_time: pres_time,
                soa: soa,
                monitorsize_inch: monitorsize,
                pxperdeg: pxperdeg,
                stimulus_diagonal_px: stim_diag_px,
                stimulus_diagonal_cm: stim_diag_cm
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


// ##############################
// ########## PRACTICE ##########
// ##############################

// ####################
// ### instructions ###
// ####################

var instructions = {
    type: jsPsychInstructions,
    pages: [
        // 1
        `This test measures your ability to pay attention.
        You will be presented with briefly flashed displays that contain a shape.`,
        // 2
        `If the shape is presented at the TOP, please <span class='highlight-green'>press the spacebar</span><br><br>
        <img src='assets/img/tova_up.png' width='800' heigth='auto'></img>`,
        // 3
        `If the shape is presented at the BOTTOM, <span class='highlight-red'>don’t press the spacebar</span><br><br>
        <img src='assets/img/tova_down.png' width='800' heigth='auto'></img>`,
        // 4
        `Don’t guess where the shape will flash, make sure you see it before you press the button.<br><br>
        Try to balance speed and accuracy : press the button as fast as you can, but also try not to make any mistakes.<br><br>
        If you do make a mistake, don’t worry : anyone can make a mistake on this test.`,
        // 5
        `Remember :<br><br>
        If the shape is presented at the TOP, please press the spacebar.<br>
        If the shape is presented at the BOTTOM, don’t press the spacebar.<br>
        Please be as fast and as accurate as possible.<br><br>
        Click the button "Next" to start the parctice.`
    ],
    show_clickable_nav: true,
    on_finish: function (data) { // change color to black, hides cursor and wait post_instructions_time ms before getting to the first block
        document.body.style.backgroundColor = '#000000';
        document.body.style.cursor = 'none'; // hides cursor during task
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, post_instructions_time);
    }
}
do_practice ? timeline.push(instructions) : null;  // ternary to say to do push this in the timeline if we want to go through the practice

// ##################################################################################
// ### practice : define stimuli + their inner variables and trial + its timeline ###
// ##################################################################################

var stimuli_practice = [
    { // represents 0 in practice_array
        stimulus: tova_down,
        stimulus_label: 'shapedown',
        position_is_top: 0,
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up,
        stimulus_label: 'shapeup',
        position_is_top: 1,
        condition: 'Go'
    }
];

var trial_practice = {
    type: jsPsychHtmlKeyboardResponse, // this records RT from the begining of the stim onset, see '../vendor/plugin-html-keyboard-response.js'
    stimulus: jsPsych.timelineVariable('stimulus'), // this will show the 'stimulus'
    choices: [' '], // this is the array of choices
    stimulus_duration: pres_time, // this is the stimulus presentation
    trial_duration: soa, // this is the soa
    response_ends_trial: false, // false means when a response is done, the trial is not stopping
    prompt: function () { // this show the fixation cross all along
        if (show_fixcross_array[0])
            return (fixation_cross);
    },
    data: {
        block: '', // will be modified at the begining of the block/timeline, see on_timeline_start
        condition: jsPsych.timelineVariable('condition'),
        position_is_top: jsPsych.timelineVariable('position_is_top'),
        effective_response: '', // will be modified at the end of each trial, see 'on_finish' below
    },
    on_finish: function (data) {
        // give to data.stimulus the right label
        data.stimulus = jsPsych.timelineVariable('stimulus_label');
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
        // compute correct
        data.correct = +(data.position_is_top == data.effective_response);
        // compute trial_accuracy (whether hit, fa, cr, miss)
        data.trial_accuracy = 
                                +(data.position_is_top && data.effective_response) == 1 ? "Hit" : // is hit ? true = "Hit" otherwise
                                +(!data.position_is_top && data.effective_response) == 1 ? "False Alarm" : // is fa ? true = "False Alarm" otherwise
                                +(!data.position_is_top && !data.effective_response) == 1 ? "Correct Rejection" : // is cr ? true = "False Alarm" otherwise
                                +(data.position_is_top && !data.effective_response) == 1 ? "Miss" : null; // is miss ? true = "Miss" otherwise null
        // modify soa value in data to RT + 2100ms. Note that this is only the value in your data, not what the code behind is currently doing, see plugin-html-keyboard-reponse.js for implementation
        if (jsPsych.data.get().last(1).values()[0].rt) {
            data.soa = +(jsPsych.data.get().last(1).values()[0].rt.split(',')[0]) + 2100;
        }
    }
};

var block_practice = {
    timeline_variables: stimuli_practice,
    timeline: [trial_practice], // needs to be an array
    on_timeline_start: function () {
        trial_practice.data.block = 'practice';
        feedback_color_array[0] ? feedback_color = true : feedback_color = false; // global variable that will be set for each block. True = colored fixation cross depending on correct/incorrect at the end of each trial, see plugin-html-keyboard-response.js. 
    },
    sample: {
        type: 'custom',
        fn: function () {
            return practice_array;
        }
    }
}

// #####################
// ### practice loop ###
// #####################

var repeat_prac_message = { // https://www.youtube.com/watch?v=LP7o0iAALik
    type: jsPsychHtmlKeyboardResponse,
    choices: [' '],
    stimulus: endblock_practice_str4,
    on_start: function () {
        document.body.style.backgroundColor = '#202020'; // back to grey
        document.body.style.cursor = 'auto'; // display cursor during instructions
    },
    on_finish: function () {
        document.body.style.backgroundColor = '#000000'; // back to black
        document.body.style.cursor = 'none'; // hide cursor during task
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, post_instructions_time);
    }
}
var repeat_prac_conditional = {
    timeline: [repeat_prac_message],
    conditional_function: function() {
        const trials_practice = jsPsych.data.get().filter({ block: 'practice' }).last(5); // get last 5 practice trials
        const n_correct_trials_practice = trials_practice.filter({ correct: 1 }).count(); // count only the true last 5 practice trials
        if (n_correct_trials_practice < 3 && repeat_practice.length < 2) {// if not more than 3 correct trials and we allow 2 repetitions , repeat_prac_conditional = true, meaning practice is repeated.
            repeat_practice.push(true);
            return true; 
        } else {
            repeat_practice.push(false);
            return false;
        }
    }
}

var prac_loop = {
    timeline: [block_practice, repeat_prac_conditional],
    loop_function: function(data) {
        if (repeat_practice[repeat_practice.length - 1] === true) { // if last practice is true, redo practice
            return true;
        } else {
            document.body.style.backgroundColor = '#202020'; // back to grey
            document.body.style.cursor = 'auto'; // display cursor during instructions
        
            const date = new Date();
            const month = date.getMonth() + 1 < 10 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1).toString();
            const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
            const final = jsPsych.data.get();
            // console.log(final.csv()); // can be removed
            // final.localSave('csv', final.trials[0].subject_id + '_blTova_practice_' + date.getFullYear() + month + day + '.csv'); // BACKEND : need to save this csv , otherwise uncomment for debugging

            jsPsych.pauseExperiment();
            setTimeout(jsPsych.resumeExperiment, post_instructions_time);

            return false;
        }
    }
}
do_practice ? timeline.push(prac_loop) : null;

// ###############################
// ########## MAIN TASK ##########
// ###############################

var review_fullscreenOn = { // fullscreen mode
    type: jsPsychFullscreen,
    message: review_str,
    fullscreen_mode: true,
    button_label: 'Begin Task',
    on_finish: function(data){ // change color to black and cursor and wait post_instructions_time ms before getting to the first block
        document.body.style.backgroundColor = '#000000'; // back to black
        document.body.style.cursor = 'none'; // hide cursor during task
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, post_instructions_time);
        do_practice = false; // BACKEND should find a way to update 'do_practice' at this point, so that when a participant refreshes the window, he/she comes directly here – since the data is save before !
    }
};
timeline.push(review_fullscreenOn);

// ########################################################################
// ### define stimuli + their inner variables and trial + its procedure ###
// ########################################################################

var stimuli = [
    { // represents 0 in practice_array
        stimulus: tova_down,
        stimulus_label: 'shapedown',
        position_is_top: 0,
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up,
        stimulus_label: 'shapeup',
        position_is_top: 1,
        condition: 'Go'
    }
];
var trial = {
    type: jsPsychHtmlKeyboardResponse, // this records RT from the begining of the stim onset, see '../vendor/plugin-html-keyboard-response.js'
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
        position_is_top: jsPsych.timelineVariable('position_is_top'),
        effective_response: '', // is modified at the end of each trial, see 'on_finish' below
    },
    on_finish: function (data) {
        // give to data.stimulus the right label
        data.stimulus = jsPsych.timelineVariable('stimulus_label');
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
        // compute correct
        data.correct = +(data.position_is_top == data.effective_response);
        // compute trial_accuracy (whether hit, fa, cr, miss)
        data.trial_accuracy = 
                                +(data.position_is_top && data.effective_response) == 1 ? "Hit" : // is hit ? true = "Hit" otherwise
                                +(!data.position_is_top && data.effective_response) == 1 ? "False Alarm" : // is fa ? true = "False Alarm" otherwise
                                +(!data.position_is_top && !data.effective_response) == 1 ? "Correct Rejection" : // is cr ? true = "False Alarm" otherwise
                                +(data.position_is_top && !data.effective_response) == 1 ? "Miss" : null; // is miss ? true = "Miss" otherwise null
        // modify soa value in data to RT + 2100ms. Note that this is only the value in your data, not what the code behind is currently doing, see plugin-html-keyboard-reponse.js for implementation
        if (jsPsych.data.get().last(1).values()[0].rt) {
            data.soa = +(jsPsych.data.get().last(1).values()[0].rt.split(',')[0]) + 2100;
        }
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
                return fixed_blocks_array[i];
                // return [0,1,1,0]; // for debugging
            }
        },
    }
    timeline.push(block);

    // debrief block
    var debrief_block = {
        type: jsPsychHtmlKeyboardResponse,
        choices: [' '],
        prompt: function () {
            const trials = jsPsych.data.get().filter({ block: block_type[i] });
            const go_trials = trials.filter({ condition: 'Go' });
            const nogo_trials = trials.filter({ condition: 'NoGo' });
            const correct_trials = trials.filter({ correct: 1 });
            const correct_go_trials = correct_trials.filter({ condition: 'Go' });
            const correct_nogo_trials = correct_trials.filter({ condition: 'NoGo' });
            const go_accuracy = Math.round(correct_go_trials.count() / go_trials.count() * 100);
            const nogo_accuracy = Math.round(correct_nogo_trials.count() / nogo_trials.count() * 100);
            const correct_go_rt = Math.round(correct_go_trials.select('rt').mean());
            if (i === fixed_blocks_array.length - 1) {
                return `${endblock_str1}${go_accuracy}${endblock_str2}${nogo_accuracy}${endblock_str4}`;
            }
            return `${endblock_str1}${go_accuracy}${endblock_str2}${nogo_accuracy}${endblock_str3}`;
        },
        on_start: function() {
            document.body.style.backgroundColor = '#202020'; // back to grey
            document.body.style.cursor = 'auto'; // display cursor during instructions
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
        // document.body.innerHTML = inlab_final_str;  // enable when doing this inlab
        document.body.innerHTML = classic_end_str // enable when you just want to say thank you
        // BACKEND - WHAT DO YOU WANT TO BE DISPLAYED AT THE END OF THE TASK ?

        const date = new Date();
        const month = date.getMonth() + 1 < 10 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1).toString();
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
        const final = jsPsych.data.get();
        // console.log(final.csv());
        final.localSave('csv', data.subject_id + '_blTova_task_' + date.getFullYear() + month + day + '.csv'); // BACKEND MUST SAVE FINAL.CSV() AT THIS POINT
        
        window.onbeforeunload = null; // disable the prevention
    }
});

jsPsych.run(timeline); 