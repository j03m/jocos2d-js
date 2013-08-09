var jc = {};
var tracers = {
	'general':0,
	'touch':0,
    'touchcore':0,
	'mouse':0,
	'states':0,
	'sprite':0,
    'move':0,
    'updatetime':0,
	'memory':0,
	'tests':0,
	'requestManager':0,
    'gameplay':0
};

jc.log = function(categories, msg){
	for (var i =0;i<categories.length; i++){
		if (tracers[categories[i]]!=1){
			return;
		}
	}
	if (typeof msg == 'string' || msg instanceof String){
		cc.log(msg);			
	}else{
		cc.log(JSON.stringify(msg));
	}

};