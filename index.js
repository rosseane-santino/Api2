const express = require("express");
const bodyParser = require("body-parser");
const { renameCode } = require("./renamer");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

app.get("/", (req, res) => {
    res.send("Lua Renamer API Running");
});

app.post("/rename", (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Missing code" });
    }

    try {
        const result = renameCode(code);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Running on", port));
