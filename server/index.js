const cors = require("cors");
const express = require("express");
const app = express();
const fs = require("fs");
const port = 3005;

const Mongo = require("mongodb");
const MongoURL = `mongodb://localhost:${port}/`;
const MongoClient = new Mongo.MongoClient(MongoURL);

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

function Generate_APIKEY() {
  const Numbers = "0123456789";
  const UpperAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let apikey = "";
  let randomNum = 0;

  for (let i = 0; i < 25; i++) {
    if (i % 5 == 0 && i > 1) apikey += "-";

    randomNum = Math.floor(Math.random() * 1);
    if (randomNum == 0) {
      //Numbers
      randomNum = Math.floor(Math.random() * Numbers.length);
      apikey += Numbers[randomNum];
    } //UpperAlphabet
    else {
      randomNum = Math.floor(Math.random() * UpperAlphabet.length);
      apikey += UpperAlphabet[randomNum];
    }
  }
  return apikey;
}

function APIKEY_Exists(API_KEYS_Data, APIKEY) {
  let exists = false;
  API_KEYS_Data.forEach((e) => {
    if (e.APIKEY == APIKEY) {
      exists = true;
      return;
    }
  });

  return exists;
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
    const apikey = new URLSearchParams(req.url).get("apikey");

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

app.get("/v1/create-apikey", (req, res) => {
  try {
    (async () => {
      const API_AdminKey = new URLSearchParams(req.url).get("/v1/create-apikey?adminKey");

      await MongoClient.connect();
      //await MongoClient.db("admin").command({ ping: 1 });
      const database = MongoClient.db("Streamcal");
      const AdminColl = database.collection("Admin");
      const Admin_Data = await AdminColl.findOne({});

      const API_KEYS_Coll = database.collection("API_KEYS");
      const API_KEYS_Data = await API_KEYS_Coll.find({});

      if (API_AdminKey != Admin_Data.AdminKey) {
        res.status(403).end();
        return;
      }

      let APIKEY = Generate_APIKEY();
      if (APIKEY_Exists(API_KEYS_Data, APIKEY)) APIKEY = Generate_APIKEY();

      const New_APIKEY_Doc = {
        APIKEY: APIKEY,
        Enabled: false,
        FirstLogin: new Date().toUTCString(),
        LastLogin: new Date().toUTCString(),
        History: [{}],
        DeviceID: "DeviceID",
      };

      await API_KEYS_Coll.insertOne(New_APIKEY_Doc);
      res.send("API-KEY successfully created").status(200).end();

      //TODO: Finally => Connection close
    })();
  } catch (e) {
    console.log("Watch_Error:", e);
    res.status(403).end();
  }
});

app.get("/v1/check-apikey", (req, res) => {
  try {
    (async () => {
      await MongoClient.connect();
      const database = MongoClient.db("Streamcal");
      const API_KEYS_Coll = database.collection("API_KEYS");
      const API_KEYS_Data = await API_KEYS_Coll.find({});

      let APIKEY = Generate_APIKEY();
      if (APIKEY_Exists(API_KEYS_Data, APIKEY)) APIKEY = Generate_APIKEY();
      else console.log("Yeeet", APIKEY);
    })();
  } catch (e) {
    console.log("Watch_Error:", e);
    res.status(403).end();
  }
});

// app.get("/v1/watch", (req, res) => {
//   try {
//     res.sendFile(__dirname + "/index.html");
//   } catch (e) {
//     console.log("Watch_Error:", e);
//     res.status(403).end();
//   }
// });

// app.get("/v1/video", (req, res) => {
//   try {
//     const range = req.headers.range;

//     if (!range) {
//       res.status(400).send("Requires Range header");
//     }

//     // get video stats (about 61MB)
//     const videoPath = __dirname + "/Data/big_buck_bunny.mp4";
//     const videoSize = fs.statSync(videoPath).size;
//     // Parse Range
//     // Example: "bytes=32324-"
//     const CHUNK_SIZE = 10 ** 6; // byte to 1MB
//     const start = Number(range.replace(/\D/g, ""));
//     const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

//     // Create headers
//     const contentLength = end - start + 1;
//     const headers = {
//       "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//       "Accept-Ranges": "bytes",
//       "Content-Length": contentLength,
//       "Content-Type": "video/mp4",
//     };

//     // HTTP Status 206 for Partial Content
//     res.writeHead(206, headers);

//     // create video read stream for this particular chunk
//     const videoStream = fs.createReadStream(videoPath, { start, end });

//     // Stream the video chunk to the client
//     videoStream.pipe(res);
//   } catch (e) {
//     // console.log("Watch_Error:", e);
//     res.status(403).end();
//   }
// });

app.get("*", (req, res) => {
  //res.send(mediaData);
  //res.send("kok").status(200).end();

  res.status(403).end();
});
app.listen(port, () => console.log("Server listening at Port:", port));

//app.listen(port, "192.168.2.121", () => console.log("Server listening at Port:", port));
