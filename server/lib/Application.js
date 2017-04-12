var EventEmitter = require('events').EventEmitter
    ,_ = require('underscore')
    , fs = require('fs')
    , request = require('request')
    , winston = require('winston')
    ,Garam = require('./Garam')
 
    , Base = require('./Base')
    , assert= require('assert')
    , domain = require('domain');


exports= module.exports = Application;

function Application() {
    Base.prototype.constructor.apply(this,['start']);
}
_.extend(Application.prototype, Base.prototype, {

    callback : function() {},
    get : function(name) {
        return Garam.get(name);
    },
    set : function(name,val) {
        Garam.set(name,val)
    },
    errorResponse : function (errorName) {
        var errorCode;
        var Error =Garam.getErrorCode();
        if (typeof errorName ==='undefined') {
            errorCode = Error.SystemError;
        } else {
            switch (errorName) {
                case 'system':
                    errorCode = Error.SystemError;
                    break;
                case 'database':
                    errorCode = Error.DatabaseError;
                    break;
                case 'auth':
                    errorCode = Error.NotLoginError;
                    break;
                case 'packet':
                    errorCode = Error.PacketDataTypeError;
                    break;
                case 'action':
                    errorCode = Error.InvalidActionReq;
                    break;
                case 'invalid':
                    errorCode = Error.InvalidError;
                    break;
                default:
                    if(Error[errorName]) {
                        errorCode = Error[errorName];
                    } else {
                        errorCode = Error.InvalidError;
                    }
                    break;
            }
        }
        
        return errorCode;
    },
    createPromise : function (callback) {
        var promise = new Promise(execute);
        
        function execute(success, fail) {
            callback(promise,success,fail);
        }
    },
    getModel : function (modelName) {
        return Garam.getModel(modelName)
    },
    encrypt : function(message) {
        var self = this;
        var len = message.length,crypto= require('crypto');
        for (var i = 0; i < 16 - len % 16; i++) {  // pad to multiple of block size
            message += '\0';
        }

        var cipher=crypto.createCipheriv('aes-128-cbc',self.secret,self.iv);
        cipher.setAutoPadding(false);
        var crypted = cipher.update(message, 'utf8', 'base64');


        crypted += cipher.final('base64');


        return crypted;
    },
    _create : function(className,callback) {

        var self = this;
        this.className = className;

        this.addTransactionDirectory(this.className,function(){

            if(_.isFunction(self.createConnection)) {

                self.createConnection();
                callback();
            } else {
                callback();
            }

        });
    },

    /**
     *
     * @param user socket.io OR Net

     */
    addClientTransactions : function(user) {
        var transaction_controllers = Garam.getInstance().getTransactions();
        var d = domain.create();

        d.on('error', function(err) {

            Garam.logger().error(err.stack);
        });

        d.run(function() {
            for (var controller_name in transaction_controllers) {

                (function(controller_transactions,controllerName){

                    for (var i in controller_transactions) {
                        (function(transaction){
                            transaction.removeEvent(user);
                            d.add(user);
                            transaction.addEvent(user);
                            if (typeof user.addTransactionPacket ==='function') {
                                if (typeof transaction._packet === 'undefined') {
                                    assert(transaction._packet,transaction.pid);
                                }
                                user.addTransactionPacket(transaction.pid,transaction._packet);
                            }

                        }).call(this,controller_transactions[i]);
                    }
                }).call(Garam.getInstance().getController(controller_name) , transaction_controllers[controller_name] ,controller_name);

            }
        });


    },
    getTransactions: function() {
        return this._transactions;
    },
    getTransaction: function(tran) {
        return this._transactions[tran];
    },
    addTransaction : function(transaction) {
        this._transactions[transaction.pid] =  transaction;
        if (!transaction._packet) {
            transaction._packet = {};
        }
        transaction._packet.pid = transaction.pid;
        transaction._parentController(this);
        transaction.create();

        //  Garam.getInstance().setTransactionsList(transaction.pid,transaction);
    },
    /**
     *
     * @param dir  각 controller 의 namespace, transaction 디렉토리명.
     * @param user   socket  instance , default is null
     */
    addTransactionDirectory : function(dir,callback) {
        var transDir =  Garam.getInstance().get('appDir') +'/transactions/'+dir,self = this;
        if(!fs.existsSync(transDir)) {
            Garam.getInstance().log.warn('controller 에서 사용하는 트랜잭션 폴더가 존재하지 않습니다 transactions/'+dir);
            fs.mkdirSync(transDir);
            //  Garam.getInstance().log.error('not found Transaction Directory' +transDir);
            callback();
            return;
        }
        this._transactions = {};

        Garam.getInstance().setTransactions(this._transactions,this.className);
        var list = fs.readdirSync(transDir);
        var total = list.length;
        if (list.length > 0) {
            list.forEach(function (file,i) {
                (function(job) {
                    var stats = fs.statSync(transDir + '/'+ file);
                    if (stats.isFile()) {
                        var Transaction = require(process.cwd()+'/'+transDir + '/'+ file);
                        self.addTransaction(new Transaction);

                        if (total === (job+1)) {
                            callback();
                        }
                    } else {
                        readFolder(file,function () {
                            if (total === (job+1)) {
                                callback();
                            }
                        });
                    }

                })(i);

            });
        } else {
            callback();
        }


        function readFolder(folderName,callback) {
            var subDir =  Garam.getInstance().get('appDir') +'/transactions/'+dir+'/'+folderName;
            var list = fs.readdirSync(subDir);
            var total = list.length,Transaction;
            if (list.length > 0) {
                list.forEach(function (file,i) {
                    (function(job) {
                        var stats = fs.statSync(subDir + '/'+ file);
                        if (stats.isFile()) {
                            Transaction = require(process.cwd()+'/'+subDir + '/'+ file);
                            self.addTransaction(new Transaction);

                        } else {
                            assert(0);
                        }
                        if (total === (job+1)) {

                            callback();

                        }
                    })(i);

                });
            } else {
                callback();
            }
        }

    },
    request: function(method,url,data,headers,dataType,next) {

        assert(next);
        if (!_.isObject(data)) {
            assert(0);
        }



        var scope = this
            ,http =this.get('ssl') ? 'https' : 'http'
        // ,url=  http+this.get('authServer')+'/' + path
            ,qs = require('querystring').stringify(data)
            ,options={};
        if (url.indexOf(http) !== -1) {
            assert(0,'url  에서 http 값을 제외 해 주세요');
            return;
        }


        method = method === undefined ? 'get' : method;
        switch(method) {
            case 'get':
                options.headers = {
                    'content-type' : 'application/x-www-form-urlencoded',
                    'Cache-Control':'no-cache'

                };
                options.url = http+'://'+url + '?' + qs;
                options.gzip = true;
                break;
            default :
                options.headers = {'content-type' : 'application/x-www-form-urlencoded'};
                options.url = http+'://'+url;
                options.body = qs;



                break;
        }


        //if (header) {
        //    options.headers[header.name] = header.value;
        //}
        if (typeof headers !== 'undefined') {
            for (var i in headers) {
                options.headers[i]  = headers[i];
            }
        }
        if (options.headers['content-type'] ==='application/json') {
            options.body = JSON.stringify(data);
        }



        var domain = require('domain');
        var d = domain.create();

        d.on('error', function(err) {

            Garam.logger().warn('Error Message:'+err.stack);

            // Our handler should deal with the error in an appropriate way
        });

        d.run(function() {
            request[method](options, function(error, response, body){
                //  console.log(response)
                if (error) {
                    Garam.logger().warn('Error Message:'+error);
                    next(error);
                } else {
                    switch (dataType) {
                        case 'json':
                            try {
                                var data = JSON.parse(body);

                                next(false,response, data);
                            } catch (e) {
                                next(e,response, body);
                            }

                            break;
                        case 'string':
                            next(false,response, body);
                            break;
                    }

                }


            });

        });

    }

});

Application.extend = Garam.extend;

