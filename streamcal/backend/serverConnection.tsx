import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Local_IP from "./Local_IP";

const APIKEY = "";
const port = 3005;

const baseURL = `http://localhost:` + port;
const baseIPURL = `http://${Local_IP}:` + port;
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

export {
  getAllContent,
  getCoverURL,
  getSeasonAmount,
  getEpisodeAmount,
  getMediaLocations,
  getThumbnailURL,
  getVideoURL,
  getPreviewImageURL,
};
