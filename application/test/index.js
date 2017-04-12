
var
    Garam = require('../../server/lib/Garam')
    , crypto = require('crypto')
    ,Test = require('../../server/lib/Test');

var Backbone = require('backbone')
    , _ = require('underscore');

var util = require('util');


var TestApp = Test.extend({

    create :function() {
        var bufferMng = Garam.getBufferMng();
            var self = this;
            var crypto = require('crypto');


        if (Garam.getInstance().get('service')) {
            Garam.getInstance().on('listenService', function () {

             

                // Garam.getDB('account').getProcedure('xx_GetTokenKey').getToken('dfrdf',function (err,rows) {
                //     console.log(rows)
                // })

                //

                Garam.getDB('match').getModel('BattleBoardModel').get({ACTSERIAL:1,START:1,END:2},function (err,model) {
                    console.log(model)
                });


                Garam.getDB('mysqltest').getModel('testQuery').testQuery();
            });

        }
    }
});

//exports.TestApp  =TestApp;
exports = module.exports = TestApp;