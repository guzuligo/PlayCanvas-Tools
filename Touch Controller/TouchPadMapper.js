//By guzuligo at gmail dot com
//Version 0.3.1 added:shift prevents mouse lock
var TouchPadMapper = pc.createScript('touchPadMapper');
var isp_;//isPressed
var app=pc.Application.getApplication();


//TouchPadMapper
(()=>{
    TouchPadMapper.staticVars={keyNames:[{"NONE":"NONE"}]};
    for (var i in pc)if(i.substr(0,3)==="KEY"){
        var k={};k[i]=i;
        TouchPadMapper.staticVars.keyNames.push(k);
    }
    TouchPadMapper.attributes.add("pad",{type:"entity",title:"Source Pad",description:
    "The entity that holds the TouchGamePad script which is used to copy direction. Make sure 'one hot' is enabled on it."});

    TouchPadMapper.attributes.add("left",{type:"string",title:"Left Key",enum:TouchPadMapper.staticVars.keyNames,default:"KEY_LEFT",
     description:"Use isPressed('left') or horizontal<0 to check if it is pressed"});
    TouchPadMapper.attributes.add("right",{type:"string",title:"Right Key",enum:TouchPadMapper.staticVars.keyNames,default:"KEY_RIGHT",
     description:"Use isPressed('right')  or horizontal>0 to check if it is pressed"});
    TouchPadMapper.attributes.add("up",{type:"string",title:"Up Key",enum:TouchPadMapper.staticVars.keyNames,default:"KEY_UP",
     description:"Use isPressed('up') or vertical>0 to check if it is pressed"});
    TouchPadMapper.attributes.add("down",{type:"string",title:"Down Key",enum:TouchPadMapper.staticVars.keyNames,default:"KEY_DOWN",
     description:"Use isPressed('down')  or vertical<0 to check if it is pressed"});
    
    
    TouchPadMapper.attributes.add("left2",{type:"string",title:"Left Key2",enum:TouchPadMapper.staticVars.keyNames,default:"KEY_A",
     description:"Alternative key. Use isPressed('left') or horizontal<0 to check if it is pressed"});
    TouchPadMapper.attributes.add("right2",{type:"string",title:"Right Key2",enum:TouchPadMapper.staticVars.keyNames,default:"KEY_D",
     description:"Alternative key. Use isPressed('right')  or horizontal>0 to check if it is pressed"});
    TouchPadMapper.attributes.add("up2",{type:"string",title:"Up Key2",enum:TouchPadMapper.staticVars.keyNames,default:"KEY_W",
     description:"Alternative key. Use isPressed('up') or vertical>0 to check if it is pressed"});
    TouchPadMapper.attributes.add("down2",{type:"string",title:"Down Key2",enum:TouchPadMapper.staticVars.keyNames,default:"KEY_S",
     description:"Alternative key. Use isPressed('down')  or vertical<0 to check if it is pressed"});
    
    //TouchPadMapper.attributes.add("dir",{type:"entity",title:"Pad "});
    // initialize code called once per entity
    TouchPadMapper.prototype.initialize = function() {

    };
    
    isp_=TouchPadMapper.prototype.isp_=e=>{
        if(e==="" || e==="NONE")return false;
        return app.keyboard.isPressed(pc[e]);
    };
    TouchPadMapper.prototype.keys={left:0,right:0,up:0,down:0};//to check isPressed and wasPressed
    // update code called every frame
    TouchPadMapper.prototype.update = function(dt) {
        var pad;
        if (this.pad && this.pad.enabled)pad=this.pad.script.touchGamePad;
        this.horizontal=isp_(this.right)||isp_(this.right2)?1:isp_(this.left)||isp_(this.left2)?-1:0;
        this.vertical=isp_(this.up)||isp_(this.up2)?1:isp_(this.down)||isp_(this.down2)?-1:0;


        if (pad){
            var d=pad.get();
            this.horizontal=this.horizontal || d.x;
            this.vertical=this.vertical || d.y;
        }

        this.keys.left=this._checkToggle(this.keys.left,this.horizontal<0);
        this.keys.right=this._checkToggle(this.keys.right,this.horizontal>0);
        this.keys.up=this._checkToggle(this.keys.up,this.vertical>0);
        this.keys.down=this._checkToggle(this.keys.down,this.vertical<0);

        //console.log(this.keys);
    };

    TouchPadMapper.prototype._checkToggle=function(state_=0,pressed_=false){
        if( pressed_ && state_<2)return state_+1;
        if(!pressed_ && state_>0)return (state_+1)&3;
        return state_;
    };

    TouchPadMapper.prototype.horizontal=0;

    TouchPadMapper.prototype.vertical=0;

    TouchPadMapper.prototype.isPressed=function(direction_){return this.keys[direction_]%3>0;};

    TouchPadMapper.prototype.wasPressed=function(direction_){return this.keys[direction_]==1;};

    TouchPadMapper.prototype.wasReleased=function(direction_){return this.keys[direction_]==3;};
})();



var TouchButtonMapper = pc.createScript('touchButtonMapper');


//TouchButtonMapper
(()=>{
    TouchButtonMapper.attributes.add("pad",{type:"entity",title:"Source Button",array:true,description:
    "Name of the entity will be the name to check when using isPressed. If not present, use btn-#,"+
    " where # is the index in the array. Example isPressed('btn-0')"
    });
    TouchButtonMapper.attributes.add("key",{type:"string",title:"Mapped Key",array:true,description:
    "The key that is assosiated with the touch button. Make sure the index of touch button and "+
    "keyboard key is the same.",
        enum:TouchPadMapper.staticVars.keyNames});
    TouchButtonMapper.prototype.keys={};
    TouchButtonMapper.prototype._checkToggle=TouchPadMapper.prototype._checkToggle;
    //TouchButtonMapper.prototype.initialize = function() {};
    
    TouchButtonMapper.prototype.update=function(dt){
      for (var i in this.key)if(i!=="" && i!=="NONE") {
          var pressed_=isp_(this.key[i]);
          var pad=this.pad[i];
          if(!pressed_ && pad && pad.script.touchGamePad){
             pressed_=pad.script.touchGamePad.tick>=0;
          }
          var k=pad?pad.name:"btn-"+i;
          this.keys[k]=this._checkToggle(this.keys[k],pressed_);
          if(this.keys[k]===0)delete this.keys[k];
      } 
        //console.log(this.keys);
    };
    //this.keys.left=this._checkToggle(this.keys.left,this.horizontal<0);
    
    TouchButtonMapper.prototype.isPressed=TouchPadMapper.prototype.isPressed;
    TouchButtonMapper.prototype.wasPressed=TouchPadMapper.prototype.wasPressed;
    TouchButtonMapper.prototype.wasReleased=TouchPadMapper.prototype.wasReleased;
})();


var TouchMouseMapper = pc.createScript('touchMouseMapper');
(()=>{
    TouchMouseMapper.attributes.add("pad",{type:"entity",title:"Source Pad",description:
    "Name of the entity"
    });
    
    TouchMouseMapper.attributes.add("sen",{type:"number",title:"Sensitivity",description:
    "Mouse Movement Sensitivity",default:1
    });
    
    TouchMouseMapper.attributes.add("useLock",{type:"boolean",title:"Pointor Lock",description:
    "When mouse pressed, the game gets focused.",default:true
    });
    
    TouchMouseMapper.attributes.add("preventLock",{type:"string",title:"Prevent Lock",description:
    "When mouse pressed, this key will prevent locking the mouse.",default:'KEY_SHIFT',enum:TouchPadMapper.staticVars.keyNames
    });
    
    TouchMouseMapper.prototype.tick=-1;
    TouchMouseMapper.prototype.tick2=-1;
    TouchMouseMapper.prototype._mouseDown=false;
    TouchMouseMapper.prototype._mouseReleased=false;
    
    TouchMouseMapper.prototype.horizontal=0;
    TouchMouseMapper.prototype.vertical=0;
    
    TouchMouseMapper.prototype._horizontalTarget=0;
    TouchMouseMapper.prototype._verticalTarget=0;
    
    
    TouchMouseMapper.prototype.initialize=function(){
        this._initMouse();console.log("Mouse U");
    };
    
    TouchMouseMapper.prototype._pad=function(){return this.pad.script.touchGamePad;};
    
    TouchMouseMapper.prototype._initMouse=function(){
        
        var start_=(e)=>{if(e.button!==0)return;
            if (!pc.Mouse.isPointerLocked() && this.useLock){
                if(!TouchPadMapper.prototype.isp_(this.preventLock))
                    this.app.mouse.enablePointerLock();
                return;
            }
            this._mouseDown=true;
            this._mouseReleased=false;
        };
        var end_=(e)=>{if(e.button!==0)return;
            this._mouseReleased=this._mouseDown;
            this._mouseDown=false;
        };
        var move_=(e)=>{
            if (!pc.Mouse.isPointerLocked() && this.useLock) return;//only move if locked?
            this._verticalTarget=-e.dy*this.sen;
            this._horizontalTarget=e.dx*this.sen;
        };
        
        if(this._destMouse)_destMouse();
        
        this._destMouse=()=>{
            this.app.mouse.off(pc.EVENT_MOUSEDOWN,start_,this);
            this.app.mouse.off(pc.EVENT_MOUSEMOVE,move_,this);
            this.app.mouse.off(pc.EVENT_MOUSEUP,end_,this);
            document.removeEventListener ('mouseout',end_);
        };
        
        this.app.mouse.on (pc.EVENT_MOUSEDOWN,start_,this);
        this.app.mouse.on (pc.EVENT_MOUSEMOVE,move_,this);
        this.app.mouse.on (pc.EVENT_MOUSEUP,end_,this);
        document.addEventListener ('mouseout',end_);
        
        
    };
    
    TouchMouseMapper.prototype.update=function(dt){
        var pad=this.pad.script.touchGamePad.get();
        this.horizontal=this._horizontalTarget || pad.x;
        this.vertical=this._verticalTarget || pad.y;
        
        this._horizontalTarget=this._verticalTarget=0;
        
        if(this._mouseReleased){this.tick=-2;this._mouseReleased=false;}
        else
        if(this._mouseDown || this.tick==-2)this.tick++;
        //console.log(this._pad);
        //workaround to check wasPressed for touch
        if (this._pad().tick!=-1)this.tick2=this._pad().tick;
        else if (this.tick2>=0)this.tick2=-2;else this.tick2=-1;
    };
    
    TouchMouseMapper.prototype. isPressed=function(){return this.tick>=0  || this._pad().isPressed();};
    TouchMouseMapper.prototype.wasPressed=function(){return this.tick===0 || this.tick2===0;};
    TouchMouseMapper.prototype.wasReleased=function(){return this.tick==-2 || this.tick2==-2;};
    
})();
