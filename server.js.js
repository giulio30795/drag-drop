const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(cors());

app.post("/saveData", (req, res) => {
    const data = req.body;
    const filePath = path.join(__dirname, "arbitri.json");

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        console.log("data", data);
        if (err) {
            console.error("Error writing file:", err);
            return res.status(500).send("Internal Server Error");
        }
        res.send("Data saved successfully");
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
