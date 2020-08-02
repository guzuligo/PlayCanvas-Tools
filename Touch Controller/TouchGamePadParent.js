//By guzuligo at gmail dot com
//Version 1.0.0
var TouchGamePadParent=pc.createScript('touchGamePadParent');
TouchGamePadParent.prototype.initialize =function(){
    this._init();
};

TouchGamePadParent.prototype._isinit=false;
TouchGamePadParent.prototype._init= function() {
    if (this.pads===null)this.pads={};
    if (!this._isinit)this._isinit=true;else {console.log("Already initialized");return false;}
    
    if(this._enMouse)this._initMouse();
    if(this._enTouch)this._initTouches();
    
    this.on("attr:_enTouch",this._initTouches,this);
    this.on("attr:_enMouse",this._initMouse,this);
    return true;
    //this.entity
};
TouchGamePadParent.prototype._initTouches=function(){
    //console.log("FIRE",pc.app.touch);
    if (!this.app.touch)return false;
    var p=this.entity.script.touchGamePadParent.gamePads;
    //START
    //
    var start_=(e)=>{
        if (!this.enabled)return;
        var i,j=-1;
        while(++j<e.changedTouches.length){i=-1;
            while(++i<p.length)if(p[i].enabled)if (p[i].script.touchGamePad.use(e.changedTouches[j]))break;
        }
        e.event.preventDefault();
    };


    //END
    var end_=(e)=>{
        //Allow cleanup even when disabled
        //eeee.e=p;
        var i,j=-1;
        while(++j<e.changedTouches.length){i=-1;
            while(++i<p.length)if (p[i].script.touchGamePad.end(e.changedTouches[j]))break;
        } 

        if (this.enabled)e.event.preventDefault();
    };


    //MOVE

    var move_=(e)=>{
        //eeee.e=p;
        if (!this.enabled)return;
        var i,j=-1;
        while(++j<e.changedTouches.length){i=-1;
            while(++i<p.length)if (p[i].script.touchGamePad.move(e.changedTouches[j]))break;
        }
        e.event.preventDefault();
    };
    
    var destroy_=()=>{
        //console.log("destroied");
        this.app.touch.off(pc.EVENT_TOUCHSTART,start_); 
        this.app.touch.off(pc.EVENT_TOUCHMOVE,move_);
        this.app.touch.off(pc.EVENT_TOUCHEND,end_);
        this.app.touch.off(pc.EVENT_TOUCHCANCEL,end_);
    };
    
    //cleanup first
    this.fire("destroyTouches");//destroy_();
    if (!this._enTouch)return true;
    
    this.app.touch.on (pc.EVENT_TOUCHSTART,start_);
    this.app.touch.on (pc.EVENT_TOUCHEND,end_);
    this.app.touch.on (pc.EVENT_TOUCHCANCEL,end_);
    this.app.touch.on (pc.EVENT_TOUCHMOVE,move_);

    //cleanup
    this.once("destroyTouches",destroy_); 
    this.once("destroy",()=>{this.fire("destroyTouches");});
    return true;
};


TouchGamePadParent.prototype._destMouse=null;

TouchGamePadParent.prototype._initMouse=function(){
    //if (!this.app.mouse)return false;
    var p=this.entity.script.touchGamePadParent.gamePads;
    if (this._destMouse) this._destMouse();//cleanup first
    var start_=(e)=>{
        //console.log(e,this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT));
        var i;e.id=-2;
        i=-1;while(++i<p.length)if(p[i].enabled)
            if (p[i].script.touchGamePad.use(e))break;
       
    };
    
    var move_=(e)=>{
        if (!this.enabled)return;
        var i;e.id=-2;
        i=-1;while(++i<p.length)if (p[i].script.touchGamePad.move(e))break;
        
    };
    
    var end_=(e)=>{
        if (!this.enabled)return;
        var i;e.id=-2;
        i=-1;while(++i<p.length)if (p[i].script.touchGamePad.end(e))break;
    };
    
    this._destMouse=()=>{
        pc.app.mouse.off(pc.EVENT_MOUSEDOWN,start_,this);
        pc.app.mouse.off(pc.EVENT_MOUSEMOVE,move_,this);
        pc.app.mouse.off(pc.EVENT_MOUSEUP,end_,this);
    };
    //this._destMouse();
    //console.log("DD",this._enMouse);
    if (!this._enMouse)return;
    if (this._enMouse==1 && pc.app.touch && this._enTouch)return;
    pc.app.mouse.on (pc.EVENT_MOUSEDOWN,start_,this);
    pc.app.mouse.on (pc.EVENT_MOUSEMOVE,move_,this);
    pc.app.mouse.on (pc.EVENT_MOUSEUP,end_,this);
    this.once("destroy",this._destMouse);
};
// update code called every frame
TouchGamePadParent.prototype.update = function(dt) {
    //var i=-1;while(++i<this.entity.script.touchGamePadParent.gamePads.length)console.log(i);
};


TouchGamePadParent.prototype.pads=null;

TouchGamePadParent.prototype.push=function(pad,prior_){
    //console.log(pad.Type);
    this.pads[pad.entity.name]=pad;
    if(prior_)
        this.gamePads.unshift(pad.entity);
    else
        this.gamePads.push(pad.entity);
    
};

TouchGamePadParent.attributes.add("_enTouch",{
    title:"Enable Touch",
    type:"boolean",
    default:true,description:
    'Use touch events.'
});

TouchGamePadParent.attributes.add("_enMouse",{
    title:"Enable Mouse",
    type:"number",
    default:1,description:
    'Use mouse events.',enum:[
        {"Disabled":0},{"Enabled":2},{"Fallback":1}
    ]
});

TouchGamePadParent.attributes.add("gamePads",{
    title:"Game Pads",
    type:"entity",
    array:true
    
});

// swap method called for script hot-reloading
// inherit your script state here
// TouchGamePadParent.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/