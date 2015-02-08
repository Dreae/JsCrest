var APIObject = require('./apiobject.js');
var expires_re = /max-age=([0-9]+)/;

function parse_cache_control(header){
    if(typeof header !== 'string'){
        return 0;
    }
    if(header.search('no-cache') !== -1){
        return 0;
    }
    var match = header.match(expires_re);
    if(match === null){
        return 0;
    }
    return (new Date().getTime() + (parseInt(match[1]) * 1000));
}

function APIConnection(headers) {
    var self = this;
    this.cache = {};
    this.headers = headers;
    this.getResource = function() {
        var resource = '';
        var callback = undefined;
        var params = '';
        for(var i = 0; i < arguments.length; i++){
            if(typeof arguments[i] === 'string') {
                resource = arguments[i];
            } else if(typeof arguments[i] === 'function'){
                callback = arguments[i];
            } else if(typeof arguments[i] === 'object'){
                params = '?'
                for(k in arguments[i]){
                    if(arguments[i].hasOwnProperty(k)){
                        params += k + '=' + encodeURIComponent(arguments[i][k]);
                    }
                }
            }
        }
        if(resource + params in self.cache){
            if(new Date().getTime() < self.cache[resource + params].expires){
                if(typeof callback !== 'undefined') {
                    callback(self.cache[resource + params].data);
                    return;
                }
            }
        }
        var req = new XMLHttpRequest();
        req.open('get', resource + params, true);
        req.setRequestHeader('Accept', 'application/json');
        if(self.headers){
            for(k in self.headers){
                req.setRequestHeader(k, self.headers[k]);
            }
        }
        
        req.onload = function(res){
            if(res.target.status !== 200) {
                throw "Invalid status code from API: " + res.statusCode;
            }
            var str = ''
            var expires = parse_cache_control(res.target.getResponseHeader('Cache-Control'));
            
            var data = new APIObject(JSON.parse(res.target.response), self);
            if(expires !== 0) {
                self.cache[resource + params] = {"data": data, "expires": expires};
            }
            
            if(typeof callback === 'function') {
                callback(data);
            }
        };
        req.send();
    }
}

module.exports = APIConnection;
