[![DOI](https://sandbox.zenodo.org/badge/633319443.svg)](https://sandbox.zenodo.org/badge/latestdoi/633319443)

<p align="center">
  <a href="https://youtu.be/IyfIl-8L1DI?feature=shared"><img src="https://img.youtube.com/vi/IyfIl-8L1DI/0.jpg"></a>
</p>

# Methods

When using this task, you can copy-paste this in your Methods' section of your manuscript :

> The Bavelierlab adapted ACE-X Test of Variables of Attention (TOVA)-like task (Rioja & Denkinger, 2023) is a Go/No-Go task. During the task, one single shape is briefly flashed to the participants. Participants are asked to press the spacebar whenever the shape is flashing at the top of the screen (Go trial) and to refrain from pressing space bar whenever the shape is flashing at the bottom of the screen (No-Go trial). The size of the shape is set at 20% of the monitor's diagonal, therefore px and cm/inch size should vary depending on a) the monitor's size and b) the pixel per degree of the actual monitor. Duration of the flashed shape (presentation time) is set at 250 ms. SOA is defined by default at 4100ms, for trials with reaction times (RT) strictly inferior than 2000 ms, SOA is set at : RT + 2100 ms. Participants are first invited to go through a practice block following this sequence of five trials : "no-go, go, go, no-go, go". The rule to pass the practice session is to have at least 3 correct trials and participants should have 3 practice blocks maximum. After the practice session, two consecutive blocks are shown with a pause/recap in between each block. A first 'Sustained Attention' (SA) block displays 80 trials (20% of go trials, 80% of no-go trials) followed by a second 'Inhibition Control' (IC) block made of 40 trials (80% of go trials, 20% of no-go trials). Reaction time and trial accuracy (correct rejection, miss, false alarm, hit) are saved throughout the task.

# Demo video

Click [here](https://youtu.be/IyfIl-8L1DI?feature=shared) to see the task working.

# How to use it

Clone this repo or download the zip (+ unzip it).

Change the global variables in `./assets/js/bl_tova.js` at your convenience, e.g. if you want to change the order of the blocks and inside one block, see `fixed_blocks_array`.

This version of the TOVA can work on its own, but it is preferable that you include a calibration before

# Data dictionary

Click [here](/assets/refs/datadictionnary_bltova.txt) to view the description of the collected variables.

# Citation 

## APA : 

```
Rioja, K., & Denkinger, S. (2023). Bavelierlab adapted ACE-X Test of Variables of Attention (Version 1.0) [Computer software]. https://doi.org/10.5072/zenodo.1234569
```

## BibTeX :

```
@software{Rioja_Bavelierlab_adapted_ACE-X_2023,
author = {Rioja, Kenneth and Denkinger, Sylvie},
doi = {10.5072/zenodo.1234569},
month = aug,
title = {{Bavelierlab adapted ACE-X Test of Variables of Attention}},
url = {https://github.com/kennethrioja/bl_tova/tree/v1.0},
version = {1.0},
year = {2023}
}
```

# References

de Leeuw, J.R. (2015). jsPsych: A JavaScript library for creating behavioral experiments in a Web browser. Behavior Research Methods, 47(1), 1-12. [doi:10.3758/s13428-014-0458-y](https://doi.org/10.3758/s13428-014-0458-y)
