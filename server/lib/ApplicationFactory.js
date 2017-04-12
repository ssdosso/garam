var EventEmitter = require('events').EventEmitter
    ,_ = require('underscore')
    , fs = require('fs')
    , Garam = require('./Garam')
    , winston = require('winston')
    , assert= require('assert');

exports = module.exports = Application;

function Application(mod) {
    if(mod) this._targetApp = mod;
    else this._targetApp ='all';
    //this.trigger = require('./triggerMethod');

}
_.extend(Application.prototype, EventEmitter.prototype, {
    create : function() {

        this._controllers = {};

        this.appDir = Garam.getInstance().get('appDir');
        var self = this;

        if(!fs.existsSync(this.appDir + '/controllers')) {
            Garam.getInstance().log.info(this.appDir + '/controllers make appDir');
            fs.mkdirSync(this.appDir + '/controllers');
        }

        var dir = process.cwd()+'/'+ this.appDir + '/controllers';
        var list = fs.readdirSync(dir);
        var total =list.length;

        if(total === 0){
            Garam.getInstance().log.error('controllers is empty');
        }

        var work =0;
        list.forEach(function (file,i) {


            (function(job) {
                var stats = fs.statSync(process.cwd()+'/'+ self.appDir + '/controllers/'+ file);
                if (stats.isFile()) {
                    var singletonController = require(process.cwd()+'/'+ self.appDir + '/controllers/'+ file);
                    assert(singletonController.className);
                    if(!singletonController.className) {
                        Garam.getInstance().log.error('className does not exist');
                        return;
                    }
                    self.addController(singletonController,function(){
                        if (total === (job+1)) {
                            Garam.getInstance().emit('applicationReady');
                        }
                        // work++;
                        // if (total === work) {
                        //
                        //
                        // }

                    });

                } else {
                    appFolder(file,function () {

                    });
                }
            })(i);

        });


        function appFolder(folderName,callback) {
            var subDir =  Garam.getInstance().get('appDir') +'/controllers/'+folderName;
            var list = fs.readdirSync(subDir);
            var total = list.length,singletonController;
            if (list.length > 0) {
                list.forEach(function (file,i) {
                    (function(job) {
                        var stats = fs.statSync(subDir + '/'+ file);
                        if (stats.isFile()) {
                            singletonController = require(process.cwd()+'/'+subDir+'/'+ file);
                            assert(singletonController.className);
                            if(!singletonController.className) {
                                Garam.getInstance().log.error('className does not exist');
                                return;
                            }
                            self.addController(singletonController,function(){
                                if (total === (job+1)) {
                                    callback();
                                }
                            });

                        } else {
                            assert(0);
                        }

                    })(i);

                });
            } else {
                callback();
            }
        }
    },
    addController: function(application,callback) {

        var controller = application.app,self=this;
        var c = new controller;
        var className = application.className.toLowerCase();
        this._controllers[className] = c;
        this._controllers[className]._create(className,function(){
            self._controllers[className].init();
            callback();
        });


    },

    getControllers : function() {
        return this._controllers;
    },
    /**
     * 외부에서 applicaction 컨트롤러를 리턴
     * @param className
     * @returns {*}
     */
    getController : function(className) {
        return this._controllers[className];
    },

    addControllers: function() {



    }
});