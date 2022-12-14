import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Local_IP from "./Local_IP";
import * as Device from "expo-device";
import * as Crypto from "expo-crypto";
import { IMediaData, ISeries } from "../components/constants/interfaces";

interface IServerInfo {
  Description?: any;
  APIKEY?: any;
  Server?: any;
  Port?: any;
  AdminKey?: any;
  isAdmin?: any;
}
let currentConnectionInfo: IServerInfo = {};
let VERSION = "1.0.0.0";

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

async function getServerData(URL: any, AbortController?: AbortController) {
  try {
    const request = await fetch(URL, { signal: AbortController?.signal });
    const data = request.json();
    return data;
  } catch (e: any) {
    console.log("getServerData_Error:", e.message, URL);
  }
}

async function getAllContent(AbortController?: AbortController) {
  return getServerData(AllContentURL(), AbortController);
}

function getCoverURL(ID: any) {
  return `${coverURL()}?id=${ID}`;
}

async function getMediaLocations(ID: any, AbortController?: AbortController) {
  return getServerData(mediaURL() + "?id=" + ID, AbortController);
}

function getSeasonAmount(data: IMediaData) {
  const Seasons = data?.Series?.Seasons;
  return Seasons ? Object.keys(data?.Series?.Seasons as any).length : 0;
}

function getEpisodeAmount(data: IMediaData) {
  let Episodes = 0;
  const SeasonAmount = getSeasonAmount(data);
  for (let index = 0; index < SeasonAmount; index++) {
    Episodes += Object.keys(data?.Series?.Seasons?.[index].Episodes as any).length;
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
  console.log(baseIPURL());
  const req = fetch(baseIPURL());
  return Promise.race([timeout, req])
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}

async function checkAdminKey(
  AdminKey: any,
  IP?: any,
  Port?: any,
  AbortController?: AbortController
) {
  let rep; // await getServerData(`${baseAPIURL()}/check-adminkey?adminKey=${AdminKey}`);
  if (!AdminKey || !Port) {
    rep = await getServerData(
      `${baseAPIURL()}/check-adminkey?adminKey=${AdminKey}`,
      AbortController
    );
    return rep;
  }

  const url = `http://${IP}:${Port}/v1`;
  rep = await getServerData(`${url}/check-adminkey?adminKey=${AdminKey}`, AbortController);
  return rep;
}

async function getAllUsers(AdminKey: any, AbortController?: AbortController) {
  const rep = await getServerData(
    `${baseAPIURL()}/get-users?adminKey=${AdminKey}`,
    AbortController
  );
  return rep;
}
function SetGlobalConnection(data: any) {
  currentConnectionInfo.Server = data?.Server;
  currentConnectionInfo.Port = data?.Port;
  currentConnectionInfo.APIKEY = data?.APIKEY;
  currentConnectionInfo.AdminKey = data?.AdminKey;
  currentConnectionInfo.isAdmin = data?.isAdmin || false;
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
  const DeviceID = await Generate_DeviceID(); // FIXME: DeviceID is not uniqe
  let URL = `${baseAPIURL()}/authenticate-user?apikey=${
    currentConnectionInfo.APIKEY
  }&deviceId=${DeviceID}`;

  if (APIKEY) URL = `${baseAPIURL()}/authenticate-user?apikey=${APIKEY}&deviceId=${DeviceID}`;

  const rep = await getServerData(URL);
  return rep;
}

async function Server_SetUsers(APIKEYS: Array<any>, actionMode: any, UpdateObject?: any) {
  let URL = `${baseAPIURL()}/set-users`;

  console.log(currentConnectionInfo.AdminKey);
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actionMode: actionMode,
      APIKEYS: APIKEYS,
      AdminKey: currentConnectionInfo.AdminKey,
      UpdateObject: UpdateObject,
    }),
  };

  await fetch(URL, requestOptions);
}

async function CreateAPIKEY(adminKey: any, description?: any) {
  let URL = `${baseAPIURL()}/create-apikey?adminKey=${adminKey}&des=${description}`;
  await fetch(URL);
}

async function Server_AddHistory(ContentID: any, Season: any, Episode: any) {
  const DeviceID = await Generate_DeviceID();
  let URL = `${baseAPIURL()}/add-history`;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      APIKey: currentConnectionInfo.APIKEY,
      DeviceID: DeviceID,
      UpdateObject: { ContentID: ContentID, SeasonNum: Season, EpisodeNum: Episode },
    }),
  };

  await fetch(URL, requestOptions);
}

async function Server_GetHistory() {
  const DeviceID = await Generate_DeviceID();
  let URL = `${baseAPIURL()}/get-history`;

  const requestOptions = {
    method: "POST", //TODO: change it back to GET
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      APIKey: currentConnectionInfo.APIKEY,
      DeviceID: DeviceID,
    }),
  };

  const request = await fetch(URL, requestOptions);
  const data = await request.json();
  return data;
}

async function Server_GetWatchTime() {
  const DeviceID = await Generate_DeviceID();
  let URL = `${baseAPIURL()}/get-watchtime`;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      APIKey: currentConnectionInfo.APIKEY,
      DeviceID: DeviceID,
    }),
  };

  const request = await fetch(URL, requestOptions);
  const data = await request.json();
  return data;
}

async function Server_AddWatchTime(
  ContentID: any,
  SeasonNum: any,
  EpisodeNum: any,
  WatchedDuration: any
) {
  const DeviceID = await Generate_DeviceID();
  let URL = `${baseAPIURL()}/add-watchtime`;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      APIKey: currentConnectionInfo.APIKEY,
      DeviceID: DeviceID,
      ContentID: ContentID,
      UpdateObject: {
        SeasonNum: SeasonNum,
        EpisodeNum: EpisodeNum,
        WatchedDuration: WatchedDuration,
      },
    }),
  };

  await fetch(URL, requestOptions);
}
export {
  getServerData,
  getAllContent,
  getCoverURL,
  getSeasonAmount,
  getEpisodeAmount,
  getMediaLocations,
  getThumbnailURL,
  getVideoURL,
  getPreviewImageURL,
  getAllUsers,
  IsServerReachable,
  checkAdminKey,
  currentConnectionInfo,
  IServerInfo,
  SetGlobalConnection,
  ServerAuthentication,
  AuthResponse,
  Server_SetUsers,
  CreateAPIKEY,
  Server_AddHistory,
  Server_GetHistory,
  Server_GetWatchTime,
  Server_AddWatchTime,
  VERSION,
};
