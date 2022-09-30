import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Local_IP from "./Local_IP";
import * as Device from "expo-device";
import * as Crypto from "expo-crypto";

interface IServerInfo {
  APIKEY?: any;
  Server?: any;
  Port?: any;
  AdminKey?: any;
  isAdmin?: any;
}
let currentConnectionInfo: IServerInfo = {};
//let Port = 3005;
//let APIKEY = "";
//let isAdmin: String = "";

//const baseURL = `http://localhost:` + Port;
//let baseIPURL = `http://${Local_IP}:` + Port;

//let baseIPURL = `http://${currentConnectionInfo.Server}:` + currentConnectionInfo.Port;

function baseIPURL() {
  return `http://${currentConnectionInfo.Server}:` + currentConnectionInfo.Port;
}
function baseAPIURL() {
  return baseIPURL() + "/v1";
}

function AllContentURL() {
  return baseAPIURL() + "/Content";
}
function mediaURL() {
  return baseAPIURL() + "/Media";
}
function coverURL() {
  return mediaURL() + "/Cover";
}
//const mediaURL = baseIPURL() + "/v1/Media";
//const coverURL = mediaURL + "/Cover";

async function getServerData(URL: any) {
  try {
    const request = await fetch(URL);
    const data = request.json();
    return data;
  } catch (e: any) {
    console.log("getServerData_Error:", e.message, URL);
  }
}

async function getAllContent() {
  return getServerData(AllContentURL());
}

function getCoverURL(ID: any) {
  return `${coverURL()}?id=${ID}`;
}

async function getMediaLocations(ID: any) {
  return getServerData(mediaURL() + "?id=" + ID);
}

function getSeasonAmount(data: any) {
  return Object.keys(data.Series.Seasons).length;
}

function getEpisodeAmount(data: any) {
  let Episodes = 0;
  const SeasonAmount = getSeasonAmount(data);
  for (let index = 0; index < SeasonAmount; index++) {
    Episodes += Object.keys(data.Series.Seasons[index].Episodes).length;
  }
  return Episodes;
}

function getThumbnailURL(ContentID: any, SeasonID: any, EpisodeID: any) {
  const URL = `${baseAPIURL()}/test2?id=${ContentID}&season=${SeasonID}&episode=${EpisodeID}&dr=thumb`;
  return URL;
}

function getPreviewImageURL(ContentID: any, SeasonID: any, EpisodeID: any) {
  const URL = `${baseAPIURL()}/test2?id=${ContentID}&season=${SeasonID}&episode=${EpisodeID}&dr=sliderSeek`;
  return URL;
}
function getVideoURL(ContentID: any, SeasonID: any, EpisodeID: any) {
  const URL = `${baseAPIURL()}/test2?id=${ContentID}&season=${SeasonID}&episode=${EpisodeID}&dr=video`;
  return URL;
}

function IsServerReachable() {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(reject, 3000, "Request timed out");
  });
  const req = fetch(baseIPURL());
  return Promise.race([timeout, req])
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}

async function checkAdminKey(AdminKey: any) {
  const rep = await getServerData(`${baseAPIURL()}/check-adminkey?adminKey=${AdminKey}`);
  return rep;
}

function SetGlobalConnection(data: any) {
  currentConnectionInfo.Server = data?.Server;
  currentConnectionInfo.Port = data?.Port;
  currentConnectionInfo.APIKEY = data?.APIKEY;
  currentConnectionInfo.AdminKey = data?.AdminKey;
}

async function Generate_DeviceID() {
  let Val =
    (Device?.modelName || "modelName") +
    (Device.osName || "osName") +
    (Device.deviceYearClass || "deviceYearClass");

  const EncryptedDeviceID = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA512,
    Val
  );
  return EncryptedDeviceID;
}
enum AuthResponse {
  UserNotExist = -1,
  New_User = 0,
  Account_Disabled = 1,
  Wrong_Device = 2,
  Login_Succeed = 3,
  Unkown_Issue = 4,
}

async function ServerAuthentication(APIKEY = null) {
  const DeviceID = await Generate_DeviceID();
  let URL = `${baseAPIURL()}/authenticate-user?apikey=${
    currentConnectionInfo.APIKEY
  }&deviceId=${DeviceID}`;

  if (APIKEY) URL = `${baseAPIURL()}/authenticate-user?apikey=${APIKEY}&deviceId=${DeviceID}`;

  const rep = await getServerData(URL);
  return rep;
}

export {
  getAllContent,
  getCoverURL,
  getSeasonAmount,
  getEpisodeAmount,
  getMediaLocations,
  getThumbnailURL,
  getVideoURL,
  getPreviewImageURL,
  IsServerReachable,
  checkAdminKey,
  currentConnectionInfo,
  IServerInfo,
  SetGlobalConnection,
  ServerAuthentication,
  AuthResponse,
};
