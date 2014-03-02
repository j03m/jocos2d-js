
var jc = jc || {};
var tracers = {
	'error':1,
    'general':0,
	'touch':0,
    'touchcore':0,
    'touchlayer':0,
    'touchid':0,
    'touchout':0,
    'loader':0,
	'mouse':0,
	'states':0,
	'sprite':0,
    'healthbar':0,
    'move':0,
    'updatetime':0,
	'memory':0,
	'tests':0,
    'arena':0,
	'requestManager':0,
    'gameplay':0 ,
    'mainLayer':0,
    'resource':0,
    'camera':0,
    'console':0,
    'zerverpipe':0,
    'ui':0,
    'scroller':0,
    'utilEffects':0,
    'rangeBehavior':0,
    'defenderBehavior':0,
    'designerout':1,
    'jc.shade':0,
    'setText':0,
    'missile':0,
    'map':1,
    'bubble':0,
    'tutorials':0,
    'blobOperations':0,
    'selectTeam':0,
    'Arena':0,
    'ArenaMultiTouch':0,
    'MultiTouch':0,
    'MultiTouchDetails':0,
    'DragDetails':0,
    'TouchClaims':0,
    'DragTaper':0,
    'ArenaSelection':0,
    'bgtexture':0,
    'Borders':0,
    'spritesonboard':0,
    'spritecommands':0,
    'batching':0,
    'state':0,
    'targetting':0,
    'missiles':0,
    'resolutions':0,
    'multipack':0,
    'lockon':0
};

jc.log = function(categories, msg){

    if (categories instanceof Array){
        for (var i =0;i<categories.length; i++){
            if (tracers[categories[i]]!=1){
                return;
            }
        }
    }else{
        if (tracers[categories]!=1){
            return;
        }
    }

	if (typeof msg == 'string' || msg instanceof String){
		cc.log(JSON.stringify(categories) + ': ' + msg);
	}else{
		cc.log(JSON.stringify(categories) + ': ' + JSON.stringify(msg, null,'\t'));
	}

};

jc.clone = function (obj){
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj)
        temp[key] = jc.clone(obj[key]);
    return temp;
}