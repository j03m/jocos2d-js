var jc = jc || {};
jc.localstorage = {};
jc.setLocalStorage = function(key, value){
    //ignore result - hack around chrome bugs, must read to set
    jc.getLocalStorage(key);
    sys.localStorage.setItem(key,JSON.stringify(value));
}

jc.getLocalStorage = function(key){
    var val;

    val = jc.localstorage[key];

    if (!val){
        try{
            val = JSON.parse(sys.localStorage.getItem(key));
        }catch(e){
            return undefined;
        }
        if (val){
            jc.localstorage[key]=val;
        }
    }

    return val;

}