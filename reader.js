// Requires
const fs = require('fs');
const readline = require('readline');
const MongoClient = require('mongodb').MongoClient;

// Initial variables
const connStr = "mongodb+srv://brendangraziani:mongoDBpwCC001929@cluster0.w7orxfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const filePath = 'companies-1.csv';

// Connect to mongoDB
MongoClient.connect(connStr, async function(err, db) {
    if (err) {
        console.error("Connection error:", err);
        return;
    }
    
    // Get the right database and collection
    var dbo = db.db("Stock");
    var collection = dbo.collection("PublicCompanies");
    console.log("Successfully Connected to Database!");
	
    // Delete everything currently in the database
    try {
        await collection.deleteMany({});
        console.log("All documents deleted.");
    } catch (err) {
        console.error("Error deleting documents:", err);
        db.close();
        return;
    }

    // Get the file and create a read stream
    var rl = readline.createInterface({
        input: fs.createReadStream(filePath)
    });

    try {
        // Loop through each line of the file
        for await (var line of rl) {
            // Don't want to insert the column labels
            if (line !== "Company,Ticker,Price") {
                // Parse the line into name, ticker, and price
                var [name, ticker, price] = line.split(',');
                var document = {name, ticker, price: parseFloat(price)};

                // Insert the document into the collection
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
        // close the database
        if (db) {
            await db.close();
            console.log("Database Connection Closed.");
        }
    }
});