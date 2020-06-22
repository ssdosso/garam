var _ = require('underscore')
    , fs = require('fs')
    , Garam = require('./Garam')
    , Cluster = require('cluster')
    , winston = require('winston')
    , Base = require('./Base')
    , moment = require('moment')
    , assert= require('assert');



exports = module.exports = Logger;

function Logger (mgr, name) {
    Base.prototype.constructor.apply(this,arguments);
    this.options = {
        log:true,
        info:true,
        warn:true,
        file:true,
        console:true,
        mail:true
    };
    this._disable =false;


};

_.extend(Logger.prototype, Base.prototype, {
    init : function() {
        var self = this;
        this._createLogFile();
    },
    disable : function() {
        this._disable = true;
    },
    anable : function() {
        this._disable = false;
    },
    dayCheck : function () {

        var now = moment();
        var currnetTime = now.unix();

        if ((this.lastLogTime -currnetTime) <= 0) {
            this._createLogFile();
            
        }
    },
    _createLogFile: function() {
        var self = this;

        clearInterval(this.createInterVal);
        this.logWriteDate = moment();
        this.lastLogTime =this.logWriteDate.hour(23).minute(59).second(59).unix();
        
        this.createInterVal = null;
        this.hostName = '';
        this.currentMonthdir = moment().format('YYYY-MM');
        this.dir =Garam.getInstance().get('logDir');
        if (!fs.existsSync(this.dir)) {
            this.dir = './logs';
            fs.mkdirSync( this.dir);
        }
        this.currentDir = this.dir+'/'+this.currentMonthdir;
        if (!fs.existsSync(this.currentDir)){
            fs.mkdirSync( this.currentDir);
        }

        this.logger_s3 = false;
        var logFile =  this.currentDir +'/'+moment().format('YYYYMMDD')+'.log';
        this.logger = new (winston.Logger)({
            levels: {
                cluster: 5,
                packet :4,
                user :3,
                info: 2,
                warn: 1,
                error: 0
            },
            colors: {
                cluster: 'magenta',
                packet: 'cyan',
                user :'grey',
                info: 'green',
                warn: 'yellow',
                error: 'red'
            }
        });


        this.logger.add(winston.transports.Console, {
            level: Garam.get('loggerScreenLevel'),
            // prettyPrint: true,
            colorize: true,
            silent: false,
            timestamp: false
        });

        this.logger.add(winston.transports.File, {
            prettyPrint: false,
            level: Garam.get('loggerLevel'),
            silent: false,
            colorize: true,
            filename: logFile,

            timestamp: function() { return moment().format('YYYY-MM-DD HH:mm:ss.SSS')},
            json: false
        });



        this._use_s3 = false;
        if (typeof Garam.get('logger_s3') !=='undefined' && Garam.get('logger_s3') === true) {
            Garam.logger().info('start logger_s3');
            var AWS = require('aws-sdk');


            var aws = Garam.get('AWS').config;
            AWS.config.update(aws);

            var S3StreamLogger = require('s3-streamlogger').S3StreamLogger;
            if (!Garam.getInstance().getServerIP()) {
                Garam.getInstance().getServerIP(function (ip) {

                    getPort.call(self);
                });

            }

            function getPort() {
                if (!Garam.getCluster().isWorker()) {

                    this.hostName = Garam.get('serverType')+':master';
                    createS3Logger.call(self);
                } else {
                    if (!Garam.getWebServer()) {
                        setTimeout(function () {
                            getPort.call(self);
                        },50);
                    } else {
                        if (!Garam.getWebServer().getListenStatus()) {
                            setTimeout(function () {
                                getPort.call(self);
                            },50);
                        } else {
                            this.hostName = Garam.get('serverType')+':'+Garam.get('port');
                            createS3Logger.call(self);
                        }
                    }
                }
            }

            function createS3Logger() {
                if ( this.logger_s3) {
                    delete  this.logger_s3;
                }
                if (Garam.isMaster()) {
                    var s3LogFile =  'logs/'+this.currentMonthdir+'/'+Garam.getInstance().getServerIP()+'/'+moment().format('YYYYMMDD')+'/'+this.hostName+'.log';
                } else {

                    var s3LogFile =  'logs/'+this.currentMonthdir+'/'+Garam.getInstance().getServerIP()+'/'+moment().format('YYYYMMDD')+'/'+this.hostName+'_'+Garam.getWorkerID()+'.log';
                }

                var s3stream = new S3StreamLogger({
                    bucket: Garam.get('AWS').bucket,
                    access_key_id: aws.accessKeyId,
                    secret_access_key: aws.secretAccessKey,
                    name_format :s3LogFile,
                    rotate_every:3600 *24 * 1000,
                    max_file_size : 400000000
                });

                s3stream.on('error', function(err){
                    // there was an error!
                    console.log(err)
                });

                this._use_s3 = true;
                this.logger_s3 = new (winston.Logger)({
                    levels: {
                        cluster: 5,
                        packet :4,
                        user :3,
                        info: 2,
                        warn: 1,
                        error: 0
                    },
                    colors: {
                        cluster: 'magenta',
                        packet: 'cyan',
                        user :'grey',
                        info: 'green',
                        warn: 'yellow',
                        error: 'red'
                    }
                });

                this.logger_s3.add(winston.transports.File, {
                    stream: s3stream,
                    timestamp: function() { return moment().format('YYYY-MM-DD hh:mm:ss.SSS')},
                    levels: {
                        cluster: 5,
                        packet :4,
                        user :3,
                        info: 2,
                        warn: 1,
                        error: 0
                    },
                    colors: {
                        cluster: 'magenta',
                        packet: 'cyan',
                        user :'grey',
                        info: 'green',
                        warn: 'yellow',
                        error: 'red'
                    }
                });



            }



        }

        this.createInterVal = setInterval(function(){ self.dayCheck() },60 * 1000);

    },
    user : function() {
        if (this._disable) return;
        var mainArguments = Array.prototype.slice.call(arguments);
        mainArguments.unshift("port:"+Garam.get('port'));
        this.logger.user.apply(this.logger, mainArguments);
    },
    packet : function() {
        if (this._disable) return;
        if ( Cluster.isMaster) {
            this.logger.packet.apply(this.logger, arguments);
        } else {

            var mainArguments = Array.prototype.slice.call(arguments);
            mainArguments.unshift("cluster:"+Cluster.worker.id);
            this.logger.packet.apply(this.logger, mainArguments);
        }

        if (this._use_s3 && this.logger_s3) {
            this.logger_s3.packet.apply( this.logger_s3, arguments);
        }
    },
    cluster : function() {
        if (this._disable) return;
        if ( Cluster.isMaster) {
            this.logger.cluster.apply(this.logger, arguments);
        } else {

            var mainArguments = Array.prototype.slice.call(arguments);
            mainArguments.unshift("id:"+Cluster.worker.id);
            this.logger.cluster.apply(this.logger, mainArguments);
        }

        if (this._use_s3 && this.logger_s3) {
            this.logger_s3.cluster.apply( this.logger_s3, arguments);
        }
    },
    debugInfo : function(user) {
        var mainArguments = Array.prototype.slice.call(arguments);
        var user = mainArguments.shift();
        if (user.getDebugUser()) {
            console.log(mainArguments);
        }

        if (Garam.get('serviceMode') ==='local') {
            console.log(mainArguments);
        }

    },
    info : function() {
        if (this._disable) return;
        if ( Cluster.isMaster) {
            this.logger.info.apply( this.logger, arguments);
        } else {

            var mainArguments = Array.prototype.slice.call(arguments);
            mainArguments.unshift("cluster:"+Cluster.worker.id);
            this.logger.info.apply( this.logger, mainArguments);
        }

        if (this._use_s3 && this.logger_s3) {
            this.logger_s3.info.apply( this.logger_s3, arguments);
        }
    } ,
    error: function(log,err) {

        if ( Cluster.isMaster) {
            this.logger.error.apply(this.logger, arguments);
        } else {

            var mainArguments = Array.prototype.slice.call(arguments);
            mainArguments.unshift("cluster:"+Cluster.worker.id);
            this.logger.error.apply(this.logger, mainArguments);
        }
        if (this._use_s3 && this.logger_s3) {
            this.logger_s3.error.apply( this.logger_s3, arguments);
        }

    } ,
    warn: function() {

        if ( Cluster.isMaster) {
            this.logger.warn.apply(this.logger, arguments);
        } else {

            var mainArguments = Array.prototype.slice.call(arguments);
            mainArguments.unshift("cluster:"+Cluster.worker.id);
            this.logger.warn.apply(this.logger, mainArguments);
        }

        if (this._use_s3 && this.logger_s3) {
            this.logger_s3.warn.apply( this.logger_s3, arguments);
        }

    }
});