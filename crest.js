var APIConnection = require('./apiconnection.js');

var crest = {
    conn: new APIConnection(),
    load: function(callback) {
        crest.conn.getResource('https://public-crest.eveonline.com/', callback);
    }
}

global.crest = crest;
