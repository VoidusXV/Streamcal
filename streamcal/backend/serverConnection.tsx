import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Local_IP from "./Local_IP";

const APIKEY = "";
const port = 3005;

const baseURL = `http://localhost:` + port;
const baseIPURL = `http://${Local_IP}:` + port;

const AllContentURL = baseIPURL + "/v1/Content";
const mediaURL = baseIPURL + "/v1/Media";
const coverURL = mediaURL + "/Cover";

const serverConnection = () => {};

async function getServerData(URL: any) {
  try {
    const request = await fetch(URL);
    const data = request.json();
    return data;
  } catch {}
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

export { getAllContent, getCoverURL, getSeasonAmount, getEpisodeAmount, getMediaLocations };
