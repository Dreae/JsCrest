function APIObject(data, connection) {
    var self = this;
    for(k in data) {
        if(data.hasOwnProperty(k)){
            if(Array.isArray(data[k])) {
                self[k] = wrap_array(data[k], connection);
            } else if(typeof data[k] === 'object') {
                self[k] = new APIObject(data[k], connection);
            } else {
                self[k] = data[k];
            }
        }
    }
    this.conn = connection;
    this.load = function(){
        var callback = undefined;
        var params = undefined;
        for(var i = 0; i < arguments.length; i++){
            if(typeof arguments[i] === 'function'){
                callback = arguments[i];
            } else if (typeof arguments[i] === 'object'){
                params = arguments[i];
            }
        }
        if('href' in self){
            self.conn.getResource(self.href, params, callback);
        } else {
            if(typeof callback !== 'undefined') {
                callback(self);
            }
        }
    }
}
function wrap_array(data, connection) {
    return data.map(function(item){
        if(Array.isArray(item)) {
            return wrap_array(item, connection);
        } else if(typeof item === 'object') {
            return new APIObject(item, connection);
        } 
        return item;
    });
};

module.exports = APIObject;
