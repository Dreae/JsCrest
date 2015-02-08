var APIConnection = require('./apiconnection.js');
var cookie = require('cookie');
var querystring = require('querystring');

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function CRESTClient(token) {
    var self = this;
    this.client_id = undefined;
    this.token = token;
    this.conn = (function(){
        if(self.token){
            return new APIConnection({'Authorization': 'Bearer ' + token});
        }
        return new APIConnection();
    })();
    this.endpoint = (this.token) ? 'https://crest-tq.eveonline.com/' : 'https://public-crest.eveonline.com/';
    this.onload = undefined;
    
    var scripts = document.getElementsByTagName( 'script' );
    var me = scripts[scripts.length - 1];
    if(me.src.search(/\?/) !== -1){
        var qs = querystring.parse(me.src.split('?')[1]);
        this.client_id = qs.client_id ? qs.client_id : client_id;
        if(qs.onload){
            var s = qs.onload.split('.');
            var cb = window;
            for(p in s){
                cb = cb[s[p]];
                if(typeof cb === 'undefined'){
                    break;
                }
            }
            this.onload = cb;
        }
    }
    
    this.load = function(callback) {
        crest.conn.getResource(self.endpoint, callback);
    };
    this.authorize = function() {
        var client_id = crest.client_id;
        var scopes = [];
        var redirect = encodeURIComponent(window.location.origin + window.location.pathname);
        var state = generateUUID();
        document.cookie = cookie.serialize('_js_crest_state', state);
        
        if(arguments.length > 0){
            client_id = arguments[0];
        }
        if(arguments.length >= 2){
            scopes = arguments[1];
        }
        if(arguments.length === 3){
            redirect = arguments[2];
        }
        scopes = (scopes.length > 0) ? '&' + scopes.join(',') : '';
        
        var url = 'https://login.eveonline.com/?response_type=token&redirect_uri=' + redirect + '&client_id=' + client_id + scopes + "&state=" + state;
        window.location = url;
    };
    
    if(typeof this.onload === 'function'){
        this.onload(this);
    }
}

global.crest = (function() {
    function parseQS(qs_){
        if('access_token' in qs_){
            var cookies = cookie.parse(document.cookie);
            if(('_js_crest_state' in cookies) && cookies['_js_crest_state'] === qs_.state){
                return new CRESTClient(qs_.access_token);
            }
        }
    }
    var client = undefined;
    var qs = querystring.parse(window.location.search.replace(/\?+/, ''));
    client = parseQS(qs);
    if(client){
        return client;
    }
 
    var qs = querystring.parse(window.location.hash.replace(/#+/, ''));
    client = parseQS(qs);
    if(client){
        return client;
    }
    
    return new CRESTClient();
})();
