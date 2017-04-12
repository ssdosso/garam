var Garam = require('../../../server/lib/Garam')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid:'clientVersion',
    create : function(master) {
        this._packet = {
            pid: 'clientVersion',
            version: ''
        }
    },
    addEvent : function(worker) {
        worker.on('clientVersion', function (version) {
            var master = Garam.getMaster();
            var clientVersion = master.getTransaction('clientVersion');
            master.sendAll(clientVersion.addPacket({version: version}));
        });
    }




});

