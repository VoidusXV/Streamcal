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

export { generateThumbnail };
