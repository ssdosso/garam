
var
    Garam = require('../../server/lib/Garam')
    ,Express = require('express')
    ,Application = require('../../server/lib/Application');

var Backbone = require('backbone')
    , _ = require('underscore');

var util = require('util');


var App = Application.extend({

    init : function() {
        var self = this;

         if (!Garam.isMaster()) {

        }



    },


    main: function(callback) {

        callback();

    }


});

exports.app  =App;
exports.className  = 'worker';
