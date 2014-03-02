var jc = jc || {};
var LayerManager = function(){
    this.layers = [];
}

LayerManager.prototype.pushLayer = function(layer, skip){
    layer.resume();
    if (this.currentLayer){
        this.currentLayer.darken();
        this.currentLayer.pause();
    }
    if (!skip){
        hotr.currentScene.addChild(layer);
    }

    if (this.currentLayer){
        layer.setZOrder(this.currentLayer.getZOrder()+1);
    }
    this.currentLayer = layer;
    this.layers.push(layer);
    layer.setPosition(cc.p(0,0));


//    layer.start();

}

LayerManager.prototype.wipe = function(){
    this.layers = [];
    this.currentLayer = undefined;
}

LayerManager.prototype.popLayer = function(){
    var layer = this.layers.pop();
    if (this.layers.length>0){
        this.currentLayer = this.layers[this.layers.length-1];
    }else{
        throw "No Layers"; //TODO: transition to previous scene using scene manager?
    }

    layer.pause();
    hotr.currentScene.removeChild(layer, false);
    this.currentLayer.undarken();
    this.currentLayer.resume();
    this.currentLayer.onShow();
}


jc.layerManager = new LayerManager();