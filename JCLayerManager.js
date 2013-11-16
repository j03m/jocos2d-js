var jc = jc || {};
var LayerManager = function(){
    this.layers = [];
}

LayerManager.prototype.pushLayer = function(layer, z){
    layer.resume();
    if (this.currentLayer){
        this.currentLayer.darken();
        this.currentLayer.pause();
        this.currentLayer.addChild(layer, z);
    }else{
        this.currentLayer = layer;
    }

    layer.setPosition(cc.p(0,0));
    this.layers.push(layer);

//    layer.start();

}

LayerManager.prototype.popLayer = function(){
    var layer = this.layers.pop();
    if (this.layers.length>0){
        this.currentLayer = this.layers[this.layers.length-1];
    }else{
        throw "No Layers"; //TODO: transition to previous scene using scene manager?
    }

    layer.pause();
    this.currentLayer.removeChild(layer);
    this.currentLayer.undarken();
    this.currentLayer.resume();
    this.currentLayer.onShow();
}


jc.layerManager = new LayerManager();