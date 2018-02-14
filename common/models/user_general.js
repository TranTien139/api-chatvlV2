'use strict';

const app = require('../../server/server.js');
const cst = require('./constant.js');

module.exports = function (UserGeneral) {


  UserGeneral.getUserInfo = function (id, cb) {

    const userCredentials = {
      "id": id
    }

    let UserModel = app.models.Users;

    UserModel.findOne({
      where: {
        id: userCredentials.id
      }
    }).then((user)=> {

      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, user);

    }).catch(err=>{
      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, err);
    });

  }

  UserGeneral.remoteMethod(
    'getUserInfo',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'id', type:'string', required: true},
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

  UserGeneral.getListUser = function (user_id, cb) {

    let UserModel = app.models.Users;

    UserModel.find({}).then((user)=> {

      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, user);

    }).catch(err=>{
      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, err);
    });
  }

  UserGeneral.remoteMethod(
    'getListUser',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string', required: true},
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

}
