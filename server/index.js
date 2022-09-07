const cors = require("cors");
const express = require("express");
const app = express();
const fs = require("fs");
const port = 3005;

app.use(cors());
app.use(express.json());

const All_Content = require("./Data/Content.json");
const mediaData = require("./Data/0/Locations.json");

function getContentAPI(ID) {
  const data = require(`./Data/${ID}/Locations.json`);
  return data;
}
function contentExists(ID) {
  const data = require(`./Data/Content.json`);
  return data.length > ID && ID >= 0;
}
//const image = require(__dirname + "/public/Cover.jpg"); //`./Data/${ID}/Cover.jpg`);

app.get("/v1/image", (req, res) => {
  //res.send(__dirname);
  //fs.readFile(__dirname + "/Cover.jpg", (e) => {});
  //res.sendFile(__dirname + "/Cover.jpg");
});

app.get("/v1/Content", (req, res) => {
  res.send(All_Content);
});
app.get("/v1/Media", (req, res) => {
  try {
    const ContentID = new URLSearchParams(req.url).get("/v1/Media?id");
    if (!ContentID) return res.status(403);

    res.send(getContentAPI(ContentID));
  } catch (e) {
    return res.status(403);
  } finally {
    res.end();
  }
});

app.get("/v1/Media/Cover", (req, res) => {
  try {
    const ContentID = new URLSearchParams(req.url).get("/v1/Media/Cover?id");

    if (!ContentID) return res.status(403).end();
    if (!contentExists(ContentID)) return res.status(403).end();

    const url = __dirname + `/Data/${ContentID}/Cover.jpg`;
    res.sendFile(url);
  } catch (e) {
    res.status(403).end();
  }
});

app.get("*", (req, res) => {
  //res.send(mediaData);
  //res.send("mediaData");
  res.status(403);
  res.end();

  //res.writeHead(401);
});

app.listen(port, () => console.log("Server listening at Port:", port));
