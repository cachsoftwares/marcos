if(process.env.PORT) {
    module.exports = {MongoURI: "mongodb+srv://username:pwd@cluster/db"}
} else {
    module.exports = {MongoURI: "mongodb://localhost/marcos"}
}