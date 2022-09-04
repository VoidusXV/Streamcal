const express = require("express");
const app = express();
const port = 8000;

app.get("*", (req, res) => {
  res.writeHead(401);
});

app.listen(port, () => console.log("Server listening at Port:", port));
