var Garam = require('../../../server/lib/Garam')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');

module.exports = BaseTransaction.extend({
    pid:'cartoonVersion',
    create : function(master) {
        this._packet = {
            pid: 'cartoonVersion',
            version: ''
        }
    },
    addEvent : function(worker) {
        worker.on('cartoonVersion', function (version) {
            var master = Garam.getMaster();
            var cartoonVersion = master.getTransaction('cartoonVersion');
            master.sendAll(cartoonVersion.addPacket({version: version}));
        });
    }




});

