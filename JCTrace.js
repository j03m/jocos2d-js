var jc = jc || {};
var tracers = {
	'general':0,
	'touch':0,
    'touchcore':1,
	'mouse':1,
	'states':0,
	'sprite':0,
    'move':0,
    'updatetime':1,
	'memory':1
};

jc.log = function(categories, msg){
	for (var i =0;i<categories.length; i++){
		if (tracers[categories[i]]!=1){
			return;
		}
	}	
	cc.log(msg);	
};