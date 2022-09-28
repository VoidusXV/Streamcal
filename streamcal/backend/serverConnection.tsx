import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Local_IP from "./Local_IP";

let Port = 3005;
let APIKEY = "";
let isAdmin = false;

const baseURL = `http://localhost:` + Port;
let baseIPURL = `http://${Local_IP}:` + Port;
const baseAPIURL = baseIPURL + "/v1";

const AllContentURL = baseIPURL + "/v1/Content";
const mediaURL = baseIPURL + "/v1/Media";
const coverURL = mediaURL + "/Cover";

const serverConnection = () => {};

async function getServerData(URL: any) {
  try {
    const request = await fetch(URL);
    const data = request.json();
    return data;
  } catch (e: any) {
    console.log("getServerData_Error:", e.message);
  }
}

async function getAllContent() {
  return getServerData(AllContentURL);
}

function getCoverURL(ID: any) {
  return `${coverURL}?id=${ID}`;
}

async function getMediaLocations(ID: any) {
  return getServerData(mediaURL + "?id=" + ID);
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
  const URL = `${baseAPIURL}/test2?id=${ContentID}&season=${SeasonID}&episode=${EpisodeID}&dr=thumb`;
  return URL;
}

function getPreviewImageURL(ContentID: any, SeasonID: any, EpisodeID: any) {
  const URL = `${baseAPIURL}/test2?id=${ContentID}&season=${SeasonID}&episode=${EpisodeID}&dr=sliderSeek`;
  return URL;
}
function getVideoURL(ContentID: any, SeasonID: any, EpisodeID: any) {
  const URL = `${baseAPIURL}/test2?id=${ContentID}&season=${SeasonID}&episode=${EpisodeID}&dr=video`;
  return URL;
}

function IsServerReachable() {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(reject, 3000, "Request timed out");
  });

  const req = fetch(baseIPURL);
  return Promise.race([timeout, req])
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}

async function checkAdminKey(AdminKey: any) {
  const rep = await getServerData(`${baseAPIURL}/check-adminkey?adminKey=${AdminKey}`);
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
};
