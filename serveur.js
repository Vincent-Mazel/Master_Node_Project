const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
});

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = "mongodb://localhost:27017"; // Le lancer en local avant

MongoClient.connect(url, {useNewUrlParser : true}, (err, client) => {
    console.log("MongoDB connecté !");
    let db = client.db("SUPERVENTES"); 

    /* Liste des produits */
    app.get("/produits", (req, res) => {
        console.log("/produits");

        try {
            db.collection("produits").find().toArray((err, documents) => {
                res.end(JSON.stringify(documents));
            });
        } catch (e) {
            console.log("Erreur sur /produits : " + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Récupération d'un produit en particulier */
    app.get("/produits/:categorie", (req, res) => {
        console.log("/produits/:categorie");
        let categorie = req.params.categorie;

        try {
            db.collection("produits").find({ type : categorie }).toArray((err, documents) => {
                res.end(JSON.stringify(documents));
            });
        } catch (e) {
            console.log("Erreur sur /produits/" + categorie + " : " + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Liste des catégories de produits */
    app.get("/categories", (req, res) => {
        console.log("/categories");
        let categories = [];

        try {
            db.collection("produits").find().toArray((err, documents) => {
                for (let doc of documents)
                    if (!categories.includes(doc.type)) categories.push(doc.type);

                console.log("Renvoi de " + JSON.stringify(categories));
                res.end(JSON.stringify(categories));
            });
        } catch (e) {
            console.log("Erreur sur /categories : " + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Connexion */
    app.post("/membre/connexion", (req, res) => {
        console.log("/membre/connexion");

        try {
            db.collection("membres")
              .find(req.body)
              .toArray((err, documents) => {
                    if (documents.length == 1)
                        res.end(JSON.stringify({ "resultat" : 1, "message" : "Authentification réussie" }));
                    else res.end(JSON.stringify({ "resultat" : 0, "message" : "Email et/ou mot de passe incorrect" }));
              });
        } catch(e) {
            res.end(JSON.stringify({ "resultat" : 0, "message" : e}));
        }      
    });
});

app.listen(8888, function () {
    console.log("express has started on port 8888");
});