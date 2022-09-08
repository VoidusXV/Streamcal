import { StyleSheet, Text, View } from "react-native";
import React from "react";
import * as VideoThumbnails from "expo-video-thumbnails";

const generateThumbnail = async (VideoURL: any) => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(VideoURL, {
      time: 15000,
    });
    return uri;
  } catch (e) {
    return e;
  }
};

export { generateThumbnail };
