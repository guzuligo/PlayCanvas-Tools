# PlayCanvas-Tools

## Animation Tools
(No coding required)
As playCanvas creates one animation per fbx file, AnimationSplitter can split that animation to several animations based on time and each animation could be used separately.
The animations will be available on your animation component and can be accessed using play(animationName).

## Touch Controller
See it in action here https://playcanv.as/p/vMHtGxZc/
It provides touch controller on screen for mobile devices. Use following tutorial to set it up
https://playcanvas.com/project/706071/overview/touch-game-pad-tool

## MIDIjs and SFXR

### MIDIjs
MIDIjs uses code provided at https://www.midijs.net/ to play midi files. Just give it your midi resources and you only need to use the following line of code:
this.entity.script.midiPlayer.play(0); //0 is the index of the midi file

of course this has to be attached to same entity as the one that has midiPlayer script

### SFXR
Provides tools to create sound effects generated on the fly. Use the HTML file to generate the audio, copy the sfx string and paste it to the sxfrPlayer. Then you can ply it with one line of code:
this.entity.script.sfxrPlayer.play(0); //0 is the index of the sfx data
Code I used from https://github.com/humphd/sfxr.js
