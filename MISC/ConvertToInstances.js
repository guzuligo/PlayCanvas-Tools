//For questions, refer to https://github.com/guzuligo
//Version 0.1.0 deprecated. Use BatchingTool
//

var ConvertToinstances = pc.createScript('convertToinstances');
ConvertToinstances.attributes.add('asap',{title:"Active at Initialize",type:'boolean',default:true});
ConvertToinstances.attributes.add('cleanup',{
    type:'number',default:3,enum:[
        {'none':0},{'disable':1},{'destroy':2},{'enable hidden':3}
    ],description:"What to do with entities after instancing activated."
});

// initialize code called once per entity
ConvertToinstances.prototype.initialize = function() {
    if(this.asap)this.run();
};

/**
 * Returns the instances that are holding the hardware instancing
 */ 
ConvertToinstances.prototype.getInstances=function(){
    return this._ref.reference;
};

ConvertToinstances.prototype.doCleanup=function(){
    if(!this.cleanup)
        return;
    var r=this._ref.children;
    
    var i=-1;while(++i<r.length){
        var e=r[i][0];
        switch(this.cleanup){
            case 1:
                e.enabled=false;
                break;
            case 2:
                e.destroy();
                break;
            case 3://enable hidden
                e.enabled=true;
                e.model.enabled=false;
                break;
        }
    }
};

/**
 * If not Active at Initialize, use this function to start the process of instancing
 */ 
ConvertToinstances.prototype.run=function(){
    this.init();
    this._getChildren(this.entity);
    this._createInstances();
    var r=this._ref;
    var i=-1;while(++i<r.reference.length)
        this._generate(r.reference[i],r.instances[i][2]);
    this.doCleanup();
};


// update code called every frame
//ConvertToinstances.prototype.update = function(dt) {};

ConvertToinstances.prototype._ref=null;

ConvertToinstances.prototype.init=function(){
    this._ref={
        children: [],//[entity,instnce#]
        reference:[],//entities with instances
        instances:[],//mesh instances to copy [mi,entitysrc,#]
    };
};

ConvertToinstances.prototype._getChildren=function(targetEntity_){
    targetEntity_=targetEntity_ || new pc.Entity();
    if (!targetEntity_.children)
        return;//fail if has no children
    var i=-1; while(++i<targetEntity_.children.length){
        //apply to all children
        this._getChildren(targetEntity_.children[i]);
        if(targetEntity_.children[i].model){
            this._addChild(targetEntity_.children[i]);
        }
    }
    
};
    
ConvertToinstances.prototype._addChild=function(entity){
    var r=this._ref.instances;
    var M=(entity || new pc.Entity()).model.meshInstances;
    var R=this._ref;
    var m=-1;while(++m<M.length){
        var i=-1;while(++i<r.length  &&!(M[m].material===r[i][0].material && M[m].mesh===r[i][0].mesh)  );
            //console.log("mat",r[i][0].loaded);
            //if (M[m].material==r[i].material && M[m].mesh==r[i].mesh){
                //R.children.push([entity,i]);//[Entity,meshInstance referenced]
               
        
        //console.log("M",M.length,r,i);
        //Point entity to reference
        R.children.push([entity,i]);
        //if not found in references, add it as reference
        if(i===r.length){
            r.push([M[m],entity,[entity]]);
        }else
            r[i][2].push(entity);
        
    }
        
};

ConvertToinstances.prototype._createInstances=function(){
    var r=this._ref.instances;//meshInstance
    var E=this._ref.reference;
    
    var i=-1;while(++i<r.length){
        var e=new pc.Entity(this.name+"__"+i);
        this.entity.addChild(e);
        //var data=Object.assign({},r[i][1].model);
        //data=Object.assign(data,r[i][0]);
        //*
        var data={
            material:r[i][0].material,
            type:r[i][1].model.type,
            asset:r[i][1].model.asset,
            castShadows:r[i][1].model.castShadows,
            lightmapped:r[i][1].model.lightmapped,
            castShadowsLightmap:r[i][1].model.castShadowsLightmap,
        };/**/
        //console.log("data",data);
        e.addComponent("model",data);
        E.push(e);
    }
    
};

ConvertToinstances.prototype._generate=function(instancingHolder,e){
    
    //make sure material supports instancing
    var material=instancingHolder.model.meshInstances[0].material;
    material.onUpdateShader = function (options) {
            options.useInstancing = true;
            return options;
        };
    material.update();
    
    //make instancing
    if (this.app.graphicsDevice.supportsInstancing) {
            // number of instances to render
            var instanceCount = e.length;
            // store matrices for individual instances into array
            var matrices = new Float32Array(instanceCount * 16);
            var matrixIndex = 0;

            for (var i = 0; i < instanceCount; i++) {
                var matrix=e[i].getWorldTransform();//.setTRS(pos, rot, scl);

                // copy matrix elements into array of floats
                for (var m = 0; m < 16; m++)
                    matrices[matrixIndex++] = matrix.data[m];
            }

            // create static vertex buffer containing the matrices
            var vertexBuffer = new pc.VertexBuffer(this.app.graphicsDevice, pc.VertexFormat.defaultInstancingFormat, instanceCount, pc.BUFFER_STATIC, matrices);

            // initialise instancing using the vertex buffer on meshInstance of the created box
            var meshInst = instancingHolder.model.meshInstances[0];
            meshInst.setInstancing(vertexBuffer);
        }
    
    
};

// swap method called for script hot-reloading
// inherit your script state here
// ConvertToinstances.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/
