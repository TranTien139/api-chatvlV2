'use strict';

const app = require('../../server/server.js');
const cst = require('./constant.js');
const Promise = require('bluebird');
const _ = require('lodash');

const ultil = require('../ultils/getmongo.js');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

module.exports = function (Articles) {


  Articles.disableRemoteMethod('__get__getUser', false);

  Articles.getArticleNew = function (user_id, slug_user, size, page, cb) {

    size = parseInt(size, 10);
    page = parseInt(page, 10);
    let skip = (page - 1) * size;

    let where = {status: "Publish"};
    if (slug_user) {
      where.userSlug = slug_user;
    }

    Articles.find({
      include: {
        relation: "getUser",
        scope: {
          fields: ["image", "userSlug", "name"]
        }
      },
      where: where,
      skip: skip,
      limit: size,
      order: "date DESC"
    }).then(results => {
      if (!results) {
        results = [];
      }
      let next_page = results.length - size < 0 ? -1 : page + 1;
      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, {results, next_page});
    }).catch(err => {
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Articles.remoteMethod(
    'getArticleNew',
    {
      http: {verb: 'post'},
      accepts: [
        {arg: 'user_id', type: 'string', required: true},
        {arg: 'slug_user', type: 'string'},
        {arg: 'size', type: 'number', default: 10},
        {arg: 'page', type: 'number', default: 1}
      ],
      returns: [
        {arg: 'code', type: 'number'},
        {arg: 'message', type: 'string'},
        {arg: 'data', type: 'object'}
      ]
    }
  );


  Articles.getArticleDetail = function (user_id, id_article, cb) {

    id_article = id_article.toString();

    Articles.findOne({
      include: {
        relation: "getUser",
        scope: {
          fields: ["image", "userSlug", "name"]
        }
      },
      where: {
        status: "Publish",
        _id: id_article
      },
    }).then(results => {
      if (!results) {
        results = {};
        cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, results);
      } else {
        let total_view = results.total_view ? results.total_view + 1 : 1;

        Articles.updateAll({"id": results.id}, {total_view: total_view}).then(data => {
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, results);
        });

      }

    }).catch(err => {
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Articles.remoteMethod(
    'getArticleDetail',
    {
      http: {verb: 'post'},
      accepts: [
        {arg: 'user_id', type: 'string', required: true},
        {arg: 'id_article', type: 'string', required: true}
      ],
      returns: [
        {arg: 'code', type: 'number'},
        {arg: 'message', type: 'string'},
        {arg: 'data', type: 'object'}
      ]
    }
  );

  Articles.addPostArticle = function (user_id, title, description, linkVideo, image, cb) {

    user_id = user_id.toString();

    let UserModel = app.models.Users;

    UserModel.findOne({
      where: {
        id: user_id
      }
    }).then(results => {
      if (results && results.userSlug && results.userId) {

        let data = {};
        let type;
        if (linkVideo) {
          type = "video";
        } else {
          type = "article";
        }
        data["date"] = Math.floor(Date.now() / 1000);
        data["source"] = "Post By User";
        data["type"] = type;
        data["title"] = title;
        data["description"] = description;
        data["linkVideo"] = linkVideo;
        data["linkCrawler"] = "Post By User";
        data["status"] = "Publish";
        data["image"] = image;

        data["total_like"] = 0;
        data["like_icon"] = [];
        data["total_share"] = 0;
        data["total_comment"] = 0;

        data["published_at"] = Math.floor(Date.now() / 1000);
        data["userId"] = results.userId;
        data["userSlug"] = results.userSlug;

        Articles.create(data).then(result => {
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, result);
        });

      } else {
        cb(null, cst.HTTP_CODE_FAILED_DATA, "Không tồn tại user này", {});
      }
    }).catch(err => {
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });

  }

  Articles.remoteMethod(
    'addPostArticle',
    {
      http: {verb: 'post'},
      accepts: [
        {arg: 'user_id', type: 'string', required: true},
        {arg: 'title', type: 'string', required: true},
        {arg: 'description', type: 'string'},
        {arg: 'linkVideo', type: 'string'},
        {arg: 'image', type: 'string', required: true}
      ],
      returns: [
        {arg: 'code', type: 'number'},
        {arg: 'message', type: 'string'},
        {arg: 'data', type: 'object'}
      ]
    }
  );


  Articles.deteteArticle = function (user_id, article_id, cb) {

    user_id = user_id.toString();
    article_id = article_id.toString();

    Articles.findOne({
      where: {
        userId: user_id,
        id: article_id
      }
    }).then(data => {
      if (data) {
        Articles.destroyAll({id: article_id}).then(val => {
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, data);
        });
      } else {
        cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, {});
      }
    }).catch(err => {
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });

  }

  Articles.remoteMethod(
    'deteteArticle',
    {
      http: {verb: 'post'},
      accepts: [
        {arg: 'user_id', type: 'string', required: true},
        {arg: 'article_id', type: 'string', required: true},
      ],
      returns: [
        {arg: 'code', type: 'number'},
        {arg: 'message', type: 'string'},
        {arg: 'data', type: 'object'}
      ]
    }
  );

  Articles.likeArticle = function (user_id, article_id, type, cb) {

    user_id = user_id.toString();
    article_id = article_id.toString();

    Promise.all([Articles.findOne({where: {id: article_id}}), app.models.Users.findOne({where: {id: user_id}})]).spread((article, user) => {

      if (article && user) {
        let obj_like = {user_id: user_id, type: type};

        let likes = article.likes.filter(obj => {
          return obj.user_id !== user_id
        });
        if (type !== 0) {
          likes.unshift(obj_like);
        }
        let total_like = likes.length;
        let like_icon = _.uniqBy(likes, 'type');
        like_icon = _.map(like_icon, 'type');

        Articles.updateAll({id: article_id}, {likes: likes, total_like: total_like, like_icon: like_icon}).then(val => {
          cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, {
            likes: likes,
            total_like: total_like,
            like_icon: like_icon
          });
        });

      } else {
        cb(null, cst.HTTP_CODE_FAILED_DATA, 'Không tồn tại user hoặc bài viết', {});
      }

    }).catch(err => {
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });
  }

  Articles.remoteMethod(
    'likeArticle',
    {
      http: {verb: 'post'},
      accepts: [
        {arg: 'user_id', type: 'string', required: true},
        {arg: 'article_id', type: 'string', required: true},
        {arg: 'type', type: 'number', required: true, description: "nhap cac icon tu 1 den 6"},
      ],
      returns: [
        {arg: 'code', type: 'number'},
        {arg: 'message', type: 'string'},
        {arg: 'data', type: 'object'}
      ]
    }
  );

  Articles.getHotArticle = function (user_id, type, size, page, cb) {

    size = parseInt(size, 10);
    page = parseInt(page, 10);
    let skip = (page - 1) * size;

    let where = {status: "Publish"};

    let order = "total_view DESC";
    if (type === 3) {
      order = "total_like DESC";
    }

    if (type === 4) {
      order = "total_comment DESC";
    }

    if (type === 5) {
      order = "total_share DESC";
    }

    Articles.find({
      include: {
        relation: "getUser",
        scope: {
          fields: ["image", "userSlug", "name"]
        }
      },
      where: where,
      skip: skip,
      limit: size,
      order: order
    }).then(results => {

      if (!results) {
        results = [];
      }

      let next_page = results.length - size < 0 ? -1 : page + 1;

      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, {results, next_page});
    }).catch(err => {
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });

  }

  Articles.remoteMethod(
    'getHotArticle',
    {
      http: {verb: 'post'},
      accepts: [
        {arg: 'user_id', type: 'string', required: true},
        {
          arg: 'type',
          type: 'number',
          required: true,
          description: "nhap cac icon tu 1 den 5, 1 la all, 2 la theo view, 3 là theo like, 4 là theo coment,5 la theo share"
        },
        {arg: 'size', type: 'number', default: 10},
        {arg: 'page', type: 'number', default: 1}
      ],
      returns: [
        {arg: 'code', type: 'number'},
        {arg: 'message', type: 'string'},
        {arg: 'data', type: 'object'}
      ]
    }
  );

  Articles.getRandomArticle = function (user_id, cb) {

    Articles.find({
      include: {
        relation: "getUser",
        scope: {
          fields: ["image", "userSlug", "name"]
        }
      },
      where: {
        status: "Publish"
      },
      limit: 10,
      order: "pulished_at DESC"
    }).then(results => {

      if (!results) {
        results = [];
      }

      cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, {results, next_page:-1});
    }).catch(err => {
      console.log(err);
      cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, err);
    });

    // MongoClient.connect(ultil.getMongoURL(), function (error, db) {
    //   if (error) {
    //     cb(null, cst.HTTP_CODE_FAILED_DATA, cst.MESSAGE_GET_FAILED, error);
    //   } else {
    //
    //     const collection = db.collection('articles');
    //
    //     collection.aggregate([
    //       {
    //         $match: {
    //           status: "Publish",
    //         }
    //       },
    //       {$sample: {size: 10}},
    //     ]).then((results) => {
    //       db.close();
    //       cb(null, cst.HTTP_CODE_SUCCESS, cst.MESSAGE_GET_SUCCESS, results);
    //     });
    //   }
    // });

  }


  Articles.remoteMethod(
    'getRandomArticle',
    {
      http: {verb: 'post'},
      accepts: [
        {arg: 'user_id', type: 'string', required: true}
      ],
      returns: [
        {arg: 'code', type: 'number'},
        {arg: 'message', type: 'string'},
        {arg: 'data', type: 'object'}
      ]
    }
  );

};
