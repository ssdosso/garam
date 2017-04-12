var _ = require('underscore')
    , fs = require('fs')
    , request = require('request')
    , winston = require('winston')
    ,Garam = require('./Garam')
    , Base = require('./Base')
    , rawBodyParser = require('raw-body-parser')
    , assert= require('assert');


exports= module.exports = Router;
function Router (mgr, name) {

    this.base();
}




_.extend(Router.prototype, Base.prototype, {
    init : function(app,webManager) {
        this.app = app;
        this.webManager = webManager;
        this.start();
    },

    getClientAddress : function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0]
            || req.connection.remoteAddress;
    },
    getController: function(controllerName) {
        assert(controllerName);
        controllerName = controllerName.toLowerCase();
        return Garam.getInstance().getController(controllerName)
    },

    end : function(req,res,variables,mode) {

        if (_.isNumber(variables)) {
            res.send(variables);
            return;
        }
        if (!_.isObject(variables)) variables = {};
        //TODO session info
        var userData = {};

        variables = _.extend(variables,userData,{
            production :process.env['NODE_ENV'] == 'development' ? 'false' : 'true'
        });
        if (variables.layout)
        {
            this.render(res,req,variables);
        }

    },
    get : function(path,callback) {
        var self = this;

        this.app.get(path,function(){
            callback.apply(self,arguments);
        });
    },
    postToJson : function () {
        var self = this,path,callback,parser;
        var args= [].slice.call(arguments);
        path = args[0];
        callback = args[1];
        this.app.post(path,rawBodyParser(),function(req,res){
            var rawBody = req.rawBody.toString('utf8');

            if(typeof rawBody ==='undefined' || rawBody === null) {
                req.body = {};
            } else {
                var params = rawBody.split('&'),data,outData={};

                for (var i in params) {
                    var currentStr = params[i];
                    //console.log(currentStr)
                    data =params[i].split('=');
                    if (data.length >2) {
                        var start = currentStr.indexOf(data[0]+'='),dataStart = start + data[0].length+1,startParameter;
                        startParameter=currentStr.substring(start,data[0].length);

                        outData[startParameter] = currentStr.substring(dataStart,currentStr.length);
                    } else {
                        outData[data[0]] =data[1];
                    }
                }
                req.body =outData;

            }


            //req.body =require('querystring').unescape(rawBody);
            callback.apply(self,arguments);
        });
    },
    post : function() {
        var self = this,path,callback,parser;
        var args= [].slice.call(arguments);
        path = args[0];
        callback = args[1];
        if (Garam.getService().get('type') === 'http') {
            var bodyParser = require('body-parser');
            var urlencodedParser =bodyParser.urlencoded({extended: true});

            this.app.post(path,urlencodedParser,function(){
                callback.apply(self,arguments);
            });

        } else {
            this.app.post(path,function(){
                callback.apply(self,arguments);
            });
        }



    },
    render : function(res,req,variables) {
        var layout = variables.layout;
        delete variables.layout;
        res.render(layout,variables);
    },
    encrypt :function (text){
        var crypto = require('crypto');
        var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq');
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    },

    decrypt: function (text){
        var crypto = require('crypto');
        var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq');
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    },

    renderToJson : function(res,data) {
        assert(data);
        res.contentType('application/json');
        var jsonData = JSON.stringify(data);
        res.send(jsonData);
    }

});

Router.extend = Garam.extend;