//By guzuligo at gmail dot com
//Version 1.0.1

var TouchGamePad = pc.createScript('touchGamePad');
//For User

TouchGamePad.prototype.isPressed=function(){
    return this.id!=-1;
};
TouchGamePad.prototype.getRaw=function(){
    return this.stick.getLocalPosition().clone().scale(2/this.entity.element.width);
};

TouchGamePad.prototype.get=function(){
    var _r=this.getRaw();this.isPressed();
    if (this.onehot){
        _r.x=(_r.x<this.actd)?(-_r.x<this.actd)?0:-1:1;
        _r.y=(_r.y<this.actd)?(-_r.y<this.actd)?0:-1:1;
    }
    
    return _r;
};

//vars
TouchGamePad.prototype.tick=-1;//updates every frame
TouchGamePad.prototype.timer=0;//uses delta time
TouchGamePad.prototype.sleeping=true;
TouchGamePad.prototype.sleepingAutoback=0;
TouchGamePad.prototype._justPressed=false;
TouchGamePad.prototype._initposition=null;//new pc.Vec3(0,0,0);
TouchGamePad.prototype.holder=null;
//TouchGamePad.prototype.stick=null;
TouchGamePad.prototype.opacity=[0,0];//pad,stick
TouchGamePad.prototype.id=-1;
TouchGamePad.prototype.limit_=1;

TouchGamePad.prototype._tmpv3=new pc.Vec3();

//Exposed vars


/*
TouchGamePad.attributes.add("Type",{
    title:"Type",type:"string",enum:
    [{"Game Pad":"pad"},{"Button":"button"}],
    default:"pad",
});*/
TouchGamePad.attributes.add("prior",{
    title:"Top Priority",type:"boolean",default:false,description:
    "Check for this before all others."
});
TouchGamePad.attributes.add("dir",{
    title:"Direction",type:"string",enum:
    [{"Both":"b"},{"Horizontal":"h"},{"Vertical":"v"},{"Button":"c"}],description:
    "Type of the pad/button. Full stick, vertical only, horizontal only or act only as a button",
    default:"b",
});
TouchGamePad.attributes.add("xspace",{
    title:"Horizontal Space",type:"number",min:-0.9,max:0.9,description:
    "How much to ignore from left or right side of screen. -0.5 to ignore right half and +0.5 to ignore left half",
    default:0,
});
TouchGamePad.attributes.add("yspace",{
    title:"Vertical Space",type:"number",min:-0.9,max:0.9,description:
    "How much to ignore from top or bottom side of screen. -0.5 to ignore bottom half and +0.5 to ignore top half",
    default:0,
});
TouchGamePad.attributes.add("rspace",{
    title:"Touch Radius",type:"number",min:0,max:1,description:
    "How far the touch from the button to ignore it. 1 is full screen size and will never be ignored.",
    default:1,
});
TouchGamePad.attributes.add("adjust",{
    title:"Adjustability",type:"string",enum:
    [{"Fixed":"fixed"},{"Float":"float"},{"Follow":"follow"}],description:
    "The method to get close to where the touch is.",
    default:"float",
});
TouchGamePad.attributes.add("actopacity",{
    title:"Active Opacity",type:"number",default:1,min:-0.01,max:1,description:
    "The opacity to use when held. Stick will use same opacity + delta"
});
TouchGamePad.attributes.add("autoback",{
    title:"Move Back",type:"number",default:1,min:0,max:1,description:
    "When touch ends, button goes back to where it was. 0 to never go back."
});



TouchGamePad.attributes.add("autohide",{
    title:"Auto Hide",type:"number",default:0,min:0,max:1,description:
    "Set opacity to zero"
});

TouchGamePad.attributes.add("onehot",{
   title:"Return one hot",type:"boolean",description:
    "If set, returned value will be either zero or one instead of a float."
});
TouchGamePad.attributes.add("actd",{
   title:"Activation Distance",type:"number",min:0,max:1,default:0.5,description:
    "How far to considor one hot. 0.5 for middle distance"
});
TouchGamePad.attributes.add("deadzone",{
   title:"Dead Zone",min:0,max:1,type:"number",description:
    "How far the touch should move away from center before activation. "+
    "The distance is in percentage of the element width and height."
});

TouchGamePad.attributes.add("autozero",{
    title:"Reset",type:"number",default:0,min:0,max:1,description:
    "When touch moves, it gradually goes back to zero. Use 0 to diactivate. "+
    "(Note: If not set to zero, limit will break)"
});

TouchGamePad.attributes.add("stick",{
   title:"Stick",type:"entity",description:
    "The stick to follow finger. If not specified, "+
    "first child will be used. (Make sure to have at least one child)" 
});

//For Admin
TouchGamePad.prototype.autoZero=function(){
    if (this.autozero===0)
        return;
    var scale__=this.autozero/this.holder.referenceResolution.x;//TODO:Needs more accuricy
    var dir__=this.stick.getLocalPosition().clone().scale(scale__);
    if (this.adjust!="follow"){
        if (this.id==-1)
            this.stick.translate(dir__.scale(-1));
    }else{
        this.entity.translate(dir__);
        this.stick.translate(dir__.scale(-1));
    }

};

// initialize code called once per entity
TouchGamePad.prototype.initialize = function() {
    //this.on('attr:Type', function (value, prev) {console.log(value);});
    var _p;
    if(!this.entity.parent.script){
        this.entity.parent.addComponent("script");
    }
    _p=this.entity.parent.script;
    
    if(!_p.touchGamePadParent)
        _p.create("touchGamePadParent");
    
   
    /*
    if (!_p.touchGamePadParent._isinit){
       _p.touchGamePadParent._init();
        console.log("Initialization issue");
    }*/
    //add based on priority
    
    _p.touchGamePadParent.push(this,this.prior);
    
    
    this.holder=this.entity.parent.screen;
    this._initposition=(this.entity.getPosition()).clone();
    if(!this.stick)this.stick=this.entity.children[0];
    this.opacity=[this.entity.element.opacity,this.stick.element.opacity];
};

// update code called every frame
TouchGamePad.prototype.update = function(dt) {
    
    //if (this.id!==-1) console.log(this.get());
    
    if (this.sleepingAutoback>0 && this.autoback!==0 && this.id==-1 ){
        var _vec_=this._tmpv3.sub2(this._initposition,this.entity.getPosition()).scale(this.autoback);
        this.entity.translate(_vec_);
        if (this.sleeping)
         if (--this.sleepingAutoback<=0)
            this.entity.setPosition(this._initposition);
    }
    this.autoZero();
    if (this.id!=-1) {this.tick++;this.timer+=dt;} else
        if(!this.sleeping){
       
        
        if (this.autohide!==0){
            this.entity.element.opacity*=1-this.autohide;
            this.stick.element.opacity*=1-this.autohide;
            if (this.entity.element.opacity<0.01){
                this.sleeping=true;
                this.entity.element.opacity=0;
                this.stick.element.opacity=0;
            }
        }else if (this.actopacity>=0){
            this.entity.element.opacity=(this.entity.element.opacity+this.opacity[0])/2;
            this.stick.element.opacity =(this.stick.element.opacity +this.opacity[1])/2;
            
            if (Math.abs(this.entity.element.opacity)-Math.abs(this.opacity[0])<0.01 && 
                Math.abs(this.stick.element.opacity)-Math.abs(this.opacity[1])<0.01)
            {
                this.sleeping=true;
                [this.entity.element.opacity,this.stick.element.opacity]=this.opacity;
            }
            
        }
    }
};
TouchGamePad.prototype._startPosition={x:0,y:0};
TouchGamePad.prototype.use=function(e){
    if (this.id==-1 && this.enabled){
        //Horizontal Border
        if (this.xspace!==0){
            //console.log(e.x/this.holder._resolution.x,this.xspace);
            if (this.xspace<0){
                if (e.x/this.getRes().x>1+this.xspace)
                    return false;
            }else
                if (e.x/this.getRes().x<this.xspace)
                    return false;
        }
        
         //Vertical Border
        if (this.yspace!==0){
            //console.log(e.y/this.holder._resolution.y,this.yspace);
            if (this.yspace<0){
                if (e.y/this.getRes().x>1+this.yspace)
                    return false;
            }else
                if (e.y/this.getRes().y<this.yspace)
                    return false;
        }
        
        //Touch Radius
        if (this.rspace!=1){
            //var _r=new pc.Vec2(e.y/this.holder._resolution.x,e.y/this.holder._resolution.y);
            var _r= this.mapPos_(e,true);
            var _p= this.getRes();
            var _P=1/(_p.x+_p.y);
            _r=this._tmpv3.set(_r[0],_r[1],0);
            var _t=this.entity.getPosition();
            
            //Convert to screen ratio before finding distance
            _t.x*=_p.x*_P;
            _t.y*=_p.y*_P;
            
            _r.x*=_p.x*_P;
            _r.y*=_p.y*_P;
            var _rad=(_r.distance(_t))*0.5;
            
            //console.log(_p,this.entity.name, _r,_t);
            if (_rad>this.rspace)
                return false;
        }
        
        
        this.id=e.id;//console.log(this.adjust);
        //console.log(e);
        if (this.adjust!="fixed")this.drawAt(e);
        if (this.dir!="c")this.drawAt(e,this.stick);//don't move on buttons
        if (this.adjust=="fixed")this._limit(this.stick);
        
        
        if (this.sleeping && this.autohide!==0){
            this.opacity=[this.entity.element.opacity,this.stick.element.opacity];
        }
        
        [this.entity.element.opacity,this.stick.element.opacity]=this.opacity;
        if (this.actopacity>=0){
            this.entity.element.opacity=this.actopacity;
            this.stick.element.opacity =this.actopacity+this.opacity[1]-this.opacity[0];
        }
        this._startPosition={x:e.x,y:e.y};
        this.sleeping=false;
        this.sleepingAutoback=15;
        return true;
        
        
    }
    return false;
};


TouchGamePad.prototype.end=function(e){
    this.tick=-1;this.timer=0;
    if (this.id==e.id){
        this.id=-1;
        //this.drawAt(this.entity.getPosition(),this.stick);
        if (this.autozero===0)this.stick.setLocalPosition(0,0,0);
        //console.log(e);
        
        return true;
    }
    return false;
};


TouchGamePad.prototype.move=function(e){
    if (this.id==e.id){
        this.move_(e);
        return true;
    }
    return false;
};


TouchGamePad.prototype.move_=function(e){
    if (this.dir!="b" && this.dir!="c")//not all directions
        if (this.dir=="h")
            e.y=this._startPosition.y;else e.x=this._startPosition.x;
    
    //var d=this.entity.getScale();
    //d=Math.sqrt(d.x*d.x+d.y*d.y);
    //if (e.x>d)e.x=d;
    //console.log("delta",d,e.x,this.stick.getLocalPosition())
    
    
    
    
    if (this.dir!="c"){
        this.drawAt(e,this.stick);
        if(this.autozero===0)this._limit(this.stick,this.deadzone!==0);
    }
};

//My attributes





TouchGamePad.prototype.drawAt=function(e,who_){
    if (who_===undefined)who_=this.entity;
    var holder=this.holder;
    var r=holder.referenceResolution;
    var b=holder.scaleBlend;
    var s=this.getRes();
    var x= 2*((e.x/ s.x  )-0.5);//*(r.x*b+r.y*(1-b));//*(r.x*b+r.y*(1-b));
    var y=-2*((e.y/ s.y  )-0.5);
    
    
    who_.setPosition(x,y,0);
};

TouchGamePad.prototype.limitv0=function(t){
    var p=t.getLocalPosition().clone();
    var d_=this.entity.getScale();
    var P=p.x*p.x+p.y*p.y;
    var d=Math.sqrt(d_.x*d_.x+d_.y*d_.y);//*0.1;
    if (P>d*d){
        P=Math.sqrt(P);
        p.x=d*p.x/P;
        p.y=d*p.y/P;
        //this.app.renderer.device.maxPixelRatio
        if (this.adjust=="follow"){
            this.entity.translate(p);
        }else
        if (!isNaN(p.x))
        t.setLocalPosition(p);
    }
};

TouchGamePad.prototype._limit=function(t,usedeadzone=false){
    var p=t.getLocalPosition().clone();
    var d_=this.entity.getScale().clone();//this.app.root.findByName("Pad").element.width
    d_.scale(this.entity.element.width*0.5);
    var P=p.length();
    var d=d_.length();//*0.1;
    if (P>d){
        p.normalize().scale(d);
        //p.x*=this.entity.element.width/(this.entity.element.width+this.entity.element.height);
        //p.y*=this.entity.element.height/(this.entity.element.width+this.entity.element.height);
        t.setLocalPosition(p);
        if (this.adjust=="follow" && P>d*2)
            this.entity.translate(p.clone().normalize().scale(P/this.holder.referenceResolution.length()/3));   
        //console.log("at",this.get());
    }else if (usedeadzone && P/d<this.deadzone){
        //console.log(this.stick.getLocalPosition(),P);
        this.stick.setLocalPosition(0,0,0);
    }
};

TouchGamePad.prototype.limitv2=function(t){
    var p=t.getLocalPosition().clone();
    var d_=this.entity.getScale().clone();//this.app.root.findByName("Pad").element.width
    d_.scale(this.entity.element.width*0.5);
    var P=p.length();
    p.x*=this.entity.element.width/Math.abs(this.entity.element.width+this.entity.element.height);
        p.y*=this.entity.element.height/Math.abs(this.entity.element.width+this.entity.element.height);
    var d=d_.length();//*0.1;
    if (P>d){
        p.normalize().scale(d);
        
        t.setLocalPosition(p);
        p.scale(1/d);
        if (this.adjust=="follow" && p.length()>d*2)
            this.entity.translate(p.scale(P/this.holder.referenceResolution.length()/3));   
        //console.log("at",this.get());
    }    
};




TouchGamePad.prototype.mapPos_=function(p,withMinus=false){
    var s=this.getRes();
    var result_=[p.x/s.x,p.y/s.y];
    if (withMinus){
        result_[0]= 2*(result_[0]-0.5);
        result_[1]=-2*(result_[1]-0.5);
    }
    return result_;
};

TouchGamePad.prototype.getRes=function(){
    return this.holder.resolution.clone().scale(1/this.app.renderer.device.maxPixelRatio);
};


///For debuggning
//class eeee{static e;}


// swap method called for script hot-reloading
// inherit your script state here
// TouchGamePad.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

