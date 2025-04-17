// Requires
const http = require('http');
const url = require('url');
const MongoClient = require('mongodb').MongoClient;

// Initial variables
const connStr = "mongodb+srv://brendangraziani:mongoDBpwCC001929@cluster0.w7orxfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const port = process.env.PORT || 3000;

http.createServer(async function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    const urlObj = url.parse(req.url, true);

    try {
        // Home page
        if (urlObj.pathname === "/") {
            res.write("<h2>Stock Lookup</h2>");

            // Write the form to the page (goes to process page on submission)
            res.write("<form method='get' action='/process'>");
            res.write("Search by: ");
            res.write("<input type='radio' name='searchType' value='name' checked> Company Name ");
            res.write("<input type='radio' name='searchType' value='ticker'> Ticker Symbol<br><br>");
            res.write("Enter value: <input type='text' name='query'><br><br>");
            res.write("<input type='submit' value='Search'>");
            return res.end();
        }
        // Process page
        else if (urlObj.pathname === "/process") {
            // Get info from the form
            const searchType = urlObj.query.searchType;
            const query = urlObj.query.query;

            // Error message for no query entered
            if (!query) {
                res.write("<p>No query entered. Please go back and try again.</p>");
                return res.end();
            }
            
            // Connect to mongoDB
            const client = await MongoClient.connect(connStr);

            // Get the right database and collection
            const dbo = client.db("Stock"); // Make sure this is the exact DB name
            const collection = dbo.collection("PublicCompanies"); // And collection name

            let searchQuery = {};
            if (searchType === 'name') {
                searchQuery.name = query;
            } else {
                searchQuery.ticker = query;
            }

            // Put the results (documents) in an array
            const results = await collection.find(searchQuery).toArray();

            // Display the results to the page (error message if none)
            if (results.length === 0) {
                res.write("<p>No results found.</p>");
            } else {
                res.write("<h3>Search Results:</h3><ul>");
                // Loop through each document with matching name/ticker
                results.forEach(doc => {
                    let price;
                    // If price exists and it's a number, display it
                    if (doc.price && typeof doc.price === 'number') {
                        price = "$" + Math.round(doc.price * 100) / 100;
                    // Otherwise, print N/A
                    } else {
                        price = "N/A";
                    }
                    res.write("<li><strong>" + doc.name + "</strong> (" + doc.ticker + "): " + price + "</li>");
                });
                res.write("</ul>");
            }

            // Close the database
            await client.close();
            return res.end();
        
        // Nonexistent page
        } else {
            res.write("<p>404 Not Found</p>");
            return res.end();
        }
    // Write error messages to console and page
    } catch (err) {
        console.error("Server error:", err);
        res.write("<p>Internal server error.</p>");
        return res.end();
    }
}).listen(port);