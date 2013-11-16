var jc = jc || {};
jc.GameObject = function(){

}

jc.GameObject.prototype.init = function(){
    this.hp = this.MaxHP;
}

//modified version of _.extend
jc.inherit = function(child, parent){
    for (var prop in parent) {
        if (child[prop]==undefined){
            child[prop] = parent[prop];
        }
    }
    return child;
}
