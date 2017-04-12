var
    Backbone = require('backbone')
    ,Garam = require(process.cwd()+'/server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require(process.cwd()+'/server/lib/BaseTransaction');




module.exports = BaseTransaction.extend({
    pid:'ServerReConnectionStatusRes',
    create : function() {

        this._packet = {
            state : false

        }
    },
    addEvent : function(client) {

            client.on('ServerReConnectionStatusRes',function (state) {
                //DC 가 떨어지고 자동으로 재접속에 성공했을때의 처리
                Garam.getCtl('dc').setConnectionStatus();
                Garam.logger().info('reconnection success',client.getHostname());
            })
    }




});

