//For questions, refer to https://github.com/guzuligo
//Version 0.1.0
var G2Toonshader = pc.createScript('g2Toonshader');
G2Toonshader.attributes.add("material",{type:"asset",assetType:"material",title:"Material",description:
"The material to convert to toonshaded. If left empty, a new material will be created and you'll have to"+
" assign this.material to your model to use it."});
G2Toonshader.attributes.add("smooths",{type:"number",title:"Smoothness",min:0,max:1.0,default:0,description:
"TTT"});
G2Toonshader.attributes.add("mixAlbedo",{type:"number",title:"Diffuse Mix",min:0,max:1.0,default:0});
G2Toonshader.attributes.add("uF0",{type:"json",title:"Colors",array:true,schema:[
    {name:"activation",title:"Density",type:"number",min:-0.01,max:1,default:.5},{name:"color",title:"Color",type:"rgb"}
]});

G2Toonshader.prototype.colors=0;
// initialize code called once per entity
G2Toonshader.statics={id:0};
G2Toonshader.prototype.initialize = function() {
    
    if(this.material)this.setup();
    this.on("attr:material",function(){if(this.material)this.setup();},this);
    
    
};


G2Toonshader.prototype.reset=function(){
    var m=this.m;
    
    var replace0="\n\t uniform float smooths;uniform float mixAlbedo;";
    var replace1="float v = max(max(dDiffuseLight.r,dDiffuseLight.g),dDiffuseLight.b);"+
        "\n\t vec3 color=vec3(0.);\n";//vec4 color;";
    this.colors=this.uF0.length;
    for (var i=0;i<this.uF0.length;i++){
        replace0+="\n\t uniform float  uF"+i+";";
        replace0+="\n\t uniform vec3   cF"+i+";";
        replace1+="\n\t color=(1.-smoothstep(uF"+(i)+"-smooths,uF"+(i)+",v))*color+(smoothstep(uF"+(i)+"-smooths,uF"+(i)+",v))*cF"+i+";";
    }
    replace1+="\n\t return mix(color,dAlbedo*color,mixAlbedo);";
    
    
    m.chunks.combineDiffuseSpecularPS=m.chunks.combineDiffuseSpecularNoReflPS=
        m.chunks.combineDiffusePS=m.chunks.combineDiffuseSpecularNoReflSeparateAmbientPS=
        replace0+"\n"+
        pc.shaderChunks.combineDiffusePS.replace("return dAlbedo * dDiffuseLight;",replace1);
    m.update();
};

G2Toonshader.prototype.setParams=function(){
    if(!this.m)return;
    var m=this.m;
    if(this.colors!=this.uF0.length)
        this.reset();
    m.setParameter('smooths', this.smooths);
    m.setParameter('mixAlbedo', this.mixAlbedo);
    for (var i=0;i<this.uF0.length;i++){
        var c=this.uF0[i].color;
        m.setParameter('uF'+i, this.uF0[i].activation);
        m.setParameter('cF'+i,[c.r,c.g,c.b]);
    }
    
};


G2Toonshader.prototype.setup=function(mat,clone_){
    if (mat)this.m=clone_?mat.clone():mat;//TODO: to test
    var m;
    
    if(!this.material){
        this.material=new pc.Asset("ToonMaterial"+(G2Toonshader.statics.id++),"material");
        
        m=this.material.resource=new pc.StandardMaterial();
    }else
        m=this.material.resource;
    this.m=m;
    //this.material.chunks={};
    this.reset();this.setParams();
    m.update();
    return this.m;
};


// update code called every frame
G2Toonshader.prototype.update = function(dt) {
    this.setParams();
};
