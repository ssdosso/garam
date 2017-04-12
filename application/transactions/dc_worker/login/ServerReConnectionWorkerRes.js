var

    Garam = require(process.cwd()+'/server/lib/Garam')
    , _ = require('underscore')

    ,BaseTransaction = require(process.cwd()+'/server/lib/BaseTransaction');




module.exports = BaseTransaction.extend({
    pid:'ServerLoginWorkerStatusRes',
    create : function() {

        this._packet = {
            state : false

        }
    },
    addEvent : function(client) {


        client.on('ServerReConnectionWorkerRes',function (state) {
            //DC 가 떨어지고 자동으로 재접속에 성공했을때의 처리
            Garam.getCtl('dc_worker').setConnectionStatus();
            Garam.logger().info('reconnection dc-worker',client.getHostname());
        })

    }




});

