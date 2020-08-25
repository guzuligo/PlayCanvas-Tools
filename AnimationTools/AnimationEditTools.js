var AnimationEditTools = pc.createScript('animationEditTools');

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




// swap method called for script hot-reloading
// inherit your script state here
// AnimationEditTools.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/