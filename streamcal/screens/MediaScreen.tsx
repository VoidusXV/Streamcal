import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";

import { backgroundColor } from "../constants/Colors";
const MediaScreen = () => {
  const video = React.useRef<any>(null);
  const [status, setStatus] = React.useState<any>({});
  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={{ ...styles.video }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        source={require("../assets/MediaTest/CCTEST.mp4")}></Video>
      <Button
        title={status.isPlaying ? "Pause" : "Play"}
        onPress={() => (status.isPlaying ? video.current.pauseAsync() : video.current.playAsync())}
      />
    </View>
  );
};

export default MediaScreen;

const styles = StyleSheet.create({
  container: { height: "100%", width: "100%", backgroundColor: backgroundColor },
  video: { width: "100%", height: "30%", backgroundColor: "black" },
});
