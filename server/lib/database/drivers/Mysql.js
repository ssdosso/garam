var _ = require('underscore')
    , Mysql = require('mysql')
    , Garam = require('../../Garam')
    , DB_driver = require('../DB_driver')
//,MongoClient = require('mongodb').MongoClient
    , format = require('util').format
    , assert= require('assert');



//1
module.exports  = DB_driver.extend({
    conn :null,
    close : function() {
        var conn = this.conn.isConn();
        if (conn) {
            this.conn.close();
        }
    },
    connection : function(callback) {
        var self = this;


        return  (function() {


            // self.conn = Mysql.createPool({
            //     host     : this.get('hostname'),
            //     user     : this.get('username'),
            //     password : this.get('password'),
            //     database : this.get('database')
            // });
            //
            // self.conn.on('end', function(err) {
            //     console.log('mysql close');
            // });

            this.conn = (function() {

                var conn = null,cluster=false,clusterInfo;


                function _clusterConnection(clusterDB,callback) {
                    var clusterConn;
                    clusterConn =   Mysql.createPool({
                        connectionLimit : self.get('connectionLimit') ? self.get('connectionLimit') : 10,
                        host     : clusterDB.hostname,
                        port     : clusterDB.port ? clusterDB.port : self.get('port'),
                        user     : clusterDB.username ? clusterDB.username  :self.get('username'),
                        password : clusterDB.password ? clusterDB.password : self.get('password'),
                        database : clusterDB.database ? clusterDB.database : self.get('database'),
                        supportBigNumbers :true
                        // bigNumberStrings : true
                    });
                    clusterConn.getConnection(function(err, connection) {
                        if (err) {
                            return Garam.logger().error('Mysql clusterConn  Error : ',err);
                        }

                        callback(clusterConn)
                    });
                }

                function _connection() {

                    if (!conn) {

                        if (typeof self.get('cluster') !=='undefined' &&   self.get('cluster')  === true) {
                            conn = {};
                            cluster = true;
                            clusterInfo = self.get('clusterInfo');

                            conn['writer'] =   Mysql.createPool({
                                connectionLimit : self.get('connectionLimit') ? self.get('connectionLimit') : 10,
                                host     : self.get('hostname'),
                                port     : self.get('port'),
                                user     : self.get('username'),
                                password : self.get('password'),
                                database : self.get('database'),
                                supportBigNumbers :true
                                // bigNumberStrings : true
                            });
                            conn['writer'].getConnection(function(err, connection) {
                                // connected! (unless `err` is set)
                                if (err) {
                                    Garam.logger().error('Mysql Connect Error : ',err);
                                }

                                if (typeof clusterInfo === 'undefined') {
                                    assert(0);
                                    return;
                                }
                                if (clusterInfo.length ===0) {
                                    assert(0);
                                    return;
                                }
                                var clusterJob = 0;
                                conn['cluster_list']= [];

                                for (var i in clusterInfo) {
                                    (function (clusterDB) {

                                        _clusterConnection(clusterDB,function (clusterConn) {
                                            conn['cluster_list'].push(clusterConn);
                                            clusterJob++;

                                            if (clusterJob == clusterInfo.length) {
                                                if (typeof callback !== 'undefined') {

                                                    callback(err, connection);
                                                }
                                            }
                                        });

                                    })(clusterInfo[i]);
                                }




                            });
                        } else {

                            var connectList =  self.get('connectionLimit') ? self.get('connectionLimit') : 10;

                            conn =   Mysql.createPool({
                                connectionLimit : self.get('connectionLimit') ? self.get('connectionLimit') : 10,
                                host     : self.get('hostname'),
                                port      : self.get('port'),
                                user     : self.get('username'),
                                password : self.get('password'),
                                database : self.get('database'),
                                supportBigNumbers :true
                                // bigNumberStrings : true
                            });
                            conn.getConnection(function(err, connection) {
                                // connected! (unless `err` is set)
                                if (err) {
                                    Garam.logger().error('Mysql Connect Error : ',err);
                                }


                                if (typeof callback !== 'undefined') {
                                    callback(err, connection);
                                }


                            });
                        }


                    } 
                }

                _connection.call(this);

         
                return {
                    getDataType : function() {
                        return   _dataType;
                    },

                    isConn : function() {
                        return conn ? true : false;
                    },
                    close : function() {
                        conn.close();
                        delete conn;
                        conn = null;
                    },
                    getConnection : function(callback,mode) {
                        if (!conn) {
                            _connection(function(){
                                callback(false,conn);
                            });
                        } else {
                            if (!cluster) {
                                conn.getConnection(function(err, connection) {
                                    // connected! (unless `err` is set)
                                    if (err) {
                                        Garam.logger().error('Mysql Connect Error : ',err);
                                    }

                                    callback(err, connection);
                                });
                            } else {
                                //클러스터 모드 일 경우

                                // 쓰기 db
                                if (mode ==2) {

                                    conn['writer'].getConnection(function(err, connection) {
                                        // connected! (unless `err` is set)

                                        if (err) {
                                            Garam.logger().error('Mysql Connect Error : ',err);
                                        }

                                        callback(err, connection);
                                    });
                                } else if (mode == 1) {

                                   var key= Math.floor( (Math.random() * ( conn['cluster_list'].length - 1 + 1)));

                                    conn['cluster_list'][key].getConnection(function(err, connection) {
                                        // connected! (unless `err` is set)

                                        if (err) {
                                            Garam.logger().error('Mysql Connect Error : ',err);
                                        }

                                        callback(err, connection);
                                    });
                                } else {
                                    assert(0);
                                }

                            }


                        }

                        
                      
                    }
                }
            })();

        }).call(this);


    },
    query : function(queryString, callback) {
        assert(queryString);
        var Queries;
        if (callback === undefined) {
            assert(0);
        }
        if(_.isArray(callback)) {
            Queries = callback;
            callback = arguments[2];
            this.conn.getConnection(function(err,connection) {
                if(err)  {
                    Garam.getInstance().log.warn(err);
                }
                connection.query(queryString, Queries, function(err, rows) {
                    callback(err,rows);
                    if (typeof connection.release === 'function' ) {
                        connection.release();
                    }
                });
            });
        } else {
            this.conn.getConnection(function(err,connection) {
                if(err)  {
                    Garam.getInstance().log.warn(err);
                }

                connection.query( queryString, function(err, rows) {
                    callback(err,rows);
                    if (typeof connection.release === 'function' ) {
                        connection.release();
                    }

                });
            });
        }



    }


});

