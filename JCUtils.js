var jc = jc || {};



jc.moveActionWithCallback = function(point, rate, callback){
    var action = cc.MoveTo.create(rate, point);
    return jc.actionWithCallback(action, callback);

}

jc.cap = function(point, rect){
    if (point.x < rect.x){
        point.x = rect.x;
    }
    if (point.y < rect.y){
        point.y = rect.y
    }
    if (point.x > rect.width){
        point.x = rect.width;
    }
    if (point.y > rect.height){
        point.y = rect.height;
    }
}

jc.makeSpriteWithPlist = function(plist, png, startFrame){
    var sprite = new cc.Sprite();
    cc.SpriteFrameCache.getInstance().addSpriteFrames(plist);
    cc.SpriteBatchNode.create(png);

    //todo change to size of sprite
    var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(startFrame);
    sprite.initWithSpriteFrame(frame);
    return sprite;
}

jc.shade = function(item, op){
    if (!item.shade){
        item.shade = cc.LayerColor.create(cc.c4(15, 15, 15, 255));
        item.getParent().addChild(item.shade);
    }
    var pos = item.getPosition();
    var size = item.getBoundingBox().size;
    pos.x -= size.width/2;
    pos.y -= size.height/2;
    item.shade.setPosition(pos);
    item.shade.setContentSize(size);

    item.shade.setOpacity(0);
    item.getParent().reorderChild(item.shade,0);
    if (op == undefined){
        op = jc.defaultFadeLevel
    }
    jc.fadeIn(item.shade, op);

}

jc.unshade = function(item){
    jc.fadeOut(item.shade);
}

jc.fadeIn= function(item, opacity , time, action){
    if (!time){
        time = jc.defaultTransitionTime;
    }
    if (!opacity){
        opacity = jc.defaultFadeLevel;
    }
    if (!item){
        item = this;
    }

    var actionFadeIn = cc.FadeTo.create(time,opacity);
    if (action){
        var func = cc.CallFunc.create(action);
        var seq = cc.Sequence.create(actionFadeIn, func);
        item.runAction(seq);
    }else{
        item.runAction(actionFadeIn);
    }
}

//expects to be bound to cocos2d layer
jc.swapFade = function(swapOut, swapIn){
    if (swapOut){
        jc.fadeOut(swapOut, jc.defaultTransitionTime/4, function(){
            this.removeChild(swapOut);
            doFadeIn.bind(this)();
        }.bind(this));
    }else{
        doFadeIn.bind(this)();
    }

    function doFadeIn(){
        swapIn.setOpacity(0);
        this.addChild(swapIn);
        jc.fadeIn(swapIn, 255, jc.defaultTransitionTime/4);
    }
}

jc.fadeOut=function(item, time, action){
    if (!time){
        time = jc.defaultTransitionTime;
    }
    if (!item){
        item = this;
    }

    var actionFadeOut = cc.FadeTo.create(time,0);
    if (action){
        var func = cc.CallFunc.create(action);
        var seq = cc.Sequence.create(actionFadeOut, func);
        item.runAction(seq);
    }else{
        item.runAction(actionFadeOut);
    }



}

jc.makeAnimationFromRange = function(name, config){

    //animate it
    if (config.name){
        name = config.name;
    }

    var frames = [];
    var first =1;
    if (config.first){
        first = config.first;
    }

    for(var i =first;i<=config.frames;i++){
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(name + "." + i + ".png");
        frames.push(frame);
    }

    //reverse
    if (config.rev){
        for(var i =config.frames;i>=first;i--){
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(name + "." + i + ".png");
            frames.push(frame);
        }
    }


    var animation = cc.Animation.create(frames, config.delay);
    if (!config.times){
        return cc.RepeatForever.create(cc.Animate.create(animation));
    }else{
        return cc.Repeat.create(cc.Animate.create(animation), config.times);
    }

}

jc.playTintedEffectOnTarget = function(name, target, layer, child, r, g, b){
    var effect = jc.playEffectOnTarget(name, target, layer, child);
    if (effect){
        var fillColor = new cc.Color3B();
        fillColor.r =r;
        fillColor.b = b;
        fillColor.g = g;
        effect.setColor(fillColor);
    }

    return effect;
}

jc.playEffectOnTarget = function(name, target, layer, child){

    var config = effectsConfig[name];

    if (!target.effectAnimations){
        target.effectAnimations = {};
    }

    if (!target.effectAnimations[name]){
        target.effectAnimations[name] = {
                                            "sprite":jc.makeSpriteWithPlist(config.plist, config.png, config.start),
                                            "animation":jc.makeAnimationFromRange(name, config )
        };
    }


    if (target.effectAnimations[name].playing){
        return; //don't play if it's already playing on me
    }

    var parent;
    if (child){
        parent = target;
    }else{
        parent = layer;
    }

    var effect = target.effectAnimations[name].sprite;
    var effectAnimation = target.effectAnimations[name].animation;
    effect.setVisible(true);
    parent.addChild(effect);

    if (child){
        jc.setChildEffectPosition(effect, target, config);
    }else{
        jc.setEffectPosition(effect, target, config);
    }


    if (config.zorder == "behind" && !child){
        parent.reorderChild(effect,target.getZOrder()-1);
    }else if (config.zorder == "behind" && child) {
        parent.reorderChild(effect,-1);
    }
    else{
        parent.reorderChild(effect,target.getZOrder());
    }

    if (config.times){
        var onDone = cc.CallFunc.create(function(){
            parent.removeChild(effect);
            target.effectAnimations[name].playing =false;
        }.bind(this));

        var action = cc.Sequence.create(effectAnimation, onDone);
        effect.runAction(action);
    }else{
        effect.runAction(effectAnimation);
    }

    target.effectAnimations[name].playing =true;

    return effect;

}

jc.playEffectAtLocation = function(name, location, z, layer){

    var config = effectsConfig[name];
    var effect = jc.makeSpriteWithPlist(config.plist, config.png, config.start);
    var etr = effect.getTextureRect();
    var effectAnimation = jc.makeAnimationFromRange(name, config );
    //adjust location so we center ourselves on it...?

    effect.setPosition(location);
    effect.setVisible(true);
    layer.addChild(effect);
    layer.reorderChild(effect,z);
    if (config.times){
        var onDone = cc.CallFunc.create(function(){
            layer.removeChild(effect);
        }.bind(this));
        var action = cc.Sequence.create(effectAnimation, onDone);
        effect.runAction(action);
    }else{
        effect.runAction(effectAnimation);
    }
    return effect;

}

jc.setChildEffectPosition = function(effect, parent, config){
    var placement = config.placement;
    var effectPos = cc.p(0,0);
    var cs = parent.getContentSize();
    var tr = parent.getTextureRect();
    var etr = effect.getContentSize();

    if (placement){
        if (placement == 'bottom') {
            effectPos.y += etr.height/2; //up to feet
            effectPos.x += cs.width/2;
        }else if (placement == 'center'){
            effectPos.x += cs.width/2;
            effectPos.y += etr.height;
        }
        else if (placement == 'base2base'){
            effectPos.x += cs.width/2;
            effectPos.y -= cs.height/2;
            effectPos.y += etr.height;

        }else{
            throw "Unknown effect placement.";
        }
    }

    if (config.offset){
        var newPos = cc.pAdd(effectPos, config.offset);
        effect.setPosition(newPos);
    }else{
        effect.setPosition(effectPos);
    }

}

jc.setEffectPosition = function(effect, parent, config){
    var placement = config.placement;
    var base = parent.getBasePosition();
    var tr = parent.getTextureRect();
    var etr = effect.getTextureRect();

    if (placement){
        if (placement == 'bottom') {
            base.y += etr.height/2;
        }else if (placement == 'center'){
            base.y += tr.height/2;
        }else if (placement == 'top'){
            effect.setPosition(base);
        }else if (placement == 'base2base'){
            base.y += etr.height;
        }else{
            throw "Unknown effect placement.";
        }
    }

    if (config.offset){
        var newPos = cc.pAdd(base, config.offset);
        effect.setPosition(newPos);
    }else{
        effect.setPosition(base);
    }

}

jc.genericPower = function(name, value, attacker, target, config, element){
    if (!config){
        config = spriteDefs[value].damageMods[name];
    }
    var effect = {};
    effect = _.extend(effect, config); //add all props in config to effect
    effect.name = name;
    if (attacker){
        effect.origin = attacker;
    }else{
        effect.element = element;
    }

    target.addEffect(effect);
}

jc.genericPowerApply = function(effectData, effectName, varName,bObj){
    //examine the effect config and apply burning to the victim
    if (GeneralBehavior.applyDamage(bObj.owner, effectData.origin, effectData.damage, effectData.element)){
        if (!bObj.owner[varName]){
            bObj.owner[varName] = jc.playEffectOnTarget(effectName, bObj.owner, bObj.owner.getZOrder(), bObj.owner.layer, true);
        }
    }
}

jc.genericPowerRemove = function(varName,effectName, bObj){
    if (bObj.owner[varName]){
        bObj.owner.removeChild(bObj.owner[varName]);
    }
    delete bObj.owner[varName];
    bObj.owner.effectAnimations[effectName].playing = false;
}

jc.movementType = {
    "air":0,
    "ground":1
}

jc.targetType = {
    "air":0,
    "ground":1,
    "both":2,
}

jc.elementTypes = {
    "void":0,
    "water":1,
    "fire":2,
    "life":3,
    "none":4,
    "earth":5,
    "air":7
}

jc.getElementType = function(id){
    for(var type in jc.elementTypes){
        if (jc.elementTypes[type] == id){
            return type;
        }
    }
}

jc.checkPower = function(charName, powerName){

}

jc.insideEllipse = function(major, minor, point, center){
    //http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse
    var xDiff = point.x - center.x;
    var yDiff = point.y - center.y;
    var majorSq = major*major;
    var minorSq = minor*minor;

    var final = ((xDiff*xDiff)/majorSq) + ((yDiff*yDiff)/minorSq);
    return final <1;
}

jc.getCharacterPortrait = function(name, size){
    var card =  jc.getCharacterCard(name);
    return card; //todo - revisit - this code is broken
    return jc.portraitFromCard(name, card,size);
}

jc.getCharacterCardFrame = function(name){
    var frame = name+".pic.png";
    var indexNumber = spriteDefs[name].cardIndex;
    if (indexNumber == undefined){
        indexNumber = 0;
    }

    cc.SpriteFrameCache.getInstance().addSpriteFrames(cardsPlists[indexNumber]);
    cc.SpriteBatchNode.create(cardsPngs[indexNumber]);

    return cc.SpriteFrameCache.getInstance().getSpriteFrame(frame);
}

jc.getCorrectPortraitPosition = function(position){
    //portraits coords are ipadhd
    //for now, just scale to iphone 3.
    //todo: add scale for device
    var newPos = cc.p(position.x, position.y);
    var augx = newPos.x*0.234375;
    var augy = newPos.y*0.234375;
    newPos.x=augx;
    newPos.y=augy;
    return newPos;
}

jc.portraitFromCard = function(name,card, size){
    var capturePos = jc.getCorrectPortraitPosition(spriteDefs[name].portraitXy);
    if (!capturePos){
        var cardSize = card.getContentSize();
        capturePos = cc.p(cardSize.width/2,cardSize.height/2);
    }
    var tr = card.getTextureRect();
    var cs = card.getContentSize();
    var widthDiff = cs.width - tr.width;
    var heightDiff = cs.height - tr.height;
    capturePos.x-=widthDiff;
    capturePos.y-=heightDiff;
    var rect = cc.RectMake(capturePos.x, capturePos.y,size.width,size.height);
    card.setTextureRect(rect);
    card.setContentSize(size);
    return card;
}

jc.getCharacterCard = function(name){
    var frame = name+".pic.png";
    var indexNumber = spriteDefs[name].cardIndex;
    if (indexNumber == undefined){
        indexNumber = 0;
    }
    return jc.makeSpriteWithPlist(cardsPlists[indexNumber], cardsPngs[indexNumber], frame);
}





jc.formations = {
    "4x3":[
        {"x":225,"y":225},
        {"x":225,"y":375},
        {"x":225,"y":525},
        {"x":225,"y":675},
        {"x":75,"y":300},
        {"x":75,"y":450},
        {"x":75,"y":600},

    ],
    "4x4x4a":[
        {"x":800,"y":400},
        {"x":800,"y":500},
        {"x":800,"y":600},
        {"x":800,"y":700},
        {"x":700,"y":400},
        {"x":700,"y":500},
        {"x":700,"y":600},
        {"x":700,"y":700},
        {"x":550,"y":400},
        {"x":550,"y":500},
        {"x":550,"y":600},
        {"x":550,"y":700},
    ],

    "4x4x4b":[
        {"x":1100,"y":400},
        {"x":1100,"y":500},
        {"x":1100,"y":600},
        {"x":1100,"y":700},
        {"x":1200,"y":400},
        {"x":1200,"y":500},
        {"x":1200,"y":600},
        {"x":1200,"y":700},
        {"x":1350,"y":400},
        {"x":1350,"y":500},
        {"x":1350,"y":600},
        {"x":1350,"y":700},
    ]

};
