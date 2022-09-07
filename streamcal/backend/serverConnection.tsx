import { StyleSheet, Text, View } from "react-native";
import React from "react";

const APIKEY = "";
const port = 3005;
const Local_IP = "192.168.2.121";

const baseURL = `http://localhost:` + port;
const baseIPURL = `http://${Local_IP}:` + port;

const AllContentURL = baseIPURL + "/v1/Content";
const mediaURL = baseIPURL + "/v1/Media";
const coverURL = mediaURL + "/Cover";

const serverConnection = () => {};

async function getAllContent() {
  try {
    const request = await fetch(AllContentURL);
    const data = request.json();
    return data;
  } catch {}
}
function getCoverURL(ID: any) {
  return `${coverURL}?id=${ID}`;
}

export { getAllContent, getCoverURL };
