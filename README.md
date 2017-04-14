# Garam Framework Prototype

# install
 npm install garam

# server Start
node index.js
# dev options


# create dev options /application/conf/dev.json
node index.js -t dev  

node index.js -l true //packet debug


# mysql, mssql, redis

# db options

//conf/default.json
 {
      "namespace":"account",
      "driver":"Mssql",
      "hostname":"xxx.xxx.xxx.xxx",
      "username" :"fansGame",
      "database" :"AccountDB",
      "password":"ehsqxxxxjfwk1@#",
      "port":"13333",
      "procedure" :true,
      "connLimit" :1,
      "pool": {
        "max":20,
        "min":0,
        "idleTimeoutMillis": 30000
      }
    },


    {
      "namespace":"mysqltest",
      "driver":"Mysql",
      "hostname":"localhost",
      "username" :"root",
      "database" :"testdb",
      "password":"choil123",
      "port":"3306",
      "procedure" :true,
      "connLimit" :1
    }
    
    
 # cluster 
 default.json
 clusterMode : true
 
 # webserver
 
   "portInfo":{
     "mode" :"cpu",
     "maxCount":1,
     "portType" : 0,
     "defaultPort" : 8080
   },
   
    
   "portInfo":{
     "mode" :"cpu",
     "maxCount":1,
     "portType" : 1,
     "defaultPort" : 8080
   },
   
     "portInfo":{
       "mode" :"number",
       "maxCount":3,
       "portType" : 0,
       "defaultPort" : 8080
     },
 
 
 
 # remote  (Role to client server)
 
   "net": {
     "remote": [{
       "hostname":"dc",
       "ip" :"xxx.xx.xx.xx",
       "port":4000
     }]
   }
   
   
 # host server ( Role to host server )
   
   
     "net": {
       "host": [{
         "hostname":"dc",
         "port":4000
       }]
     },
   
