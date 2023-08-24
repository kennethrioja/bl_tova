[![DOI](https://sandbox.zenodo.org/badge/633319443.svg)](https://sandbox.zenodo.org/badge/latestdoi/633319443)

# Methods

The Bavelierlab adapted ACE-X Test of Variables of Attention (TOVA)-like task (Rioja & Denkinger, 2023) is a Go/No-Go task. During the task, one single shape is briefly flashed to the participants. Its size is set at 20% of the monitor's diagonal therefore px and cm/inch size should vary depending on a) the monitor's size and b) the pixel per degree of the actual monitor. Its position is either on the top or on the bottom of the screen. The participants are asked to press the spacebar whenever the shape is flashing at the top of the screen (Go trial) and to refrain from pressing space bar whenever the shape is flashing at the bottom of the screen (No-Go trial). The duration of the flashed shape (presentation time) is set at 250 ms. SOA is defined by default at 4100ms, for responded trials with reaction times (RT) strictly inferior than 2000 ms, SOA is set at : RT + 2100 ms. Participants are first invited to go through a practice block. The latter is made of five trials of the following sequence "no-go, go, go, no-go, go". The rule to pass the practice session is to have at least 3 correct trials and participants should have 3 practice blocks maximum. Once the practice session is done, two consecutive blocks is shown with a pause/recap in between : a 'Sustained Attention' (SA) block made of 80 trials (20% of go trials, 80% of no-go trials) followed by an 'Inhibition Control' (IC) block made of 40 trials (80% of go trials, 20% of no-go trials).

# Demo video

Click on the image below redirecting you to a youtube video of the TOVA

[![bl tova](https://img.youtube.com/vi/IyfIl-8L1DI/0.jpg)](https://youtu.be/IyfIl-8L1DI?feature=shared)

# Citation 

Copy it directly on the right handside of this page, under 'Citation'.

# How to use it

Clone this repo or download the zip (+ unzip it).

Change the global variables in `./assets/js/bl_tova.js` at your convenience, e.g. if you want to change the order of the blocks and inside one block, see `fixed_blocks_array`.

# Data dictionary

See https://github.com/kennethrioja/bl_tova/blob/main/assets/refs/datadictionnary_bltova.txt

# References

de Leeuw, J.R. (2015). jsPsych: A JavaScript library for creating behavioral experiments in a Web browser. Behavior Research Methods, 47(1), 1-12. doi:10.3758/s13428-014-0458-y
