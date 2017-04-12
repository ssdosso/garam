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

                var conn = null;

                function _connection() {

                    if (!conn) {
                        conn =   Mysql.createPool({
                                connectionLimit : 10,
                                host     : self.get('hostname'),
                                port      : self.get('port'),
                                user     : self.get('username'),
                                password : self.get('password'),
                                database : self.get('database')
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
                    getConnection : function(callback) {

                        if (!conn) {
                            _connection(function(){
                                callback(false,conn);
                            });
                        } else {
                            conn.getConnection(function(err, connection) {
                                // connected! (unless `err` is set)
                                if (err) {
                                    Garam.logger().error('Mysql Connect Error : ',err);
                                }

                                callback(err, connection);
                            });

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

