'use strict';

const app = require('../../server/server.js');
const cst = require('./constant.js');

module.exports = function (Users) {

  Users.getUserInfo = function (user_id, cb) {

    user_id = user_id.toString();

    Users.findOne({
      where: {
        _id: user_id
      },

    }).then(results=>{
      if(!results){
        results = {};
      }
      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS,results);
    }).catch(err=>{
      cb(null,cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Users.remoteMethod(
    'getUserInfo',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );


  Users.login = function (username,password, cb) {

    const userCredentials = {
      "username": username,
      "password": password
    }
    cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, {});
    // Users.login(userCredentials, 'user', function (err, result) {
    //
    //   if (err) {
    //     cb(null,cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    //   }else {
    //
    //     let results = {
    //       "token": result.id,
    //       "ttl": result.ttl
    //     };
    //
    //     cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, results);
    //   }
    //
    // });

  }

  Users.remoteMethod(
    'login',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'username', type:'string', required: true},
        {arg: 'password', type:'string', required: true},
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

}
