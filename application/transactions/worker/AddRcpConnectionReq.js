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
        worker.on('AddRcpConnectionReq',function (serverType,serverIp,port) {
      
            switch (serverType) {
                case 'dc':
                    Garam.getCtl('dc_worker').connectionToDc(serverIp,port);
                    break;
                default:
                    assert(0,'해당 serverType  에 대한 로직을 추가해주세요');
                    break;
            }
          
        });
    }




});

