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

app.get("/v1/test", (req, res) => {
  const testVid = __dirname + "/Data/0/Series/Season_1/7/7.mp4";
  console.log(testVid);
  res.sendFile(testVid);
});

app.get("/v1/test2", (req, res) => {
  try {
    const ContentID = new URLSearchParams(req.url).get("/v1/test2?id");
    const SeasonID = new URLSearchParams(req.url).get("season");
    const EpisodeID = new URLSearchParams(req.url).get("episode");
    const dataRequest = new URLSearchParams(req.url).get("dr");

    if (!ContentID || !SeasonID || !EpisodeID || !dataRequest) return res.status(403).end();
    //if (!contentExists(ContentID)) return res.status(403).end();

    const mainPath = __dirname + `/Data/${ContentID}/Series/Season_${SeasonID}/${EpisodeID}`;
    let sendFilePath;

    if (dataRequest == "thumb") sendFilePath = `${mainPath}/Thumbnail.jpg`;
    else if (dataRequest == "sliderSeek") sendFilePath = `${mainPath}/SeekSliderPreview.png`;
    else if (dataRequest == "video") sendFilePath = `${mainPath}/${EpisodeID}.mp4`;
    else return res.status(403).end();

    const fileExists = fs.existsSync(sendFilePath);
    if (!fileExists) return res.status(403).end();

    //console.log(fileExists);
    res.sendFile(sendFilePath);
  } catch (e) {
    console.log("test2 error", e.message);
    res.status(403).end();
  }
});

app.get("/v1/image", (req, res) => {
  //res.send(__dirname);
  //fs.readFile(__dirname + "/Cover.jpg", (e) => {});
  //res.sendFile(__dirname + "/Cover.jpg");
});

app.get("/v1/Content", (req, res) => {
  console.log("Trying to get Content");
  res.send(All_Content).end();
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

app.get("/v1/watch", (req, res) => {
  try {
    res.sendFile(__dirname + "/index.html");
  } catch (e) {
    console.log("Watch_Error:", e);
    res.status(403).end();
  }
});

app.get("/v1/video", (req, res) => {
  try {
    const range = req.headers.range;

    if (!range) {
      res.status(400).send("Requires Range header");
    }

    // get video stats (about 61MB)
    const videoPath = __dirname + "/Data/big_buck_bunny.mp4";
    const videoSize = fs.statSync(videoPath).size;
    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // byte to 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
  } catch (e) {
    // console.log("Watch_Error:", e);
    res.status(403).end();
  }
});

app.get("*", (req, res) => {
  //res.send(mediaData);

  res.status(403);
  res.end();
});
app.listen(port, () => console.log("Server listening at Port:", port));

//app.listen(port, "192.168.2.121", () => console.log("Server listening at Port:", port));
