var AnimationSpliter = pc.createScript('animationSpliter');
//var d__=new pc.Vec3(0,0,1);
AnimationSpliter.attributes.add("name",{type:"string",title:"Name",default:"",description:
    "Name used as a chache ID and in autonaming if no animation names provided."});
AnimationSpliter.attributes.add("ani",{type:"asset",title:"Animation"});
AnimationSpliter.attributes.add("dur",{type:"vec3",title:"Durations",placeholder:["start","end","speed"],array:true,description:
    "Each duration will be treated as a separate animation."});

AnimationSpliter.attributes.add("durn",{type:"string",title:"Animation Names",array:true,description:
    "Should be in the same order as durations"});
AnimationSpliter.attributes.add("shared",{type:"boolean",title:"Shared",default:true,description:
    "All entities share the same results of splitting in order to avoid recalculating"});
AnimationSpliter.attributes.add("anyani",{type:"boolean",title:"Fix Type",default:true,
    description:"When asset type is text or non-animation json, it can be reloaded as animation."});
AnimationSpliter.attributes.add("after",{type:"number",title:"Then",default:1,
    enum:[
    {"None":0},
    {"Replace Animations":1},
    {"Add to Animations":2},

    ],
    description:"What to do after animation generated."});

AnimationSpliter.staticVars={animation:{}};
AnimationSpliter.prototype.animation=null;
// initialize code called once per entity
AnimationSpliter.prototype.initialize = function() {
    var reload=(useCache=true)=>{
        this.reload();
        //AnimationSpliter.staticVars.animation[this.name]=this.generate(); 
        
        if (this.ani){
            if(this.ani.loaded){
                //console.log("Quick generate");
                this.generate(useCache);
            }
            else{
                //console.log("Wait generate",this.ani.loading,this.ani.loaded);
                this.ani.on('load',()=>{
                    //console.log("ready ",this.ani.loading,this.ani.loaded);
                    this.generate(useCache); 
                });
            }
        }
    };
    this.on("attr:ani",()=>{
        //console.log("asset Reloading");
        reload(false);
    }
    ,this);
    
    //if (!this.shared || !AnimationSpliter.staticVars.animation[this.name])
    reload(this.shared);
    //else
    //    reload();
    //console.log("NAME:",this.entity.name);
};

/*
 * Try again to generate
 */ 
AnimationSpliter.prototype.retry = function() {
    this.generate(false); 
};

AnimationSpliter.prototype.reload=function(){
    if (this.ani){
        if (this.ani.type=="json" || this.ani.type=="text"){
            if (this.anyani)this.ani.type="animation";
            this.ani.reload();
        //console.log(this.ani.)
        }
        return this.ani.type=="animation";
    }
    return false;
};

/*
 * Goes through the durations and returns an array of animations
 */ 
AnimationSpliter.prototype.generate=function(useCache=true){
    
    var animations=(useCache)?AnimationSpliter.staticVars.animation[this.name]:null;
    var i;
    if(!animations){animations={};
        i=-1;while(++i<this.dur.length){
            var name_=(i<this.durn.length && this.durn[i].name)?this.durn[i]:this.name+"_"+i;
            animations[name_]=(this.slice(name_,this.dur[i].x,this.dur[i].y,this.dur[i].z));
            
        }
    }
    
    if (this.shared)
        AnimationSpliter.staticVars.animation[this.name]=animations;
    //console.log("an",this.entity.animation,this.after);
    this.doAfter(animations);
    return (this.animation=animations);
};

AnimationSpliter.prototype.doAfter=function(animations){
    if (this.after){
        if (!this.entity.animation)
            this.entity.addComponent('animation');
        switch (this.after){
            case 1://replace
                this.entity.animation.animations=animations;
                break;
            case 2:
                for (i in animations)
                this.entity.animation.animations[i]=animations[i];
                break;

        }
    }
};


/*
 * Create an animation out of the animation asset
 * @param {string} name_ Animation name
 * @param {number} start_ The starting
 * @param {number} end_ Animation name
 * 
 */ 
AnimationSpliter.prototype.slice=function(name_,start_,end_,speed_=1){
    //only works with animation type
    if(this.ani.type!="animation"){console.error("AnimationSpliter unable to read asset.");return null;}
    
    var a=new pc.Animation();
    var s=this.ani.resource || new pc.Animation();//source animation
    a.name=name_;
    //var dlta=start_-Math.floor(start_*10)*0.1;
    speed_= (!speed_)?1:1/speed_;
    a.duration=(end_-start_)*speed_;
    var r=(speed_>0)?0:a.duration*=-1;
    var i=-1;while (++i<s.nodes.length){
        var n=new pc.Node();
        var ni=s.nodes[i];
        var nik=ni._keys;
        n._name=ni._name;
        var j=Math.floor(start_*10);//key index (Only works with .1 inc)
        //TODO: maybe use while to initialize j at a proper start time
        //
        
        //Add frames between start and end
        //while(j<nik.length && j*0.1<end_){
        while(j<nik.length){ //console.log(j);
            var k=nik[j++];if(k.time>end_)break;
            n._keys.push({time:r+Math.round( (k.time-start_)*1000)*0.001*speed_,position:k.position,rotation:k.rotation,scale:k.scale});
        }
        
        //negative speed has a reverse effect
        if (r) n._keys.reverse();
        
        if (n._keys.length>0)
            n._keys[0].time=0;
        //n._keys[n._keys.length-1].time=a.duration;
        a.addNode(n);
    }
    
    return a;
};


// swap method called for script hot-reloading
// inherit your script state here
 //AnimationSpliter.prototype.swap = function(old) { console.log("swap();");};

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/