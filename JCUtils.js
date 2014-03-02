var jc = jc || {};
jc.teamSize = 5;
jc.totalCreeps = 5;


jc.config = {};
jc.config.batch = false;
jc.config.think = true;
jc.config.harlemShake = false;
jc.config.blink = false
jc.config.blinkAndDance = false;
jc.config.frozen = false;
jc.config.flock = true;
jc.config.creeps = true;

jc.attackStatePrefix = {};
jc.attackStatePrefix.attack = 'attack';
jc.attackStatePrefix.close = 'attackClose';
jc.attackStatePrefix.special = 'special';


Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

jc.adjustPosition = function(x,y){
    var pos = this.getPosition();
    pos.x+=x;
    pos.y+=y;
    this.setPosition(pos);
}

cc.Layer.prototype.adjustPosition = jc.adjustPosition;
cc.Sprite.prototype.adjustPosition = jc.adjustPosition;

cc.LabelTTF.prototype.setText = function(txt){
    this.setString(txt);
    jc.log(['setText'], 'setting text');
    if (jc.isBrowser){
        this.enableStroke(cc.black(), 8*jc.assetScaleFactor);
    }else{
        this.enableStroke(cc.black(), 1*jc.assetScaleFactor);
    }

    jc.log(['setText'], 'enabled stroke');
}

cc.Sprite.prototype.oldSetColor = cc.Sprite.prototype.setColor;

if (jc.isBrowser){
    //dont' do this on the web, crushes perf
    jc.dumpStack = function(who){
        jc.log(who, console.trace());
    }


    cc.Sprite.prototype.setColor = function(){
        jc.log(['console'], "setColor called on the web - don't do it man.");
    };

}


if (!jc.isBrowser){
    //native bindings to setScale only take one param
    cc.Sprite.prototype.setScale = function(x,y){
        this.setScaleX(x);
        this.setScaleY(y);
    };

    //origin required in web, doesn't exist native;
    cc.Sprite.prototype.nativeBoundingBox = cc.Sprite.prototype.getBoundingBox;
    cc.Sprite.prototype.getBoundingBox = function(){
        var bb = this.nativeBoundingBox();
        bb.origin = cc.p(bb.x, bb.y);
        bb.size = cc.size(bb.width, bb.height);
        return bb;
    }
    jc.dumpStack = function (who) {
        var stack = new Error().stack;
        jc.log(who, stack);
    }

    cc.Sprite.prototype.setFlippedX = cc.Sprite.prototype.setFlipX;
}


jc.cardScale = 0.85;
jc.scaleCard = function(card){
    card.setScale(card.getScaleX()*jc.cardScale, card.getScaleY()*jc.cardScale);
}

jc.isAheadOfMe = function(seeking, target){
    var pos = seeking.getBasePosition();
    var targetPos = target.getBasePosition();
    if (seeking.team == 'a'){
        if (pos.x <= targetPos.x ){
            return true;
        }else{
            return false;
        }
    }else{
        if (pos.x >= targetPos.x ){
            return true;
        }else{
            return false;
        }

    }


}

jc.makeStats = function(name){
    if (name){
        var def = spriteDefs[name];
        var stats ={};
        stats.hp = def.gameProperties.MaxHP;
        stats.damage = def.gameProperties.damage;
        stats.armor = 0; //todo: implement
        stats.speed = def.gameProperties.speed;
        stats.power = jc.getPowerRating(def);
        stats.range = def.gameProperties.targetRadius;
        return stats;
    }else{
        var stats ={};
        stats.hp = 0;
        stats.damage = 0;
        stats.armor = 0; //todo: implement
        stats.speed = 0;
        stats.power = 0;
        stats.range = 0;
        return stats;

    }

}

jc.getPowerRating= function(def){
    return 10; //todo : this is going to change to tier
}

jc.valuePerSecond = function(value, interval){
        if (!interval){
            interval = 1;
        }
        return value * (1/interval);

}


jc.swapSpriteFrameName = function(sprite, frameName){
    var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(frameName);
    if (!frame){
        throw "Frame: " + frameName +  " not in cache.";
    }
    sprite.setDisplayFrame(frame);
}

jc.swapSpriteFrame= function(sprite, frame){
    sprite.setDisplayFrame(frame);
}

jc.elementSprite = function(name){
    if (name == "void"){
        return "elements_0000_void.png";
    }

    if (name == "water"){
        return "elements_0001_water.png";
    }

    if (name == "fire"){
        return "elements_0002_fire.png";
    }

    if (name == "life"){
        return "elements_0003_life.png";
    }

    if (name == "earth"){
        return "elements_0004_earth.png";
    }

    if (name == "air"){
        return "elements_0005_air.png";
    }

    if (name == "none"){
        return undefined;
    }

    throw "Illegal element type: " + name;

}

jc.moveActionWithCallback = function(point, rate, callback){
    var action = cc.MoveTo.create(rate, point);
    return jc.actionWithCallback(action, callback);

}

jc.cap = function(point, rect){
	if (!point || !rect){
		console.log("Point or rect not passed to cap?");
		console.log("point:")
		console.log(point);
		console.log("rect:")
		console.log(point);
		jc.dumpStack(['console']);
		return;
		
	}
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


//todo: down the road we are going to have to have 1 sprite factory that
//accepts params and a layername and keeps an index of sprites created for that layer.
//that will allow a layer to release all of it's sprites in one call. Right now, anything
//created here leaks mem
jc.makeSimpleSprite = function (image){
    var sprite = new cc.Sprite();
    sprite.initWithSpriteFrameName(image);
    sprite.retain();
    return sprite;
}

jc.makeSpriteFromFile = function (image){
    var frame = cc.SpriteFrame
    cc.SpriteFrameCache.getInstance().addSpriteFrame()

    var sprite = new cc.Sprite();

    sprite.initWithFile(image);
    sprite.retain();
    return sprite;
}

jc.parsed = {};
jc.makeSpriteWithPlist = function(plist, png, startFrame){
    var sprite = new cc.Sprite();
    if (!jc.parsed[plist]){
        cc.SpriteFrameCache.getInstance().addSpriteFrames(plist);
        jc.parsed[plist]=true;
    }

    var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(startFrame);
    if (!frame){
        throw "Frame: " + startFrame +  " not in cache.";
    }
    sprite.initWithSpriteFrame(frame);
    sprite.retain();
    return sprite;
}


jc.makeSpriteWithMultipackPlist = function(plists, pngs, startFrame){
    var sprite = new cc.Sprite();
    for(var i =0;i<plists.length;i++){
        var plist = plists[i];
        var png = pngs[i];
        if (!jc.parsed[plist]){
            cc.SpriteFrameCache.getInstance().addSpriteFrames(plist);
            jc.parsed[plist]=true;
        }
    }

    var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(startFrame);
    if (!frame){
        throw "Frame: " + startFrame +  " not in cache.";
    }
    sprite.initWithSpriteFrame(frame);
    sprite.retain();
    return sprite;
}

jc.shadow = function(item, op){
    if (this.isBrowser){
        //jc.shade(item,op);
        item.setColor(cc.black());
    }else{
        item.setColor(cc.black());
    }
}
jc.shade = function(item, op){
    if (!item.shade){
        jc.log(['jc.shade'], 'layercolor creation');
        item.shade = cc.LayerColor.create(cc.c4(15, 15, 15, 255));
        jc.log(['jc.shade'], 'getParent');
        var parent = item.getParent();
        jc.log(['jc.shade'], 'is parent undefined? ' + (parent == undefined));
        parent.addChild(item.shade);
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
    if (!jc.isBrowser){
        jc.unshadeNative(item);
        return;
    }
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
jc.swapFade = function(swapOut, swapIn, action){

    jc.log(['utilEffects'], "fade out name:" + swapOut.name);
    jc.log(['utilEffects'], "fade in name:" + swapIn.name);

    if (swapOut){
        jc.fadeOut(swapOut, jc.defaultTransitionTime/4, function(){
            this.removeChild(swapOut, false);
            doFadeIn.bind(this)();
        }.bind(this));
    }else{
        doFadeIn.bind(this)();
    }

    function doFadeIn(){
        swapIn.setOpacity(0);

        jc.fadeIn(swapIn, 255, jc.defaultTransitionTime/4, action);
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

jc.getVectorTo = function(to, from){
    if (!to || !from){
        throw "To and From positions required!";
    }
    var direction = cc.pSub(to,from);
    var xd = Math.abs(to.x - from.x);
    var yd = Math.abs(to.y - from.y);
    xd = Math.round(xd / 10) * 10;
    yd = Math.round(yd / 10) * 10;
    var distance = cc.pLength(direction);
    return {direction:direction, distance:distance, xd:xd, yd:yd};
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
        if (!frame){
            throw "Couldn't get a frame for: " + name + "." + i + ".png" + " is your naming convention off?";
        }
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
        var rf = cc.RepeatForever.create(cc.Animate.create(animation));
        rf.retain(); //j03m fix leak
        return rf;
    }else{
        if (!config.times){
            jc.log(['error'], 'Data issue - animation: ' + name + ' configured as a hit without # of plays. A value for .times must be defined. Defaulting to 1');
            config.times = 1;

        }

        var r = cc.Repeat.create(cc.Animate.create(animation), config.times);
        if (r == undefined){
            jc.log(['error'], 'could not create action in make animation from range.');
        }
        r.retain();  //j03m fix leak
        return r;
    }

}

jc.playTintedEffectOnTarget = function(name, target, layer, child, color){
    var effect = jc.playEffectOnTarget(name, target, layer, child);
    if (effect){
        effect.setColor(color);
    }

    return effect;
}

jc.centerThisPeer=function(centerMe, centerOn){
    centerMe.setPosition(centerOn.getPosition());
},

jc.centerThisChild=function(centerMe, centerOn){
    var dim = centerOn.getContentSize();
    centerMe.setPosition(cc.p(dim.width/2,dim.height/2));
},

jc.scaleTo = function(scaleMe, toMe){
    var currentSize = scaleMe.getBoundingBox().size;
    var toSize = toMe.getBoundingBox().size;
    var scalex = toSize.width/currentSize.width;
    var scaley = toSize.height/currentSize.height;
    scaleMe.setScaleX(scalex)
    scaleMe.setScaleY(scaley);
}

jc.scaleXTo = function(scaleMe, toMe){
    var currentSize = scaleMe.getBoundingBox().size;
    var toSize = toMe.getBoundingBox().size;
    var scalex = toSize.width/currentSize.width;
    scaleMe.setScaleX(scalex)
    scaleMe.setScaleY(scalex);
}

jc.scaleToCharacter = function(scaleMe, toMe, factor){
    var currentSize = scaleMe.getContentSize();
    var toSize = toMe.getTextureRect();
    var scalex = (toSize.width*factor)/currentSize.width;
    //var scaley = (toSize.height* factor)/currentSize.height;
    var scaley = scalex;
    scaleMe.setScaleX(scalex)
    scaleMe.setScaleY(scaley);
}

jc.playEffectOnTarget = function(name, target, layer, child){

    if (!target){
		return;
	}
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
    if (config.zorder != "shadow"){
        parent.addChild(effect);
    }else{}
    if (config.scaleToTarget){
        jc.scaleToCharacter(effect, target, config.scaleToTarget);
    }
    effect.setVisible(true);
    if (config.zorder == "behind" && !child){
        parent.reorderChild(effect,target.getZOrder()-1);
    }else if (config.zorder == "behind" && child) {
        parent.reorderChild(effect,-1);
    }else if (config.zorder == "front" && child) {
        parent.reorderChild(effect,2);
    }else if (config.zorder == "shadow"){
        layer.reorderChild(effect, jc.shadowZOrder)
    }
    else{
        parent.reorderChild(effect,target.getZOrder());
    }

    if (child){
        jc.setChildEffectPosition(effect, target, config);
    }else{
        jc.setEffectPosition(effect, target, config);
    }




    if (config.times){
        var onDone = cc.CallFunc.create(function(){
            parent.removeChild(effect, false);
            target.effectAnimations[name].playing =false;
        }.bind(this));

        var action = cc.Sequence.create(effectAnimation, onDone);
        effect.runAction(action);
    }else{
        effect.runAction(effectAnimation);
    }

    target.effectAnimations[name].playing =true;

    if (config.flash){
        layer.flash();
    }

    if (config.shake){
        layer.shake();
    }

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
            layer.removeChild(effect, false);
        }.bind(this));
        var action = cc.Sequence.create(effectAnimation, onDone);
        effect.runAction(action);
    }else{
        effect.runAction(effectAnimation);
    }

    if (config.flash){
        layer.flash();
    }

    if (config.shake){
        layer.shake();
    }

    return effect;

}

jc.setChildEffectPosition = function(effect, parent, config){
    var placement = config.placement;
    var effectPos = cc.p(0,0);
    var cs = parent.getContentSize();
    var tr = parent.getTextureRect();
    var etr = effect.getBoundingBox();

    if (placement){
        if (placement == 'bottom') {
            effectPos.x += cs.width/2;
        }else if (placement=='ground'){
            effectPos.y += etr.height/2; //up to feet
            effectPos.x += cs.width/2;
            parent.reorderChild(effect,jc.groundEffectZOrder);

        }else if (placement == 'center'){
            effectPos.x += cs.width/2;
            effectPos.y += tr.height/2;
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
        var tmp = cc.p(config.offset.x, config.offset.y);
        tmp.x*=jc.assetScaleFactor;
        tmp.y*=jc.assetScaleFactor;
        var newPos = cc.pAdd(effectPos, tmp);
        effect.setPosition(newPos);
    }else{
        effect.setPosition(effectPos);
    }

}

jc.setEffectPosition = function(effect, parent, config){
    var placement = config.placement;
    var base = parent.getBasePosition();
    var tr = parent.getTextureRect();
    var etr = effect.getBoundingBox();

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
        var tmp = cc.p(config.offset.x, config.offset.y);
        tmp.x*=jc.assetScaleFactor;
        tmp.y*=jc.assetScaleFactor;

        var newPos = cc.pAdd(base, tmp);
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

jc.toggleVisible=function(element){
    var visible = element.isVisible();
    element.setVisible(!visible);
}

jc.genericPowerApply = function(effectData, effectName, varName,bObj){
    //examine the effect config and apply burning to the victim
    if (bObj.owner.name == 'nexus'){
        return; //no powers effect nexus, only direct
    }
    if (GeneralBehavior.applyDamage(bObj.owner, effectData.origin, effectData.damage, effectData.element)){
        if (!bObj.owner[varName]){
            bObj.owner[varName] = jc.playEffectOnTarget(effectName, bObj.owner, bObj.owner.getZOrder(), bObj.owner.layer, true);
        }
    }
}

jc.genericPowerRemove = function(varName,effectName, bObj){
    if (bObj.owner.name == 'nexus'){
        return; //no powers effect nexus, only direct
    }
    if (bObj.owner[varName]){
        bObj.owner.removeChild(bObj.owner[varName], false);
    }
    delete bObj.owner[varName];

    if (bObj.owner && bObj.owner.effectAnimations && bObj.owner.effectAnimations[effectName]){
		bObj.owner.effectAnimations[effectName].playing = false;
	}
}

jc.movementType = {
    "air":0,
    "ground":1
}

jc.targetType = {
    "air":0,
    "ground":1,
    "both":2
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

jc.elMajor = 4096;
jc.elMinor = 2048;
jc.insideCircle = function(point, center){
    return ((point.x - center.x)^2 + (point.y - center.y)^2 < jc.elMajor^2);
}

jc.insidePlayableRect=function(point){
    return cc.rectContainsPoint(hotr.arenaScene.layer.playableRect, point);
}

jc.insideEllipse = function(point, center){
    //http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse
    var major = jc.elMajor * jc.characterScaleFactor;
    var minor = jc.elMinor * jc.characterScaleFactor;
    var xDiff = point.x - center.x;
    var yDiff = point.y - center.y;
    var majorSq = major*major;
    var minorSq = minor*minor;

    var finalRes = ((xDiff*xDiff)/majorSq) + ((yDiff*yDiff)/minorSq);
    return finalRes <1;
}


jc.getCharacterCardFrame = function(name){
    var frame = jc.getCardFrameName(name);
    var indexNumber = spriteDefs[name].cardIndex;
    if (indexNumber == undefined){
        indexNumber = 0;
    }
    cc.SpriteFrameCache.getInstance().addSpriteFrames(cardsPlists[indexNumber]);
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


jc.getCharacterCard = function(name){
    var frame = jc.getCardFrameName(name);
    var indexNumber = spriteDefs[name].cardIndex;
    if (indexNumber == undefined){
        indexNumber = 0;
    }
    return jc.makeSpriteWithPlist(cardsPlists[indexNumber], cardsPngs[indexNumber], frame);
}

jc.getCardFrameName = function(name){
    return name + "_bg.png";
}


jc.backDropZOrder = -99999999;
jc.shadowZOrder = -99999998;
jc.groundEffectZOrder = -99999997;