const http = require("http");
const fs = require("fs");
const path = require("path");
const { StringDecoder } = require("string_decoder");

// Define the port and file path
const port = 3000;
const filePath = path.join(__dirname, "arbitri.json");

// Create a server
const server = http.createServer((req, res) => {
    // Handle CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST"); // Allow specific methods
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow specific headers

    // Handle OPTIONS preflight request
    if (req.method === "OPTIONS") {
        res.writeHead(204); // No content
        res.end();
        return;
    }

    // Handle only POST requests to /saveData
    if (req.method === "POST" && req.url === "/saveData") {
        const decoder = new StringDecoder("utf-8");
        let body = "";

        // Collect the data chunks
        req.on("data", (chunk) => {
            body += decoder.write(chunk);
        });

        // When all chunks are collected
        req.on("end", () => {
            body += decoder.end();

            // Parse the data
            let data;
            try {
                data = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("Invalid JSON");
                return;
            }

            // Write the data to the file
            fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Error saving data");
                    return;
                }
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("Data saved successfully");
            });
        });
    } else {
        // Serve static files or handle other routes here
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
