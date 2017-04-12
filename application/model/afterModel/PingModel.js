
/**
 * 샘플입니다.
 * @type {{getInstance: Function}}
 */
var Garam = require('../../../server/lib/Garam')
    ,assert = require('assert')
    ,Model = require('../../../server/lib/Model')
    ,Type = require('../../../server/lib/Types');


var Model = Model.extend({
    defaultName :'PingModel',
    dbName :'auth',
    create : function() {
        this.addField('ping',Type.Int  ,false,['notEmpty'],true);
        this.createModel();
    },
    get : function(ping, callback) {
        var self = this;
        this.query({ping: ping}, function (err, models) {
            if (models && typeof models.length !== 'undefined' && models.length > 0) {
                callback(models.pop());
            } else {
                self.insert({
                    'ping': ping
                }, function (err, model) {
                    if (err) {
                        Garam.logger().warn('PingModel insert error');
                        return;
                    }
                    callback(model);
                });
            }
        });
    }
});

module.exports = Model;

