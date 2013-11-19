var jc = jc || {};

jc.setLocalStorage = function(key, value){
    sys.localStorage[key] = JSON.stringify(value);
}

jc.getLocalStorage = function(key){
    return JSON.parse(sys.localStorage[key]);
}