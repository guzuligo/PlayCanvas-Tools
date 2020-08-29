//For questions, refer to https://github.com/guzuligo
//Version 0.2.0
var BatchingTool = pc.createScript('batchingTool');
BatchingTool.attributes.add('asap',{title:"Active at Initialize",type:'boolean',default:true});
BatchingTool.attributes.add('delegate',{title:"Delegate to Children",type:'boolean',default:false,
description:"Attach this script to children and apply it instead of applying to this entity."});
BatchingTool.attributes.add('batching',{title:"Batching",type:'number',default:0,enum:[
    {'instancing':0},{'batching':1},{'fallback batching':2}
]});
BatchingTool.attributes.add('cleanup',{
    type:'number',default:3,enum:[
        {'none':0},{'disable':1},{'destroy':2},{'enable hidden':3}
    ],description:"What to do with entities after instancing activated."
});
// initialize code called once per entity
BatchingTool.prototype.initialize = function() {
    //new pcx.MiniStats(this.app);//for testing
    if(this.asap)this.run();
    
};

BatchingTool.staticVars={tobake:0};

BatchingTool.prototype.instances=null;//holders or batch groups

BatchingTool.prototype.isBatching=function(){
    return this.batching==1 || (this.batching==2 && !this.app.graphicsDevice.supportsInstancing);
};

BatchingTool.prototype.run=function(){
    if (this.delegate){
        //console.log(this.entity.name,"delegating");
        return this.applyToChildren();
    }
    //console.log(this.entity.name,"batched");
    var c=this._getAllChildren(this.entity);
    var g=this._group(c);
    var h=[];//all holders
    var h_;
    var t=this.isBatching();
    var i=-1;while(++i<g.length){
        if(t){//t=true => do batching. Else do instancing
            h_=this._createBatchingHolder(g[i][0]);
            var j=-1;while(++j<g[i].length)
                g[i][j].model.model.batchGroupId=h_.id;
            h.push(h_);
        }
        else{
            h_=this._createInstanceingHolder(g[i][0]);
            this.entity.addChild(h_);
            this._generateInstancing(h_,g[i]);
            h.push(h_);
            BatchingTool.staticVars.tobake+=5;
        }
    }
    if(!t)//cleaen up if not batching
        this.doCleanup(c);
    
    this.instances=h;
    return h;
    
};

BatchingTool.prototype.applyToChildren=function(){
    //console.log("Apply to Children of",this.entity.name);
    var e,i=-1;while(++i<this.entity.children.length){
        e=this.entity.children[i] || new pc.Entity();
        if(!e.script && e.addComponent)e.addComponent('script');
        if( e.script)e.script.create('batchingTool',{attributes:{batching:this.batching,cleanup:this.cleanup}});
        e.enabled=true;
    }
};

// update code called every frame
BatchingTool.prototype.update = function(dt) {
    if(BatchingTool.staticVars.tobake){
        BatchingTool.staticVars.tobake--;
        if(BatchingTool.staticVars.tobake===0){
            this.app.lightmapper.bake(null, pc.BAKE_COLOR);
            //console.log("BAKE!");
        }
    }
};


BatchingTool.prototype.doCleanup=function(r){
    if(!this.cleanup)
        return;
    
    var i=-1;while(++i<r.length){
        var e=r[i];
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

BatchingTool.prototype._group=function(e){//e=entities
    var groups=[];
    var i,j,skip;
    i=-1;while(++i<e.length){skip=false;
        j=-1;while(++j<groups.length &&!skip){
            //find similar and add to group of similars
            if(this._checkSimilar(groups[j][0],e[i])){
                groups[j].push(e[i]);
                skip=true;
            }
        }//groups
        //add new group if nothing similar
        if(!skip)
            groups.push([e[i]]);
        //console.log(j,groups.length);
    }//e.length
    return groups;
};

BatchingTool.prototype._checkSimilar=function(a,b){
    if(a.model.type!==b.model.type){//console.log("TYPE DIFFERENCE",a,b);
        return false;}
    if(a.model.type!='asset')
        return a.material==b.material;
    
    var i=-1;while(++i<a.model.meshInstances.length &&i<b.model.meshInstances.length ){
        if(a.model.meshInstances[i].material!=b.model.meshInstances[i].material){
            return false;
        }
    }
    return true;
};

BatchingTool.prototype._getAllChildren=function(from_){
    var result_=[];
    var c=from_.children;
    var i=-1;while(++i<c.length){
        if(c[i].model)result_.push(c[i]);
        result_=result_.concat(this._getAllChildren(c[i]));
    }
    return result_;
};


BatchingTool.prototype._createBatchingHolder=function(source){
    var name=this.entity.name+"."+source.model.meshInstances[0].node.name;
    return pc.app.batcher.addGroup(name, true, 100);
};
BatchingTool.prototype._createInstanceingHolder=function(source){
    var data={
            material:source.model.material,
            type:source.model.type,
            asset:source.model.asset,
            castShadows:source.model.castShadows,
            lightmapped:source.model.lightmapped,
            castShadowsLightmap:source.model.castShadowsLightmap,
            isStatic:true//source.model.isStatic,
        };
    //console.log("data:",data);
    //var e=source.clone() ||new pc.Entity();e.setPosition(0,0,0);e.setEulerAngles(0,0,0);e.setLocalScale(1,1,1);
    var e=new pc.Entity(this.entity.name+"."+source.model.meshInstances[0].node.name);
    e.addComponent("model",data);
    //e.model=source.model;//.clone();
    return e;
};

BatchingTool.prototype._generateInstancing=function(instancingHolder,e){
    //console.log(instancingHolder,e);this.app.autoRender=false;this.app.renderNextFrame=true;
    //make sure material supports instancing
    var material,i;
    {   //console.log("generate:",instancingHolder);
        if (instancingHolder.model.type!='asset'){
            material=instancingHolder.model.material;
            material.onUpdateShader = function (options) {
                options.useInstancing  = true;
                return options;
            };
            material.update();
        }else{
            i=-1;while(++i<instancingHolder.model.meshInstances.length){
                material=instancingHolder.model.meshInstances[i].material;
                material.onUpdateShader = function (options) {
                    options.useInstancing  = true;
                    return options;
                };
                material.update();
            }
        }
    }   
    
    //make instancing
    if (this.app.graphicsDevice.supportsInstancing) {
            // number of instances to render
            var instanceCount = e.length;
            // store matrices for individual instances into array
            var matrices = new Float32Array(instanceCount * 16);
            var matrixIndex = 0;

            var pos = new pc.Vec3();
            var rot = new pc.Quat();
            var scl = new pc.Vec3();
            var matrix = new pc.Mat4();
        
            for ( i = 0; i < instanceCount; i++) {
                pos=e[i].getPosition();
                scl=e[i].getLocalScale();
                var rr=e[i].getEulerAngles();
                rot.setFromEulerAngles(rr.x-90,rr.y,rr.z);
                //console.log("scl",scl);//matrix = new pc.Mat4();
                matrix/*=e[i].getWorldTransform();/*/.setTRS(pos, rot, scl);/* // */
                
                // copy matrix elements into array of floats
                for (var m = 0; m < 16; m++)
                    matrices[matrixIndex++] = matrix.data[m];
            }

            // create static vertex buffer containing the matrices
            var vertexBuffer = new pc.VertexBuffer(this.app.graphicsDevice, pc.VertexFormat.defaultInstancingFormat, instanceCount, pc.BUFFER_STATIC, matrices);

            // initialise instancing using the vertex buffer on meshInstance of the created box
            i=-1;while(++i<instancingHolder.model.meshInstances.length){//for ( i=0;i<instancingHolder.model.meshInstances.length;i++){
                var meshInst = instancingHolder.model.meshInstances[i];
                meshInst.setInstancing(vertexBuffer);
            }
        }
    
    return instancingHolder;
    
};



// swap method called for script hot-reloading
// inherit your script state here
// BatchingTool.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/