// var http = require('http');
// var url = require('url');
// var port = process.env.PORT || 3000;
// //var port = 8080;   //uncomment to run local
// console.log("This goes to the console window");
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   urlObj = url.parse(req.url,true)
//   if (urlObj.pathname == "/") 
//   {
//      res.write ("Success!  This app is deployed online");
//      res.write("<h2>This is my hello application</h2>");
//      s = "<form method='get' action='/process'>" +
//          "Enter the secret ID <input type='text' name='id'><br /><input type='submit'></form>"
//      res.write(s)
//      res.end()
//   }
//   else if (urlObj.pathname == "/process") {
//   id = urlObj.query.id
  
//   res.write ("The id is: " + id)
//   res.end();
//   console.log('hey')
//   }
// }).listen(port);



const http = require('http');
const url = require('url');
const MongoClient = require('mongodb').MongoClient;

const connStr = "mongodb+srv://brendangraziani:mongoDBpwCC001929@cluster0.w7orxfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const port = process.env.PORT || 3000;

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    let urlObj = url.parse(req.url, true);

    if (urlObj.pathname === "/") {
        // Home View: HTML Form
        res.write("<h2>Stock Lookup</h2>");
        res.write("<form method='get' action='/process'>");
        res.write("Search by: ");
        res.write("<input type='radio' name='searchType' value='name' checked> Company Name ");
        res.write("<input type='radio' name='searchType' value='ticker'> Ticker Symbol<br><br>");
        res.write("Enter value: <input type='text' name='query'><br><br>");
        res.write("<input type='submit' value='Search'>");
        res.write("</form>");
        res.end();

    } else if (urlObj.pathname === "/process") {
        // Process View
        let searchType = urlObj.query.searchType;
        let query = urlObj.query.query;

        if (!query) {
            res.write("<p>No query entered. Please go back and try again.</p>");
            return res.end();
        }

        MongoClient.connect(connStr, async function(err, db) {
            if (err) {
                console.error("Connection error:", err);
                res.write("<p>Error connecting to the database.</p>");
                return res.end();
            }

            const dbo = db.db("Stock");
            const collection = dbo.collection("PublicCompanies");

            let searchQuery = {};
            if (searchType === 'name') {
                searchQuery = { name: { $regex: new RegExp(query, 'i') } }; // case-insensitive partial match
            } else {
                searchQuery = { ticker: { $regex: new RegExp(query, 'i') } };
            }

            try {
                const results = await collection.find(searchQuery).toArray();
                if (results.length === 0) {
                    res.write("<p>No results found.</p>");
                } else {
                    res.write("<h3>Search Results:</h3><ul>");
                    results.forEach(doc => {
                        console.log(doc);
                        res.write(`<li><strong>${doc.name}</strong> (${doc.ticker}): $${doc.price.toFixed(2)}</li>`);
                    });
                    res.write("</ul>");
                }
            } catch (searchErr) {
                console.error("Search error:", searchErr);
                res.write("<p>Error searching the database.</p>");
            } finally {
                db.close();
                res.end();
            }
        });
    } else {
        res.write("<p>404 Not Found</p>");
        res.end();
    }

}).listen(port, () => {
    console.log("Server running on port " + port);
});
