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

http.createServer(async function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    const urlObj = url.parse(req.url, true);

    try {
        if (urlObj.pathname === "/") {
            res.write("<h2>Stock Lookup</h2>");
            res.write("<form method='get' action='/process'>");
            res.write("Search by: ");
            res.write("<input type='radio' name='searchType' value='name' checked> Company Name ");
            res.write("<input type='radio' name='searchType' value='ticker'> Ticker Symbol<br><br>");
            res.write("Enter value: <input type='text' name='query'><br><br>");
            res.write("<input type='submit' value='Search'>");
            return res.end();

        } else if (urlObj.pathname === "/process") {
            const searchType = urlObj.query.searchType;
            const query = urlObj.query.query;

            if (!query) {
                res.write("<p>No query entered. Please go back and try again.</p>");
                return res.end();
            }

            const client = await MongoClient.connect(connStr, { useUnifiedTopology: true });
            const dbo = client.db("Stock"); // Make sure this is the exact DB name
            const collection = dbo.collection("PublicCompanies"); // And collection name

            const searchQuery = (searchType === 'name') 
                ? { name: { $regex: new RegExp(query, 'i') } }
                : { ticker: { $regex: new RegExp(query, 'i') } };

            const results = await collection.find(searchQuery).toArray();

            if (results.length === 0) {
                res.write("<p>No results found.</p>");
            } else {
                res.write("<h3>Search Results:</h3><ul>");
                results.forEach(doc => {
                    const price = doc.price?.toFixed ? `$${doc.price.toFixed(2)}` : "N/A";
                    res.write(`<li><strong>${doc.name}</strong> (${doc.ticker}): ${price}</li>`);
                });
                res.write("</ul>");
            }

            await client.close();
            return res.end();

        } else {
            res.write("<p>404 Not Found</p>");
            return res.end();
        }
    } catch (err) {
        console.error("Server error:", err);
        res.write("<p>Internal server error.</p>");
        return res.end();
    }
}).listen(port, () => {
    console.log("Server running on port " + port);
});