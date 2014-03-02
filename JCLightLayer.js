jc.LightLayer = jc.TouchLayer.extend({

    init: function(litRect) {
        if (this._super(jc.touchPriorityMask)) {

            //create a full size black semi opaque layer color

            //drop a clip node in for the area that is to be made transparent

            //area is expressed in screen coords.

            //suck up any touches that are outside the transparent area

            //layer
            if (!this.shade){
                this.shade = cc.LayerColor.create(cc.c4(0, 0, 0, 255));
            }
            this.setContentSize(this.getParent().winSize);
            this.setPosition(cc.p(0,0));
            this.shade.setPosition(cc.p(0,0));
            this.shade.setContentSize(this.winSize);
            this.shade.setVisible(true);
            this.shade.setOpacity(0);
            this.bubbleAllTouches(true);



            //we need to create a ccnode, which will be a stencil for ccclipingnode, draw node is a good choice for that
            var stencil = cc.DrawNode.create();
            stencil.drawPolyWithRect(litRect, cc.c4f(0, 0, 0, 255));


            this.clipper = new cc.ClippingNode();
            this.clipper.init(stencil);
            this.clipper.addChild(this.shade);
            this.clipper.setInverted(true);
            this.reorderChild(this.shade,jc.topMost);
            this.getParent().reorderChild(this,jc.topMost);
            this.addChild(this.clipper);
            this.reorderChild(this.clipper,jc.topMost);
            this.litRect = litRect;
            jc.fadeIn(this.shade, 200);
            this.hackOn();


            return true;
        } else {
            return false;
        }
    },
    makeClip:function(rect){
        this.litRect = rect;
    },
    targetTouchHandler:function(type, touch, sprites) {
        if (cc.rectContainsPoint(this.litRect, touch)){
            return false; //allow it through
        }else{
            return true; //swallow
        }
    }

});