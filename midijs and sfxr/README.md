### MIDIjs
MIDIjs uses code provided at https://www.midijs.net/ to play midi files. Just give it your midi resources and you only need to use the following line of code:
this.entity.script.midiPlayer.play(0); //0 is the index of the midi file

of course this has to be attached to same entity as the one that has midiPlayer script

### SFXR
Provides tools to create sound effects generated on the fly. Use the HTML file to generate the audio, copy the sfx string and paste it to the sxfrPlayer. Then you can play it with one line of code:

this.entity.script.sfxrPlayer.play(0); //0 is the index of the sfx data


Code I used from https://github.com/humphd/sfxr.js and then switch to https://github.com/MaulingMonkey/sfxr.js for fixes
