//requires https://github.com/humphd/sfxr.js/blob/master/sfxr.js
//You can download the "sfxr Generator.html" to make sounds
var SfxrPlayer = pc.createScript('sfxrPlayer');
SfxrPlayer.staticVars={
    //https://www.jsdelivr.com/rawgit with https://rawgit.com/humphd/sfxr.js/gh-pages/sfxr.js
    resourceFile:"https://cdn.jsdelivr.net/gh/humphd/sfxr.js@master/sfxr.js",
    //resourceFile:pc.app.assets.find("sfxr.js").getFileUrl(),//use this if you prefer
    engine:null,synth:null
};
SfxrPlayer.prototype.audio=[];//src strings for audioPlay to read
SfxrPlayer.prototype.audioPlayer=null;//new Audio file
SfxrPlayer.prototype.audioReady=[];//Array indicating which audio is ready
SfxrPlayer.attributes.add("init_",{type:"number",default:2,title:"Initialization",enum:[
    {"None":0},{"Load required scripts":1},{"Load scripts and SFX":2}
                                  ]});
SfxrPlayer.attributes.add("volume",{type:"number",title:"Volume",min:0,max:1,default:1});
SfxrPlayer.attributes.add("sfxrString",{type:"string",title:"SFXR strings",array:true});
// initialize code called once per entity
SfxrPlayer.prototype.initialize = function() {
    if (this.init_)
        this.init();
    if (this.init_>1)
        this.generate(-1);
    this.audioPlayer=new Audio();
    this.on("attr:volume",()=>{this.audioPlayer.volume=this.volume;},this);
};
/*
 * Generates all sfx. Returns true if both script and sfx are ready
 * @param {number} id The index of the sound in the SFXR string array
 * @param {string} data You can use this to replace an existing sound
 */ 
SfxrPlayer.prototype.generate=function(id,data,_callback){
    if (id===undefined)id=-1;
    //make sure the engine is loaded
    if (id!=-1 && this.audio[id])return true;
    if (!SfxrPlayer.staticVars.engine || !SfxrPlayer.staticVars.engine.loaded){
        console.warn("SFXR script not ready");
        this.init(()=>{this.generate(id,null,_callback);});
        return false;
    }
    if (id==-1){
        var ready_=true;
        while(++id<this.sfxrString.length)ready_= this.generate(id) && ready_;
        return ready_;
    }
    
    var synth=SfxrPlayer.staticVars.synth;
    if (data)this.sfxrString[id]=data;
    if(!this.sfxrString[id])return;
    synth.setSettingsString(this.sfxrString[id]);
    this.audio[id]=synth.getWaveURI();
    this.audioReady[id]=true;
    if (_callback)_callback(id);
    return true;
};
/*
 * Plays the sfx. If script is not loaded or audio not generated, it will load them and fail silently
 * @param {number} id The index of the sound in the SFXR string array
 * @param {number} mutate
 * @param {Audio} audio_ If specified, that audio will be used to play the sfx. Otherwise, internal one will be used.
 */ 
SfxrPlayer.prototype.play=function(id,mutate,audio_){
    if (!id)id=0;
    if (id<0 || !this.audioReady || !this.audioReady[id]){this.generate(id,null,id<0?null:(id_)=>{this.play(id_);});return;}
    if (!audio_)audio_=this.audioPlayer;this.audioPlayer.volume=this.volume;
    audio_.src=!mutate?this.audio[id]:this.getMutated(id,mutate);
    audio_.play();  
};

SfxrPlayer.prototype.getMutated=function(id,mutate){
    var synth=SfxrPlayer.staticVars.synth;
    synth.setSettingsString(this.sfxrString[id]);
    sfxr.mutate(synth);
    return synth.getWaveURI();
};

/*
 * Initialize the sfxr script. Optionally, callback function can be provided
 * @param {Function} _callback
 */ 
SfxrPlayer.prototype.init = function(_callback){
    if (SfxrPlayer.staticVars.engine && SfxrPlayer.staticVars.engine.loaded)return _callback();
    var firstCall=true;
    if (!SfxrPlayer.staticVars.engine)//prepare engine if it is not ready
        SfxrPlayer.staticVars.engine = new pc.Asset("sfxrPlayer", "script", {
            url: SfxrPlayer.staticVars.resourceFile
        });
    else firstCall=false;
    
    if (firstCall){
        if (!SfxrPlayer.staticVars.engine.loaded){
            SfxrPlayer.staticVars.engine.once("load",()=>{
                //console.log("Engine Finished Loading") ;
                SfxrPlayer.staticVars.synth=new sfxr.Synth();
            });
            pc.app.assets.load(SfxrPlayer.staticVars.engine);
        }else
            SfxrPlayer.staticVars.synth=new sfxr.Synth();
    }
    if (_callback)
        SfxrPlayer.staticVars.engine.once("load",()=>{_callback();});
};