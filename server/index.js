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

function Generate_APIKEY() {
  const Numbers = "0123456789";
  const UpperAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let apikey = "";
  let randomNum = 0;

  for (let i = 0; i < 25; i++) {
    if (i % 5 == 0 && i > 1) apikey += "-";

    randomNum = Math.floor(Math.random() * 2);
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

async function checkIsAdmin(database, API_AdminKey) {
  if (!database || !API_AdminKey) return false;

  const AdminColl = database.collection("Admin");
  const Admin_Data = await AdminColl.findOne({});
  if (API_AdminKey != Admin_Data.AdminKey) {
    return false;
  }

  return true;
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
async function GetUsers(_isAdmin, API_KEYS_Coll, adminAccess = true) {
  if (adminAccess) {
    if (!_isAdmin) {
      res.status(403).end();
      return;
    }
  }

  let Users = [];

  await API_KEYS_Coll.find().forEach((e) => {
    Users.push(e);
  });

  return Users;
}
async function GetUserByAPIKEY(API_KEYS_Coll, API_APIKey) {
  return await API_KEYS_Coll.findOne({ APIKEY: API_APIKey });
}

function AuthenticateUser(User, API_DeviceID) {
  if (!User) {
    console.log("AuthenticateUser: user doesnt exist");
    return false;
  }
  if (User?.DeviceID != API_DeviceID) {
    console.log("AuthenticateUser: wrong DeviceID");
    return false;
  }

  return true;
}

function API_ParamsCheck(...API_Params) {
  API_Params.forEach((ArgElement) => {
    if (!ArgElement) {
      console.log("API_ParamsCheck: missing params", ArgElement);
      return false;
    }
  });
}

async function UpdateDocument(Collection, filter, updateObject) {
  const updateDoc = {
    $set: updateObject, // $set: updateObject,
  };

  await Collection.updateOne(filter, updateDoc).catch((e) => console.log(e));
}

// Media API
async function GetAllContent() {
  const database = MongoClient.db("Streamcal");
  const Content_Collection = database.collection("Content");

  let AllContent = [];
  await Content_Collection.find({}, { projection: { _id: 0 } }).forEach((e) => AllContent.push(e));
  return AllContent;
}

async function getLocationData(ID) {
  const database = MongoClient.db("Streamcal");
  const Content_Collection = database.collection("Locations");
  let Content = {};
  let index = 0;
  await Content_Collection.find({}, { projection: { _id: 0 } }).forEach((e) => {
    if (index == ID) Content = e;
    index++;
  });
  return Content;
}
app.get("/index.html", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//TODO: Figuering out
app.get("/v1/ChunkTest", async (req, res) => {
  try {
    //console.log(__dirname, __filename);

    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header").end();
      return;
    }

    const vidPath = `${__dirname}/Data/0/Series/Season_1/2/2.mp4`;
    const videoSize = fs.statSync(vidPath).size;

    console.log(Number(range.replace(/\D/g, "")));

    const chunksize = 10 ** 6; // 10 MB in bytes
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunksize, videoSize - 1);
    const contentLength = end - start + 1;
    const contentType = "video/mp4";

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": contentType,
    };
    res.writeHead(206, headers);

    const stream = fs.createReadStream(vidPath, { start, end });
    stream.pipe(res);
    //console.log("first");
    //res.write(read);
    //console.log("first");
    //res.sendFile(vidPath);
  } catch (e) {
    console.log("ChunkTest error", e.message);
  }
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

app.get("/v1/Content", async (req, res) => {
  console.log("Trying to get Content");
  res.send(await GetAllContent()).end();
});

app.get("/v1/Media", async (req, res) => {
  try {
    const ContentID = new URLSearchParams(req.url).get("/v1/Media?id");
    if (!ContentID) return res.status(403);

    res.send(await getLocationData(ContentID));
  } catch (e) {
    return res.status(403);
  } finally {
    res.end();
  }
});

app.get("/v1/Media/Cover", (req, res) => {
  try {
    const ContentID = new URLSearchParams(req.url).get("/v1/Media/Cover?id");
    const url = __dirname + `/Data/${ContentID}/Cover.jpg`;

    const coverExists = fs.existsSync(url);
    console.log(coverExists);
    if (!ContentID || !coverExists) return res.status(403).end();

    res.sendFile(url);
  } catch (e) {
    res.status(403).end();
  }
});

//http://localhost:3005/v1/create-apikey?adminKey=OH13N-S316Z-4W25U-07RYY-C5V5B
// Database API
app.get("/v1/create-apikey", (req, res) => {
  try {
    (async () => {
      const API_AdminKey = new URLSearchParams(req.url).get("/v1/create-apikey?adminKey");
      const API_Description = new URLSearchParams(req.url).get("des");
      const API_ShowKey = new URLSearchParams(req.url).get("sk");

      await MongoClient.connect();
      //await MongoClient.db("admin").command({ ping: 1 });
      const database = MongoClient.db("Streamcal");
      const AdminColl = database.collection("Admin");
      const Admin_Data = await AdminColl.findOne({});

      const API_KEYS_Coll = database.collection("API_KEYS");
      const API_KEYS_Data = await API_KEYS_Coll.find({});
      if (!API_AdminKey || API_AdminKey != Admin_Data.AdminKey) {
        res.status(403).end();
        return;
      }

      let APIKEY = Generate_APIKEY();
      while (APIKEY_Exists(API_KEYS_Data, APIKEY)) APIKEY = Generate_APIKEY();

      const New_APIKEY_Doc = {
        APIKEY: APIKEY,
        Enabled: true,
        FirstLogin: "", // new Date().toUTCString(),
        LastLogin: "", // new Date().toUTCString(),
        History: [],
        DeviceID: "",
        Description: API_Description || "",
        WatchTime: [],
      };

      await API_KEYS_Coll.insertOne(New_APIKEY_Doc);
      res.send("API-KEY successfully created").status(200).end();
      //res.send(APIKEY).status(200).end();
      //TODO: Finally => Connection close
    })();
  } catch (e) {
    console.log("Watch_Error:", e);
    res.status(403).end();
  } finally {
    //MongoClient.close();
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
  } finally {
    //MongoClient.close();
  }
});

app.get("/v1/check-adminkey", (req, res) => {
  try {
    (async () => {
      const API_AdminKey = new URLSearchParams(req.url).get("/v1/check-adminkey?adminKey");

      await MongoClient.connect();
      const database = MongoClient.db("Streamcal");
      const _isAdmin = await checkIsAdmin(database, API_AdminKey);
      res.send(_isAdmin).end();
    })();
  } catch (e) {
    console.log("check-adminkey:", e);
    res.status(403).end();
  } finally {
    //MongoClient.close();
  }
});

app.get("/v1/get-users", (req, res) => {
  try {
    (async () => {
      const API_AdminKey = new URLSearchParams(req.url).get("/v1/get-users?adminKey");
      if (!API_AdminKey) {
        res.status(403).end();
        return;
      }

      await MongoClient.connect();
      const database = MongoClient.db("Streamcal");
      const _isAdmin = await checkIsAdmin(database, API_AdminKey);
      if (!_isAdmin) {
        res.status(403).end();
        return;
      }
      const API_KEYS_Coll = database.collection("API_KEYS");
      let Users = await GetUsers(_isAdmin, API_KEYS_Coll);
      Users?.map((e) => delete e?._id);

      res.send(Users).end();
    })();
  } catch (e) {
    console.log("check-adminkey:", e);
    res.status(403).end();
  } finally {
    //MongoClient.close();
  }
});
//http://localhost:3005/v1/set-users
app.post("/v1/set-users", (req, res) => {
  try {
    (async () => {
      const actionMode = req.body.actionMode;
      const APIKEYS = req.body.APIKEYS || [];
      const API_AdminKey = req.body.AdminKey;
      let UpdateObject =
        Object.keys(req.body.UpdateObject).length != 0 ? req.body.UpdateObject : null;

      const isChangeEmpty = actionMode == "change" && !UpdateObject;

      if (APIKEYS.length == 0 || !actionMode || !API_AdminKey || isChangeEmpty) {
        res.status(403).end();
        return;
      }

      await MongoClient.connect();
      const database = MongoClient.db("Streamcal");
      const API_KEYS_Coll = database.collection("API_KEYS");

      const _isAdmin = await checkIsAdmin(database, API_AdminKey);
      console.log("Admin:", _isAdmin);
      if (!_isAdmin) {
        res.status(403).end();
        return;
      }

      console.log("Testus");
      if (actionMode == "change") {
        UpdateDocument(API_KEYS_Coll, { APIKEY: APIKEYS[0] }, UpdateObject);
      } else if (actionMode == "delete") {
        APIKEYS.forEach(async (e) => {
          const query = { APIKEY: { $regex: e } };
          await API_KEYS_Coll.deleteMany(query);
        });
      }
      //console.log("Deleted " + result.deletedCount + " documents");

      res.end();
    })();
  } catch (e) {
    console.log("set-users:", e);
    res.status(403).end();
  } finally {
    //MongoClient.close();
  }
});

const LoginStatus = {
  UserNotExist: "-1",
  New_User: "0",
  Account_Disabled: "1",
  Wrong_Device: "2",
  Login_Succeed: "3",
  Unkown_Issue: "4",
};

app.get("/v1/authenticate-user", (req, res) => {
  try {
    (async () => {
      const API_APIKey = new URLSearchParams(req.url).get("/v1/authenticate-user?apikey");
      const API_DeviceID = new URLSearchParams(req.url).get("deviceId");

      if (!API_APIKey || !API_DeviceID) {
        console.log("authenticate-user: missing params");
        res.status(403).end();
        return;
      }

      await MongoClient.connect();
      const database = MongoClient.db("Streamcal");
      const API_KEYS_Coll = database.collection("API_KEYS");
      const User = await GetUserByAPIKEY(API_KEYS_Coll, API_APIKey);
      //console.log(User.length === 0, User);

      if (!User) {
        res.send(LoginStatus.UserNotExist).end();
        console.log("UserNotExist", new Date().toUTCString());
        return;
      }

      let updateObject = {}; //{ DeviceID: "Testus" };

      if (!User.Enabled) {
        res.send(LoginStatus.Account_Disabled).end();
        console.log("Account Disabled", new Date().toUTCString());
        return;
      }
      if (!User.DeviceID) {
        // New User
        updateObject = { FirstLogin: new Date().toUTCString(), DeviceID: API_DeviceID };
        console.log("New User");
        res.send(LoginStatus.New_User).end();
      } else if (User.DeviceID != API_DeviceID) {
        // Authentication Failed => Wrong DeviceID
        //console.log(`Wrong DeviceID ${User.DeviceID} != ${API_DeviceID}`, new Date().toUTCString());
        console.log("authenticate-user: Wrong DeviceID", new Date().toUTCString());

        res.send(LoginStatus.Wrong_Device).end();
      } else if (User.DeviceID == API_DeviceID) {
        // Login succeed
        updateObject = { LastLogin: new Date().toUTCString() };
        console.log("Login succeed", new Date().toUTCString());
        res.send(LoginStatus.Login_Succeed).end();
      } else {
        console.log("Unkown: Login Failed", new Date().toUTCString());
        res.status(403).end();
      }

      if (!updateObject) return;
      await UpdateDocument(API_KEYS_Coll, User, updateObject);
    })();
  } catch (e) {
    res.status(403).end();
  } finally {
    //MongoClient.close();
  }
});

app.post("/v1/get-history", async (req, res) => {
  try {
    const API_APIKey = req.body.APIKey;
    const API_DeviceID = req.body.DeviceID;

    if (!API_APIKey || !API_DeviceID) {
      console.log("get-history: missing params");
      return;
    }

    await MongoClient.connect();
    const database = MongoClient.db("Streamcal");
    const API_KEYS_Coll = database.collection("API_KEYS");
    const User = await GetUserByAPIKEY(API_KEYS_Coll, API_APIKey);
    if (!User) {
      console.log("get-history: user doesnt exist");
      return;
    }
    if (User.DeviceID != API_DeviceID) {
      console.log("get-history: wrong DeviceID");
      return;
    }
    res.send(User.History);
  } catch (e) {
    console.log("get-history error", e.message);
  } finally {
    res.status(403).end();
  }
});

app.post("/v1/add-history", async (req, res) => {
  try {
    const API_APIKey = req.body?.APIKey;
    const API_DeviceID = req.body?.DeviceID;
    const UpdateObject = req.body?.UpdateObject;

    if (!API_APIKey || !API_DeviceID || !UpdateObject) {
      console.log("add-history: missing params");
      res.status(403);
      return;
    }

    await MongoClient.connect();
    const database = MongoClient.db("Streamcal");
    const API_KEYS_Coll = database.collection("API_KEYS");
    const User = await GetUserByAPIKEY(API_KEYS_Coll, API_APIKey);

    if (!AuthenticateUser(User, API_DeviceID)) return;

    const filter = { APIKEY: API_APIKey };

    const indexExists = (element) =>
      element.ContentID == UpdateObject?.ContentID &&
      element.SeasonNum == UpdateObject?.SeasonNum &&
      element.EpisodeNum == UpdateObject?.EpisodeNum;

    const existsValue = User?.History.findIndex(indexExists);

    if (existsValue >= 0) User?.History?.splice(existsValue, 1);

    User?.History.splice(0, 0, UpdateObject);
    await UpdateDocument(API_KEYS_Coll, filter, { History: User?.History });

    console.log("History Added");
  } catch (e) {
    console.log("add-history error", e.message);
  } finally {
    res.end();
  }
});

app.post("/v1/get-watchtime", async (req, res) => {
  try {
    const API_APIKey = req.body?.APIKey;
    const API_DeviceID = req.body?.DeviceID;

    if (!API_APIKey || !API_DeviceID) {
      console.log("add-watchtime: missing params");
      res.status(403);
      return;
    }

    await MongoClient.connect();
    const database = MongoClient.db("Streamcal");
    const API_KEYS_Coll = database.collection("API_KEYS");
    const User = await GetUserByAPIKEY(API_KEYS_Coll, API_APIKey);

    if (!AuthenticateUser(User, API_DeviceID)) return;
    res.send(User?.WatchTime || []);
  } catch (e) {
    console.log("add-watchtime error", e.message);
  } finally {
    res.end();
  }
});
app.post("/v1/add-watchtime", async (req, res) => {
  try {
    const API_APIKey = req.body?.APIKey;
    const API_DeviceID = req.body?.DeviceID;
    const API_ContentID = req.body?.ContentID;
    const UpdateObject = req.body?.UpdateObject;

    if (!API_APIKey || !API_DeviceID || !UpdateObject || API_ContentID == undefined) {
      console.log("add-watchtime: missing params");
      res.status(403);
      return;
    }

    await MongoClient.connect();
    const database = MongoClient.db("Streamcal");
    const API_KEYS_Coll = database.collection("API_KEYS");
    const User = await GetUserByAPIKEY(API_KEYS_Coll, API_APIKey);

    if (!AuthenticateUser(User, API_DeviceID)) return;

    let ContentID_Index = 0;
    ContentID_Index = User.WatchTime.findIndex((x) => x.ContentID == API_ContentID);

    if (ContentID_Index == -1) {
      User.WatchTime.push({
        ContentID: API_ContentID,
        Locations: [UpdateObject],
      });
    } else {
      const findIndexEpisode = (x) =>
        x.SeasonNum == UpdateObject.SeasonNum && x.EpisodeNum == UpdateObject.EpisodeNum;

      const WatchTimeLocationsIndex =
        User.WatchTime[ContentID_Index].Locations.findIndex(findIndexEpisode);

      if (WatchTimeLocationsIndex == -1)
        User.WatchTime[ContentID_Index].Locations.push(UpdateObject);
      else User.WatchTime[ContentID_Index].Locations[WatchTimeLocationsIndex] = UpdateObject;
    }

    const filter = { APIKEY: API_APIKey };
    await UpdateDocument(API_KEYS_Coll, filter, { WatchTime: User.WatchTime });
    console.log("WatchTime Added");
  } catch (e) {
    console.log("add-watchtime error", e.message);
  } finally {
    res.end();
  }
});

app.get("/status", (req, res) => {
  res.send("0").end();
});
app.get("*", (req, res) => {
  //res.send(mediaData);
  //res.send("kok").status(200).end();

  res.status(403).end();
});

app.listen(port, () => console.log("Server listening at Port:", port));

//app.listen(port, "192.168.2.121", () => console.log("Server listening at Port:", port));
