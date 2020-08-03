var ResolutionTools = pc.createScript('resolutionTools');

ResolutionTools.attributes.add("ratio",{title:"Pixel Ratio",type:"number",default:0});
ResolutionTools.attributes.add("smoothness",{title:"Smoothness",type:"number",default:0,enum:[
    {"NONE":-1},{"AUTO":0},{"PIXELATED":1},{"CRISP-EDGES":2}
]});
/*
ResolutionTools.attributes.add("orientation",{title:"Set Orientation",type:"number",default:-1,enum:[
    {"none":-1},{"any":0}, {"natural":1}, {"landscape":2}, {"portrait":3} , {"portrait-primary":4} ,
    {"portrait-secondary":5} ,{"landscape-primary":6} ,{"landscape-secondary":7}
]});*/
// initialize code called once per entity
ResolutionTools.prototype.initialize = function() {
    if (this.ratio)this.setResolutionRatio(this.ratio);
    this.setSmoothness(this.smoothness);
    //this.setOrientation(this.orientation);
};

ResolutionTools.prototype.setResolutionRatio=function (ratio_=1){
    pc.app.renderer.device._maxPixelRatio=ratio_;
    window.dispatchEvent(new Event("resize"));  
    
};

ResolutionTools.prototype.setSmoothness=function(rendering_=-1){
    if (rendering_>-1)
        pc.app.renderer.device.canvas.style.imageRendering=
            ["auto","pixelated","crisp-edges"][rendering_];
};

ResolutionTools.prototype.toggleFullScreen=function(){
    pc.app.graphicsDevice.fullscreen=!pc.app.graphicsDevice.fullscreen;
};

ResolutionTools.prototype.setFullScreen=function(fullScreen_=true){
    pc.app.graphicsDevice.fullscreen=fullScreen_;
};
/*
 * Change orientation to one of the following:  "any" "natural" "landscape" "portrait" 
 * "portrait-primary" "portrait-secondary" "landscape-primary" "landscape-secondary"
 * @param {string} type_ orientation type
 

 */ 
ResolutionTools.prototype.setOrientation=function(type_="any"){
    if (!isNaN(type_))
        if (type_==-1)return; else 
            type_=["any" ,"natural" ,"landscape" ,"portrait","portrait-primary", "portrait-secondary",
                   "landscape-primary", "landscape-secondary"] [type_];
    try{screen.orientation.lock(type_);}catch(e){console.error("Orientation not available.");}
};
// swap method called for script hot-reloading
// inherit your script state here
// ResolutionTools.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/