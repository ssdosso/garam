var
    Garam = require(process.cwd()+'/server/lib/Garam')
    , _ = require('underscore')
    , assert = require('assert')
    ,BaseTransaction = require(process.cwd()+'/server/lib/BaseTransaction');



module.exports = BaseTransaction.extend({
    pid:'loginFailRes',

    create : function() {

        this._packet = {}
    },
    addEvent : function(dc) {


        dc.on('loginFailRes',function () {
           Garam.logger().error('client Incorrect login attempts');
            process.exit(1);


        });

    }




});

