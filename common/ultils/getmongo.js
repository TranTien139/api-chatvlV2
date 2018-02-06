"use strict"

function getMongoURL() {
    let user = process.env.MONGO_USERNAME;
    let pass = process.env.MONGO_PASSWORD;
    let db = process.env.MONGO_DATABASE;
    let host = process.env.MONGO_HOST;
    let port = process.env.MONGO_PORT;
    let url = "mongodb://" + user + ":" + pass + "@" + host + ":" + port + "/" + db;
    return url;
}
module.exports = {
  getMongoURL,
}
