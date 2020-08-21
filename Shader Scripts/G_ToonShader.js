//For questions, refer to https://github.com/guzuligo
//Version 0.0.1
var GToonShader = pc.createScript('gToonShader');
GToonShader.attributes.add("diffuse",{type:"asset",title:"Diffuse",assetType:"texture"});
GToonShader.attributes.add("smooths",{type:"number",title:"Smoothness",min:0,max:1.0,default:0});
GToonShader.attributes.add("uF0",{type:"json",title:"Colors",array:true,schema:[
    {name:"activation",type:"number",min:-0.01,max:1,default:.5},{name:"color",type:"rgba"}
]});
//GToonShader.attributes.add("uFc",{type:"rgba",array:true});

// initialize code called once per entity
GToonShader.prototype.initialize = function() {
    this.reset();
    this.on("attr:diffuse",()=>{
        this.reset();
    });
};

GToonShader.prototype.colors=0;

GToonShader.prototype.reset=function(){
    var vshader_;{
    vshader_="attribute vec4 aPosition;\n\
        attribute vec3 aNormal;\n\
        attribute vec2 aUv0;\n\
        uniform mat4   matrix_viewProjection;\n\
        uniform mat4   matrix_model;\n\
        uniform mat4   matrix_view;\n\
        uniform mat3   matrix_normal;\n\
        uniform vec3   uLightPos;\n\
        varying float vertOutTexCoord;\n\
        varying vec2 texCoord;\n\
        void main(void) {\n\
            mat4 modelView = matrix_view * matrix_model;\n\
            mat4 modelViewProj = matrix_viewProjection * matrix_model;\n\
            vec3 eyeNormal = normalize(matrix_normal * aNormal);\n\
            vec4 vertexPos = modelView * aPosition;\n\
            vec3 vertexEyePos = vertexPos.xyz / vertexPos.w;\n\
            vec3 lightDir = normalize(uLightPos - vertexEyePos);\n\
            vertOutTexCoord = max(0.0, dot(eyeNormal, lightDir));\n\
            texCoord = aUv0;\n\
            gl_Position = modelViewProj * aPosition;\n\
        }";
    }
    var fshader_;{
        fshader_="precision "+this.app.graphicsDevice.precision+" float;\n\
        uniform sampler2D uTexture;\n\
        uniform float smooths;\n\
        uniform float uF;xReplace0\n\
        //uniform float  uF0;\n\
        //uniform vec4  cF0;\n\
        varying float vertOutTexCoord;\n\
        varying vec2 texCoord;\n\
        void main(void)     \n\
        {\n\
            float v = vertOutTexCoord; vec4 color=vec4(1.);//=cF0; \nxReplace1\n\
            gl_FragColor =  color;//vec4(uF0[1],.0,.0, 1.0);\n\
        }";
    }
    //fshader_=fshader_.replace(/XuF0/g,this.uF0.length);
    var replace0="";
    var replace1="";//vec4 color;";
    this.colors=this.uF0.length;
    for (var i=0;i<this.uF0.length;i++){
        replace0+="\nuniform float  uF"+i+";";
        replace0+="\nuniform vec4   cF"+i+";";
        replace1+="\ncolor=(1.-smoothstep(uF"+(i)+"-smooths,uF"+(i)+",v))*color+(smoothstep(uF"+(i)+"-smooths,uF"+(i)+",v))*cF"+i+";";
    }
    
    if (this.diffuse)
        replace1+="\ncolor*=texture2D (uTexture, texCoord);"
    
    fshader_=fshader_.replace("xReplace0",replace0);
    fshader_=fshader_.replace("xReplace1",replace1);
    
    
    var shaderDefinition = {
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aUv0: pc.SEMANTIC_TEXCOORD0,
            aNormal: pc.SEMANTIC_NORMAL,
            //aUv: pc.SEMANTIC_TEXCOORD0                   
        },
        vshader: vshader_,
        fshader: fshader_,
    };
    
    this.shader = new pc.Shader(this.app.graphicsDevice, shaderDefinition);
    this.material = new pc.Material();
    this.material.shader=(this.shader);
    
    this.entity.model.meshInstances[0].material = this.material;
    this.material.setParameter('smooths', this.smooths);
    for (var i=0;i<this.uF0.length;i++){
        var c=this.uF0[i].color;
        this.material.setParameter('uF'+i, this.uF0[i].activation);
        this.material.setParameter('cF'+i,[c.r,c.g,c.b,c.a]);
    }
    
    if (this.diffuse){//console.log("YO")
        this.material.setParameter('uTexture', this.diffuse.resource);
    }
    //this.material.
};


// update code called every frame
GToonShader.prototype.update = function(dt) {
    if(this.colors!=this.uF0.length)
        this.reset();
    this.material.setParameter('smooths', this.smooths);
    for (var i=0;i<this.uF0.length;i++){
        var c=this.uF0[i].color;
        this.material.setParameter('uF'+i, this.uF0[i].activation);
        this.material.setParameter('cF'+i,[c.r,c.g,c.b,c.a]);
    }
    
};
