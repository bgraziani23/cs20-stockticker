const fs = require('fs');
const readline = require('readline');
const MongoClient = require('mongodb').MongoClient;

const connStr = "mongodb+srv://brendangraziani:mongoDBpwCC001929@cluster0.w7orxfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const filePath = 'companies-1.csv';


MongoClient.connect(connStr, async function(err, db) {
    if (err) {
        console.error("Connection error:", err);
        return;
    }
  
    var dbo = db.db("Stock");
    var collection = dbo.collection("PublicCompanies");

    console.log("Successfully Connected to Database!");
	
    try {
        await collection.deleteMany({});
        console.log("All documents deleted.");
    } catch (err) {
        console.error("Error deleting documents:", err);
        db.close();
        return;
    }

    var rl = readline.createInterface({
        input: fs.createReadStream(filePath)
    });

    try {
        for await (var line of rl) {
            if (line !== "Company,Ticker,Price") {
                var [name, ticker, price] = line.split(',');
                var document = {name, ticker, price: parseFloat(price)};

                try {
                    await collection.insertOne(document);
                    console.log(`Inserted: ${line}`);
                } catch (err) {
                    console.error("Insert error:", err);
                }
            }
        };

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (db) {
            await db.close();
            console.log("Database Connection Closed.");
        }
    }
});