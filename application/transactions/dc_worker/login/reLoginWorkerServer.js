var
    Backbone = require('backbone')
    ,Garam = require(process.cwd()+'/server/lib/Garam')
    , _ = require('underscore')
    ,Express = require('express')
    ,BaseTransaction = require(process.cwd()+'/server/lib/BaseTransaction');




module.exports = BaseTransaction.extend({
    pid:'reLoginWorkerServer',
    create : function() {

        this._packet = {
            ip : '',
            serverType:'',
            serverName :'',
            masterServerName:'',
            port:0,
            workerId:0,
            servercode :''
        }
    },
    addEvent : function(client) {



    }




});

