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
  const Users = await GetUsers(null, API_KEYS_Coll, false);
  let User = null;
  Users.forEach((UserData) => {
    if (UserData.APIKEY == API_APIKey) {
      User = UserData;
      return;
    }
  });

  return User;
}

async function UpdateDocument(Collection, filter, updateObject) {
  const updateDoc = {
    $set: updateObject,
  };

  await Collection.updateOne(filter, updateDoc).catch((e) => console.log(e));
}

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
      if (!API_AdminKey || API_AdminKey != Admin_Data.AdminKey) {
        res.status(403).end();
        return;
      }

      let APIKEY = Generate_APIKEY();
      if (APIKEY_Exists(API_KEYS_Data, APIKEY)) APIKEY = Generate_APIKEY();

      const New_APIKEY_Doc = {
        APIKEY: APIKEY,
        Enabled: true,
        FirstLogin: new Date().toUTCString(),
        LastLogin: new Date().toUTCString(),
        History: [{}],
        DeviceID: "",
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
  }
});

app.get("/v1/get-users", (req, res) => {
  try {
    (async () => {
      const API_AdminKey = new URLSearchParams(req.url).get("/v1/get-users?adminKey");

      await MongoClient.connect();
      const database = MongoClient.db("Streamcal");
      const _isAdmin = await checkIsAdmin(database, API_AdminKey);
      if (!_isAdmin) {
        res.status(403).end();
        return;
      }
      const API_KEYS_Coll = database.collection("API_KEYS");
      let Users = [];

      await API_KEYS_Coll.find().forEach((e) => {
        Users.push(e);
      });
      res.send(Users).end();
    })();
  } catch (e) {
    console.log("check-adminkey:", e);
    res.status(403).end();
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
      await MongoClient.connect();
      const database = MongoClient.db("Streamcal");
      const API_KEYS_Coll = database.collection("API_KEYS");
      const API_APIKey = new URLSearchParams(req.url).get("/v1/authenticate-user?apikey");
      const API_DeviceID = new URLSearchParams(req.url).get("deviceId");

      if (!API_APIKey || !API_DeviceID) {
        console.log("authenticate-user: missing params");
        res.status(403).end();
        return;
      }
      const User = await GetUserByAPIKEY(API_KEYS_Coll, API_APIKey);
      //console.log(User.length === 0, User);

      if (!User) {
        res.send(LoginStatus.UserNotExist).end();
        console.log("UserNotExist");
        return;
      }

      let updateObject = {}; //{ DeviceID: "Testus" };

      if (!User.Enabled) {
        res.send(LoginStatus.Account_Disabled).end();
        console.log("Account Disabled");
        return;
      }
      if (!User.DeviceID) {
        // New User
        updateObject = { FirstLogin: new Date().toUTCString(), DeviceID: API_DeviceID };
        console.log("New User");
        res.send(LoginStatus.New_User).end();
      } else if (User.DeviceID != API_DeviceID) {
        // Authentication Failed => Wrong DeviceID
        console.log("Authentication Failed => Wrong DeviceID");
        res.send(LoginStatus.Wrong_Device).end();
      } else if (User.DeviceID == API_DeviceID) {
        // Login succeed
        updateObject = { LastLogin: new Date().toUTCString() };
        console.log("Login succeed");
        res.send(LoginStatus.Login_Succeed).end();
      } else {
        console.log("Unkown: Login Failed");
        res.status(403).end();
      }

      if (!updateObject) return;
      await UpdateDocument(API_KEYS_Coll, User, updateObject);
    })();
  } catch (e) {
    res.status(403).end();
  }
});

app.get("*", (req, res) => {
  //res.send(mediaData);
  //res.send("kok").status(200).end();

  res.status(403).end();
});
app.listen(port, () => console.log("Server listening at Port:", port));

//app.listen(port, "192.168.2.121", () => console.log("Server listening at Port:", port));
