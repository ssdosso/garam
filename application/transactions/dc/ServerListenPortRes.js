var
    Backbone = require('backbone')
    ,Garam = require('../../../server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require('../../../server/lib/BaseTransaction');




module.exports =  BaseTransaction.extend({
    pid:'ServerListenPortRes',
    type:'server',
    create : function() {

        this._packet = {
            pid : 'ServerListenPortRes',
            port : [],
            free : true
        }
    },
    addEvent : function(dcServer) {
        var dcController = Garam.getInstance().getController('DC');
        /**
         *  클러스터를 생성
         */
        dcServer.on('ServerListenPortRes',function(ports) {
            Garam.getCtl('DC').setServerPortInfo(ports);
            //for(var i in ports) {
            //    Garam.logger().info('create worker port : ', ports[i]);
            //    Garam.getInstance().createWorker(ports[i],{});
            //}
        });
    }





});

