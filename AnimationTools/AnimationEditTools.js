
    
    

    


var AnimationEditTools = pc.createScript('animationEditTools');
//animationEditTools
{


    // initialize code called once per entity
    AnimationEditTools.prototype.initialize = function() {

    };

    // update code called every frame
    AnimationEditTools.prototype.update = function(dt) {

    };

    /**
     * If this is specified, it will be used instead of entity animation component
     */ 
    AnimationEditTools.prototype.animation=null;

    /**
     * Removes interpolation from specified bone name. If this.animation is not set, current animation will be used
     * @param {string|string[]} boneName The bone to remove interpolation from
     * @param {number} firstKey The first key to remove interpolation from
     * @param {number} lastKey The last key to remove interpolation from
     * @param {number} deltaAccuricy How many milliseconds to use. Default: 0.001
     */

    AnimationEditTools.prototype.removeInterpolation=function(boneName,firstKey,lastKey,deltaAccuricy){
        if(Array.isArray(boneName))
            for(var i in boneName)this._removeInterpolation(boneName[i],firstKey,lastKey,deltaAccuricy);
        else
            this._removeInterpolation(boneName,firstKey,lastKey,deltaAccuricy);
    };

    AnimationEditTools.prototype._removeInterpolation=function(boneName,firstKey,lastKey,deltaAccuricy){
        var a=this.animation || this.entity.animation.currAnim;
        if(typeof a === 'string')a=this.entity.animation.getAnimation(a);
        a=a.getNode(boneName);
        a._keys=AnimationEditTools.staticFuns.removeInterpolation(a._keys,firstKey,lastKey,deltaAccuricy);
    };



    AnimationEditTools.staticFuns={};
    /*
     * @param {pc.Key []} keys The source keys to use
     * @param {number} atKey Address of key to remove interpolation
     * @param {number} deltaAccuricy How many milliseconds to use
     */ 

    AnimationEditTools.staticFuns.removeInterpolationAt=function(keys,atKey,deltaAccuricy=0.001){
        var delta=keys[atKey+1].time-keys[atKey].time;
        var newKey=new pc.Key();
        Object.assign(newKey,keys[atKey]);
        console.log("delta",delta,deltaAccuricy);
        if (delta<=deltaAccuricy)return keys;
        newKey.time=keys[atKey+1].time-deltaAccuricy;
        return keys.slice(0,atKey+1).concat([newKey]).concat(keys.slice(atKey+1));
    };

    /*
     * returns array of boolen [positionChanges,rotationChanges,scaleChanges]
     * @param {pc.Key []} keys The source keys to use
     * @param {number} atKey Address of key to check interpolation
     */ 
    AnimationEditTools.staticFuns.checkInterpolation=function(keys,atKey,returnArray=false){

        if (atKey>=keys.length-1 || keys.length===0)
            return returnArray?[false,false,false]:false;
        else{
            var result_=[
                !keys[atKey].position.equals(keys[atKey+1].position),
                !keys[atKey].rotation.equals(keys[atKey+1].rotation),
                !keys[atKey].scale   .equals(keys[atKey+1].scale)
            ];
            return returnArray?result_:result_[0]||result_[1]||result_[2];
        }
    };

    AnimationEditTools.staticFuns.removeInterpolation=function(keys,firstKey,lastKey,deltaAccuricy=0.001){
        if (!lastKey)lastKey=keys.length-1;
        if (!firstKey)firstKey=0;
        while(lastKey>=firstKey){//console.log("lKey:",lastKey);
            if(AnimationEditTools.staticFuns.checkInterpolation(keys,lastKey,false))
                keys=AnimationEditTools.staticFuns.removeInterpolationAt(keys,lastKey,deltaAccuricy);
            lastKey--;
        }
        return keys;
    };
}




var boneToUv=pc.createScript('boneToUv');

    
{    
    
    boneToUv.attributes.add("active",{type:"boolean",default:true});
    boneToUv.attributes.add("links",{type:"json",array:true,schema:[
        {name:"bname",title:"Bone Name",type:"string"},
        {name:"bmat",title:"Material Index",type:"number",description:
         "The target material to be affected. Note that this index is based on meshInstances"},
        {
            name:"channels",type:"number",default:1,enum:[
                {"Diffuse":1},
                {"Opacity":2},
                {"Diffuse & Opacity":3},
                ],
        },
        {name:"clone",title:"Clone Material",type:"boolean",default:true}
    ]});

    boneToUv.prototype.initialize=function(){
        var i=-1;while(++i<this.links.length)if(this.links[i].clone){
            var bmat=this.links[i].bmat;
            this.entity.model.meshInstances[bmat].material=this.entity.model.meshInstances[bmat].material.clone();
        }
    };
    boneToUv.prototype.update=function(dt){
        
      
        
        var i=-1;if(this.active && this.entity.animation)while(++i<this.links.length)
          this.uvUpdate(this.links[i].bname,this.links[i].bmat,"x","y",this.links[i].channels);
    };

    boneToUv.prototype.getBone=function(bname){
        var b=this.entity.animation && this.entity.animation.skeleton.graph.findByName(bname);
        
        return b||{};
    };

    /**
     * 
     * @param {string|pc.Vec3} bname Can be either bone name or specific pc.Vec3
     */ 
    
    var off_=new pc.Vec2(0,0);
    boneToUv.prototype.uvUpdate=function(bname,bmat,att1="x",att2="y",chan=0,drive_="localPosition"){
        var v=typeof bname==='string'?this.getBone(bname)[drive_]:bname;
        bmat=this.getMat(bmat);
        off_.set(v[att1],v[att2]);
        var change=false;
        if(chan&1)
            change= change || this._uvUpdateChan(off_,bmat,"diffuseMapOffset");
        if(chan&2)
            change= change || this._uvUpdateChan(off_,bmat,"opacityMapOffset");
        
        if(change)
            bmat.update();
        
        /*
        if(!bmat.diffuseMapOffset.equals(off_)){//TODO:opacity
            bmat.diffuseMapOffset.set(off_.x,off_.y);
            bmat.update();
        }*/
    };
    
    boneToUv.prototype._uvUpdateChan=function(v,bmat,chan){
        chan=bmat[chan];
        if(!chan.equals(v)){
            chan.set(v.x,v.y);
            return true;//changes!
        }
        return false;//nothing changed
    };
    
    boneToUv.prototype.getMat=function(matIndex){
        if (!isNaN(matIndex))
            return this.entity.model.meshInstances[matIndex].material;
        
        return matIndex;
    };
    
}
