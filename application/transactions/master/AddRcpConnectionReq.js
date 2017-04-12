var Garam = require('../../../server/lib/Garam')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid:'AddRcpConnectionReq',
    create : function(master) {
        this._packet = {
            serverType: '',
            serverIp:'',
            port :''
        }
    },
    addEvent : function(worker) {

    }




});

