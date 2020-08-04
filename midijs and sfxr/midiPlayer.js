//For questions, refer to guzuligo at gmail dot com
//Version 1.0.1
var MidiPlayer = pc.createScript('midiPlayer');
MidiPlayer.staticVars={
    resourceFile:"https://www.midijs.net/lib/midi.js",
    //resourceFile:this.app.assets.find("midi.js").getFileUrl(),//use this if you prefer
    engine:null,synth:null
};
MidiPlayer.attributes.add("loop",{type:"boolean",title:"Looping",default:true});
MidiPlayer.attributes.add("midiAssets",{type:"asset",array:true,title:"Midi Assets"});

// initialize code called once per entity
MidiPlayer.prototype.initialize = function() {
    this.once('destroy',()=>{
        if(this.isPlaying)this.stop();
    });
    this.on('state',(enable)=>{
        return enable?this.resume():this.pause();
    });
};

MidiPlayer.prototype.id=-1;
MidiPlayer.prototype.time=-1;
MidiPlayer.prototype.duration=99999;
MidiPlayer.prototype.isPlaying=false;
MidiPlayer.prototype.isPaused=false;
// update code called every frame
MidiPlayer.prototype.update = function(dt) {
    
};
MidiPlayer.prototype.stop=function(){
    MIDIjs.stop();this.isPlaying=this.isPaused=false;
};

MidiPlayer.prototype.pause=function(){
    if(this.isPlaying)this.isPaused=true;
    this.isPlaying=false;
    MIDIjs.pause();
};
MidiPlayer.prototype.resume=function(){
    if (this.isPaused)this.isPaused=false;else return;
    MIDIjs.resume();this.isPlaying=true;
};

MidiPlayer.prototype.play=function(id){
    if (!id && id!==0)id=this.id;
    this.id=id;this.time=-1;
    if(!MidiPlayer.staticVars.engine || !MidiPlayer.staticVars.engine.loaded){
        this.init(()=>{this.play(id);});
        return false;
    }
           
    if (this.isPlaying)MIDIjs.stop();
    if (id==-1)return;
    //make sure the assets are loaded
    if(this.midiAssets[id].loaded===false){
        this.midiAssets[id].once("load",()=>{
            this.play(id);
            MIDIjs.get_duration(this.midiAssets[id].getFileUrl(),(e)=>{this.duration=e;});
        });
        this.app.assets.load(this.midiAssets[id]);
        return false;
    }
    
    MIDIjs.play(this.midiAssets[id].getFileUrl());
    this.isPlaying=true;this.isPaused=false;
    return true;
};

MidiPlayer.prototype.init=function(_callback){
    if (!_callback)_callback=()=>{};
    if(MidiPlayer.staticVars.engine && MidiPlayer.staticVars.engine.loaded)return _callback();
    var firstCall=true;
    if(!MidiPlayer.staticVars.engine){
        MidiPlayer.staticVars.engine = new pc.Asset("midijstools", "script", {
            url: MidiPlayer.staticVars.resourceFile
        });
        MidiPlayer.staticVars.engine.once("load",()=>{
            MIDIjs.player_callback=(e)=>{this.timeUpdate(e.time);};
        });
    }else firstCall=false;
    MidiPlayer.staticVars.engine.once("load",()=>{_callback();});
    if(firstCall)
        this.app.assets.load(MidiPlayer.staticVars.engine);
    
    return false;
};

MidiPlayer.prototype.timeUpdate=function(e){
    this.time=e;
    //console.log(e);
    if (e>this.duration)
        if(this.loop)
            this.play(this.id);
        else
            {MIDIjs.stop();this.isPlaying=false;}
};



// MIDIjs.player_callback=console.log
// MIDIjs.get_duration(this.app.assets.get(33426164).getFileUrl(),console.log);
