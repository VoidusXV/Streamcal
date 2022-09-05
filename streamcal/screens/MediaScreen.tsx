import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";

import Slider from "@react-native-community/slider";
import Spinner from "react-native-loading-spinner-overlay";

import { MaterialIcons } from "@expo/vector-icons";
import { backgroundColor, selectionColor } from "../constants/Colors";
import { WindowSize } from "../constants/Layout";

const Vid = require("../assets/MediaTest/CCTEST.mp4");

const VideoPlayer = ({ navigation }: any) => {
  const [status, setStatus] = React.useState<any>({});
  const [isLoaded, setLoaded] = React.useState<any>(false);
  const [getCurrentPosition, setCurrentPosition] = React.useState<any>(0); // Miliseconds

  const video = React.useRef<any>(null);
  const Duration = React.useRef<any>(0);

  const IconSize = WindowSize.Width * 0.15;
  const Mini_IconSize = WindowSize.Width * 0.08;

  const Middle_Buttons = () => {
    return (
      <View style={{ flexDirection: "row", alignSelf: "center", marginTop: "25%" }}>
        <MaterialIcons
          name="replay-10"
          onPress={async () => {
            await video.current.replayAsync();
          }}
          size={IconSize}
          style={{ marginRight: "5%" }}
          color="white"></MaterialIcons>
        <MaterialIcons
          name={status.isPlaying ? "pause" : "play-arrow"}
          size={IconSize}
          color="white"
          onPress={async () => {
            console.log(status.isPlaying);
            //await video.current.playAsync();
            status.isPlaying ? await video.current.pauseAsync() : await video.current.playAsync();
            //console.log(status.isPlaying);
          }}></MaterialIcons>
        <MaterialIcons
          name="forward-10"
          onPress={async () => {
            await video.current.pauseAsync();
          }}
          size={IconSize}
          style={{ marginLeft: "5%" }}
          color="white"></MaterialIcons>
      </View>
    );
  };

  //console.log(video.current.getStatusAsync());
  //  {/* <MaterialIcons name="close-fullscreen" size={24} color="black" /> */}

  return (
    <View style={styles.video_container}>
      <>
        <Video
          //ref={(e)=> console.log(e?.props.)}
          ref={video}
          onLoadStart={() => console.log("on load start")}
          onLoad={(e: any) => {
            Duration.current = e.durationMillis;
            setLoaded(true);
          }}
          style={{ ...styles.video }}
          resizeMode={ResizeMode.COVER}
          progressUpdateIntervalMillis={500}
          onPlaybackStatusUpdate={(status: any) => {
            setStatus(() => status);
          }}
          source={{ uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }}></Video>
        <View
          style={{
            width: "100%",
            height: "20%",
            position: "absolute",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: "5%",
            paddingLeft: "5%",
          }}>
          <MaterialIcons
            name="arrow-back"
            size={Mini_IconSize}
            onPress={() => navigation.goBack()}
            color="white"
          />
          <MaterialIcons name="settings" size={Mini_IconSize} color="white"></MaterialIcons>
        </View>

        <Middle_Buttons></Middle_Buttons>

        <Spinner
          size={IconSize}
          indicatorStyle={{
            position: "absolute",
            top: "15%",
          }}
          color={selectionColor}
          visible={!isLoaded}></Spinner>

        <MaterialIcons
          name="open-in-full"
          size={Mini_IconSize}
          style={{ position: "absolute", marginLeft: "90%", marginTop: "45%" }}
          color="white"></MaterialIcons>

        <Slider
          style={{
            width: "102%",
            height: "20%",
            marginTop: "12%",
            // backgroundColor: "red",
            right: "2%",
          }}
          minimumValue={0}
          maximumValue={Duration?.current}
          minimumTrackTintColor={selectionColor}
          maximumTrackTintColor="white"
          thumbTintColor={selectionColor}
          onValueChange={(e) => setCurrentPosition(e)}
          value={status.positionMillis}
          onSlidingStart={async () => {
            await video.current.pauseAsync();
          }}
          onSlidingComplete={async () =>
            await video?.current.playFromPositionAsync(getCurrentPosition)
          }></Slider>
      </>
    </View>
  );
};

const MediaScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <VideoPlayer navigation={navigation}></VideoPlayer>
    </View>
  );
};

export default MediaScreen;

const styles = StyleSheet.create({
  container: { height: "100%", width: "100%", backgroundColor: backgroundColor },
  video: { width: "100%", height: "100%", backgroundColor: "black", position: "absolute" },
  ContainerMiddle: { justifyContent: "center", alignItems: "center" },
  video_container: {
    width: "100%",
    height: "30%",
    backgroundColor: "black",
    //justifyContent: "center",
    //alignItems: "center",
  },
});
