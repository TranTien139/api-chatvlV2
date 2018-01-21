"use strict";

const app = require('../../server/server.js');
const cst = require('./constant.js');
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function (Comments) {

  Comments.addComment = function (user_id, content ,article_id , cb) {

    const user =  app.models.UserClient.findOne({where: {_id: user_id}});
    const article =  app.models.Articles.findOne({where: {_id: article_id}});


    Promise.all([user,article]).spread((user,article)=>{
      if(user && article && content){
        let data = {created_by: user.id, content:content,article_id:article.id,type: 1, created_at: Date.now(), like:0, count_reply:0}
        Comments.create(data).then(val=>{
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, val);
        });
      } else {
        cb(null, cst.HTTP_CODE_MISSING_PARAM, cst.MESSAGE_GET_MISSING_PARAM, {});
      }
    }).catch(err=>{
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Comments.remoteMethod(
    'addComment',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
        {arg: 'content', type:'string', required: true},
        {arg: 'article_id', type:'string', required:true},
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

  Comments.addReplyComment = function (user_id, content ,comment_id , cb) {

    const user =  app.models.UserClient.findOne({where: {_id: user_id}});
    const comment =  Comments.findOne({where: {_id: comment_id}});

    Promise.all([user,comment]).spread((user,comment)=>{
      if(user && comment && content){
        let data = {created_by: user.id, content:content,comment_id:comment.id, type: 2, created_at: Date.now(), like:0}
        Comments.create(data).then(val=>{
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, val);
        });
      } else {
        cb(null, cst.HTTP_CODE_MISSING_PARAM, cst.MESSAGE_GET_MISSING_PARAM, {});
      }
    }).catch(err=>{
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Comments.remoteMethod(
    'addReplyComment',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
        {arg: 'content', type:'string', required: true},
        {arg: 'comment_id', type:'string', required:true},
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

  Comments.deleteComment = function (user_id, comment_id , cb) {

    Comments.destroyAll({
        _id: comment_id,
        created_by: user_id
    }).then(val=>{
      Comments.destroyAll({
        comment_id: comment_id
      }).then(val=> {
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_DELETE, val);
      });
    }).catch(err=>{
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });

  }

  Comments.remoteMethod(
    'deleteComment',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
        {arg: 'comment_id', type:'string', required: true},
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

  Comments.getCommentByArticle = function (user_id, article_id ,size, page, cb) {

    size = parseInt(size, 10);
    page = parseInt(page, 10);
    let skip = (page - 1)*size;

    Comments.find({
      include:{
        relation: "getUser",
        scope:{
          fields: ["image","userSlug","name"]
        }
      },
      where: {
        article_id: article_id
      },
      skip: skip,
      limit: size,
      order: "created_at DESC"
    }).then(results=>{
      if(!results){
        results = [];
      }
      let next_page = results.length - size < 0 ? -1 : page + 1;
      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS,{results, next_page});
    }).catch(err=>{
      cb(null,cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Comments.remoteMethod(
    'getCommentByArticle',
    {
      http: {verb:'post'},
      accepts: [
        {arg: 'user_id', type:'string',required: true},
        {arg: 'article_id', type:'string', required: true},
        {arg: 'size', type:'number', default: 10},
        {arg: 'page', type:'number', default: 1}
      ],
      returns: [
        {arg: 'code', type:'number'},
        {arg: 'message', type:'string'},
        {arg: 'data', type:'object'}
      ]
    }
  );

};
