// Author : kenneth.rioja@unige.ch
// Date : 20.04.2023
// https://www.jspsych.org/7.0/tutorials/rt-task/#part-11-tagging-trials-with-additional-data

// variables to modify

// experiment variables // CHECK SYLVIE'S VARIABLES
var n_trials = 10; // number of trials
var p_go = 0.66; // percentage of go trials
var p_nogo = 1 - p_go; // percentage of nogo trials
var trial_dur_cross = 1000; // trial duration of fixation cross
// var stimulus_img = //
// var isi = //

// square width
// var o_w = window.outerWidth;
// var o_h = window.outerHeight;
// var d = Math.sqrt(o_w * o_w + o_h * o_h);
var stim_width = 100; // in px

// strings
var welcome_str = `Welcome to the experiment. Press the space bar to begin`
var instructions1_str = `
<p>This test measures your ability to pay attention. You will be presented with briefly flashed displays that contain a square :</p>
<div class="row">
    <div class="column">
        <p>If the square is presented at the TOP, please <span class="highlight-green">press the spacebar</span></p>
        <img src='assets/img/TOVA_up.png'></img>
    </div>
    <div class="column">
        <p>If the square is presented at the BOTTOM, <span class="highlight-red">don’t press the spacebar</span></p>
        <img src='assets/img/TOVA_down.png'></img>
    </div>
</div>
<p> Don’t guess where the square will flash, make sure you see it before you press the button. Try to balance speed and accuracy : press the button as fast as you can, but also try not to make any mistakes. If you do make a mistake, don’t worry : anyone can make a mistake on this test.
<p>Press the space bar to continue.</p>
`;
var instructions2_str = `
<p>Let’s review :</p>
<p>• Press the spacebar as fast as you can, but only when you see the small square presented at the top.<br>
• When you press the spacebar, only press it once and don’t hold it down.<br>
• Finally, don’t go too fast or try to guess; take enough time to see where the square is really presented.</p>
<p>You are about to take a short practice test.  You are going to see a dot appear in the middle of the screen - please fixate there. After a countdown (3...2...1...),  the first square will flash on the screen. Remember, the whole idea is to be as fast AND accurate as you can be.</p>
<p>Press the space bar to begin.</p>
`;
var tova_up = `<div class="up"><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>
<div class="centered">+</div>`;
var tova_down = `<div class="centered">+</div>
<div class="down"><img src='assets/img/square.png' style="width:${stim_width}px"></img></div>`;

// initialize jsPsych
// var jsPsych = initJsPsych();
var jsPsych = initJsPsych({ // while dev use this
    on_finish: function () {
        jsPsych.data.displayData('csv');
    }
});

// create timeline
var timeline = [];

// 5. preload the images
var preload = {
    type: jsPsychPreload,
    images: ['assets/img/square.png', // path from html
        'assets/img/TOVA_up.png',
        'assets/img/TOVA_down.png']
};
timeline.push(preload); // timeline = [preload]

// 2. display welcome message
var welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: welcome_str,
    choices: [' ']
};
timeline.push(welcome); // timeline = [preload, welcome]

// 3. instructions
var instructions1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions1_str,
    choices: [' '],
    post_trial_gap: 100
};
var instructions2 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions2_str,
    choices: [' '],
    post_trial_gap: 100
};
timeline.push(instructions1, instructions2); // timeline = [preload, welcome, instructions1, instructions2]

// 6. timeline variables
// https://sources.univ-jfc.fr/aobert/SART_jsPsych/-/blob/5b17d65170876e92db918e82b59c4af2820d587a/experiment_v1.6.html
var test_stimuli = [
    {
        stimulus: tova_up,
        correct_response: ' ',
        condition: 'Go'
    },
    {
        stimulus: tova_down,
        correct_response: 'null',
        condition: 'NoGo'
    }
];
// define fixation and test trials
var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class="centered">+</div>',
    choices: "NO_KEYS",
    trial_duration: trial_dur_cross,
    data: {
        task: 'fixation'
    }
};
var test = {
    // type: jsPsychImageKeyboardResponse,
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
}
// define test procedure
var test_procedure = {
    timeline: [fixation, test],
    timeline_variables: test_stimuli,
    sample: {
        type: 'custom',
        fn: function () { // create random array of 0 and 1 regarding the p_go and p_nogo          
            var n_gotrials = Math.round(n_trials * p_go);
            var n_nogotrials = Math.round(n_trials * p_nogo);
            var arr = [];
            while (arr.length < n_trials) {
                var rdm = Math.round(Math.random());
                if (rdm == 0 && n_gotrials > 0) {
                    arr.push(rdm);
                    n_gotrials--;
                } else if (arr[arr.length - 1] == 0 && rdm == 1 && n_nogotrials > 0) {
                    arr.push(rdm);
                    n_nogotrials--;
                }
            }
            return arr;
        }
    },
}
timeline.push(test_procedure); // timeline = [preload, welcome, instructions1, instructions2, test_procedure]

// 7. debrief block
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

    }
};
timeline.push(debrief_block); // timeline = [preload, welcome, instructions1, instructions2, test_procedure, debrief_block]

jsPsych.run(timeline); 