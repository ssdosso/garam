
var
    Garam = require('../../server/lib/Garam')
    ,moment = require('moment')

    ,Worker = require('../../server/lib/controllers/Worker');


var App = Worker.extend({
    init : function () {

        Worker.prototype.init.apply(this,arguments);
        //test2
    },
    pingDbStatus : function (status,dbType,namespace) {
        var DbStatusReq =this.getTransaction('DbStatusReq');
        this.send(DbStatusReq.addPacket({status:status,dbType:dbType,namespace:namespace}));
    }
});

exports.app  =App;
exports.className  = 'dc_worker'; //TempUserSession

