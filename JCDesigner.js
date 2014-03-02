var jc = jc || {};
jc.Designer = jc.UiElementsLayer.extend({
    init: function() {
        if (this._super()) {
            cc.SpriteFrameCache.getInstance().addSpriteFrames(uiPlist);
            cc.SpriteFrameCache.getInstance().addSpriteFrames(landingPlist);
            cc.SpriteFrameCache.getInstance().addSpriteFrames(touchUiPlist);
            var guideSprite = new cc.Sprite();
            //guideSprite.initWithFile(guide);
            //cc.SpriteFrameCache.getInstance().addSpriteFrame(guideSprite.displayFrame(), "guide");
            this.designMode = true;
            this.initFromConfig(this.windowConfig);
            return true;
        } else {
            return false;
        }
    },
    onShow:function(){
        this.start();
    },
    targetTouchHandler:function(type, touch, sprites) {
        var sorted = _.sortBy(sprites, function(sprite){
           return sprite.getZOrder() + sprite.getParent().getZOrder();
        });
        var theSprite = sorted[sprites.length-1]
        if (type == jc.touchBegan){
            jc.log(['designerout'], theSprite.name);
            this.moving = theSprite;
            this.startPos = theSprite.getPosition();
            this.lastTouch = touch;
        }
        if (type == jc.touchMoved && this.moving){
            var dx = touch.x - this.lastTouch.x;
            var dy = touch.y - this.lastTouch.y;
            var x = this.startPos.x+dx;
            var y = this.startPos.y+dy;
            this.lastTouch = touch;
            this.startPos = cc.p(x,y);
            this.moving.setPosition(this.startPos);
        }
        if (type == jc.touchEnded){
            this.moving = undefined;
        }
    },
    doClickOn:function(name){
        var theSprite = this[name];
        this.moving = theSprite;
        this.startPos = theSprite.getPosition();
        this.lastTouch = cc.p(0,0);

    },
    dump:function(){
       this.doDump(this, this.windowConfig);
       jc.log(['designerout'], this.windowConfig);
    },
    doDump:function(entity, config){
        var children = entity.getChildren();
        for (var i =0; i<children.length;i++){
            var child = children[i];
            if (child.name){
                config[child.name].pos = child.getPosition();
                config[child.name].z = child.getZOrder();
                if (config[child.name].kids){
                    this.doDump(child, config[child.name].kids);
                }
            }
        }
    },
    windowConfig: {
        "mainFrame": {
            "type": "sprite",
            "blackBox": true,
            "applyAdjustments": true,
            "transitionIn": "top",
            "transitionOut": "top",
            "sprite": "genericBackground.png",
            "z": 0,
            "kids": {
                "squad1Cells": {
                    "isGroup": true,
                    "z": 1,
                    "type": "grid",
                    "cols": 5,
                    "itemPadding": {
                        "top": 3,
                        "left": 4
                    },
                    "input": true,
                    "members": [
                        {
                            "type": "sprite",
                            "input": true,
                            "sprite": "portraitSmallDarkBackground.png"
                        }
                    ],
                    "membersTotal": 5,
                    "sprite": "portraitSmallDarkBackground.png",
                    "pos": {
                        "x": 310,
                        "y": 834
                    }
                },
                "doneButton": {
                    "type": "button",
                    "main": "buttonDone.png",
                    "pressed": "buttonDonePressed.png",
                    "touchDelegateName": "fightStart",
                    "z": 1,
                    "pos": {
                        "x": 1023,
                        "y": 145
                    }
                },
                "banner": {
                    "type": "sprite",
                    "sprite": "buildYourTeamTitle.png",
                    "z": 0,
                    "pos": {
                        "x": 1021,
                        "y": 1020
                    }
                }
            },
            "pos": {
                "x": 1024,
                "y": 777.9999999999999
            }
        }
    }

});


jc.Designer.create = function() {
    var ml = new jc.Designer();
    if (ml && ml.init()) {
        return ml;
    } else {
        throw "Couldn't create the main layer of the game. Something is wrong.";
    }
    return null;
};

jc.Designer.scene = function() {

        jc.Designer.scene = cc.Scene.create();
        jc.Designer.scene.layer = jc.Designer.create();
        jc.Designer.scene.layer.retain();
        jc.Designer.scene.addChild(jc.Designer.scene.layer);
        return jc.Designer.scene;
};

