import { StyleSheet, Text, View } from "react-native";
import React from "react";
import * as VideoThumbnails from "expo-video-thumbnails";

const generateThumbnail = async (VideoURL: any, Time = 15000, quality?: any) => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(VideoURL, {
      time: Time,
      quality: quality,
    });
    return uri;
  } catch (e) {
    return e;
  }
};

function MilisecondsToMinutes(num: any, round = true) {
  if (round) return Math.round(num / 1000 / 60);

  return num / 1000 / 60;
}
export { generateThumbnail, MilisecondsToMinutes };
