if(process.env.PORT) {
    module.exports = {MongoURI: "mongodb+srv://VCach333:fibonacci@loja.hpnkm.mongodb.net/marcos"}
} else {
    module.exports = {MongoURI: "mongodb://localhost/virgo"}
}