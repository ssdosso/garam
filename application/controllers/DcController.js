
var
    Garam = require('../../server/lib/Garam')
    ,moment = require('moment')
    ,DC = require('../../server/lib/controllers/DC');


var App = DC.extend({
    init : function () {

        DC.prototype.init.apply(this,arguments);
        //test1
    },
    pingDbStatus : function (status,dbType,namespace) {
        var DbStatusReq =this.getTransaction('DbStatusReq');

        this.send(DbStatusReq.addPacket({status:status,dbType:dbType,namespace:namespace}));
    }
});

exports.app  =App;
exports.className  = 'DC'; //TempUserSession

