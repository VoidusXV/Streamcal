import { StyleSheet, Text, View, Button, ScrollView, Animated } from "react-native";
import React from "react";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";

import Slider from "@react-native-community/slider";
import Spinner from "react-native-loading-spinner-overlay";

import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import Seperator from "../components/Designs/Seperator";
import MediaItemCard from "../components/Designs/MediaItemCard";

function MilisecondsToTimespamp(num: any) {
  const sec = Math.trunc(num / 1000);
  const min = Math.trunc(sec / 60);

  if (sec < 60) {
    if (sec >= 10) return `00:${sec}`;
    return `00:0${sec}`;
  }

  if (sec <= 10) return `0${min}:0${sec % 60}`;

  return `0${min}:${sec % 60}`;
}

const VideoPlayer = ({ navigation }: any) => {
  const [status, setStatus] = React.useState<any>({});
  const [isLoaded, setLoaded] = React.useState<any>(false);
  const [getCurrentPosition, setCurrentPosition] = React.useState<any>(0); // Miliseconds
  const [wasPlaying, setwasPlaying] = React.useState(false);
  const [isIcons, setIcons] = React.useState(true);
  const [isSliding, setSliding] = React.useState(false);

  const video = React.useRef<any>(null);
  const videoLayout = React.useRef<any>(null);
  const a = React.useRef<any>(null);
  const isSliding2 = React.useRef<any>(false);
  const isMoving = React.useRef<any>(false);

  const Duration = React.useRef<any>(0);

  const IconSize = WindowSize.Width * 0.15;
  const Mini_IconSize = WindowSize.Width * 0.08;

  const Middle_Buttons = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignSelf: "center",
          height: IconSize,
          // marginTop: (WindowSize.Height * 0.3) / 2 - IconSize / 2,
          //position: "absolute",
          //backgroundColor: "red",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <MaterialIcons
          name="replay-10"
          onPress={async () => {
            //await video.current.replayAsync();
            await video?.current.setPositionAsync(status.positionMillis - 10000);
          }}
          size={IconSize * 0.8}
          style={{ marginRight: "5%" }}
          color="white"></MaterialIcons>
        <MaterialIcons
          name={status.isPlaying ? "pause" : "play-arrow"}
          size={IconSize * 1.1}
          style={{
            bottom: "1%",
            //backgroundColor: "red",
            minWidth: "20%",
            textAlign: "center",
          }}
          color="white"
          onPress={async () => {
            console.log("PlayPause");
            status.isPlaying ? await video.current.pauseAsync() : await video.current.playAsync();
          }}></MaterialIcons>
        <MaterialIcons
          name="forward-10"
          onPress={async () => {
            //console.log(status.positionMillis);
            await video?.current.setPositionAsync(status.positionMillis + 10000);
          }}
          size={IconSize * 0.8}
          style={{ marginLeft: "5%" }}
          color="white"></MaterialIcons>
      </View>
    );
  };

  const IconsOpacity = React.useRef(new Animated.Value(1)).current;

  const fadeIn = () => {
    Animated.timing(IconsOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setIcons(true));
  };

  const fadeOut = () => {
    Animated.timing(IconsOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setIcons(false));
  };

  let timer: any = null;
  const autoFade = () => {
    // if (timer) {
    //   console.log("clearTimeout");
    //   clearTimeout(timer);
    // }
    clearTimeout(timer);
    console.log(timer);
    timer = setTimeout((e) => {
      console.log("Execute...");
      !isMoving.current && fadeOut();

      //timer = null;
      //console.log("Timeout");
    }, 3000);
  };
  //console.log(video.current.getStatusAsync());
  //  {/* <MaterialIcons name="close-fullscreen" size={24} color="black" />
  //opacity: IconsOpacity
  const Button_Overlay = () => {
    const TopButton = () => (
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingLeft: "3%",
          paddingRight: "3%",
          marginTop: "4%",
        }}>
        <MaterialIcons
          name="arrow-back"
          size={Mini_IconSize}
          onPress={() => navigation.goBack()}
          color="white"></MaterialIcons>
        <MaterialIcons
          name="open-in-full"
          size={Mini_IconSize}
          style={{ left: WindowSize.Width * 0.26 }}
          color="white"></MaterialIcons>
        <MaterialIcons name="settings" size={Mini_IconSize} color="white"></MaterialIcons>
      </View>
    );

    return (
      <Animated.View
        onTouchStart={() => (isIcons ? fadeOut() : fadeIn())}
        onTouchMove={() => (isMoving.current = true)}
        onTouchEnd={() => {
          //isIcons ? fadeOut() : fadeIn();
          isMoving.current = false;
          autoFade();
        }}
        style={{ ...styles.video_container, opacity: IconsOpacity, backgroundColor: "" }}>
        <TopButton></TopButton>
        <View style={{ flex: 2, justifyContent: "center", alignItems: "center", marginTop: "3%" }}>
          <Middle_Buttons></Middle_Buttons>
        </View>

        <View
          style={{
            marginTop: "auto",
            //backgroundColor: "yellow",
            justifyContent: "flex-end",
            flex: 1,
          }}>
          <View
            style={{
              width: "100%",
              //backgroundColor: "blue",
              justifyContent: "space-between",
              flexDirection: "row",
              paddingLeft: "3%",
              paddingRight: "4%",
              marginBottom: "3%",
            }}>
            <Text
              style={{
                color: "white",
              }}>
              {status.positionMillis ? MilisecondsToTimespamp(status.positionMillis) : "00:00"}
            </Text>

            <Text
              style={{
                color: "white",
              }}>
              {status.durationMillis ? MilisecondsToTimespamp(status.durationMillis) : "00:00"}
            </Text>
          </View>

          <Slider
            style={{
              width: "102%",
              height: "50%",
              //flex: 1,
              //backgroundColor: "pink",
              right: "2%",
            }}
            minimumValue={0}
            maximumValue={Duration?.current}
            minimumTrackTintColor={selectionColor}
            maximumTrackTintColor="white"
            thumbTintColor={selectionColor}
            onValueChange={(e) => {
              //setCurrentPosition(e);
              //a.current = e;
              //status.positionMillis = e;
              //console.log("onValueChange:", a.current);
              // status.positionMillis = e;
            }}
            value={status.positionMillis}
            onTouchStart={() => (isSliding2.current = true)}
            onSlidingStart={(e) => {
              console.log("onSlidingStart", e);
              //setwasPlaying(status.isPlaying);
              //video?.current.pauseAsync();
            }}
            onSlidingComplete={async (e) => {
              console.log("onSlidingComplete", e);
              await video?.current.setPositionAsync(e);
              //await video?.current.playFromPositionAsync(a.current);
              isSliding2.current = false;
            }}></Slider>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.video_container}>
      <Video
        //ref={(e)=> console.log(e.)}
        ref={video}
        //onTouchStart={autoFade}
        //onTouchEnd={isIcons ? fadeOut : fadeIn}
        onLayout={(e) => (videoLayout.current = e)}
        onLoadStart={() => {
          console.log("on load start");
        }}
        onLoad={(e: any) => {
          Duration.current = e.durationMillis;
          setLoaded(true);
        }}
        style={{ ...styles.video }}
        resizeMode={ResizeMode.COVER}
        // progressUpdateIntervalMillis={500}
        onPlaybackStatusUpdate={(status: any) => {
          !isSliding2.current && setStatus(() => status);
        }}
        source={{ uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" }}></Video>

      <Button_Overlay></Button_Overlay>

      {/* <Animated.View
          style={{
            width: "100%",
            height: "20%",
            position: "absolute",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: "5%",
            paddingLeft: "5%",
            opacity: IconsOpacity,
          }}>
          <MaterialIcons
            name="arrow-back"
            size={Mini_IconSize}
            onPress={() => navigation.goBack()}
            color="white"></MaterialIcons>
          <MaterialIcons
            name="open-in-full"
            size={Mini_IconSize}
            style={{ left: WindowSize.Width * 0.26 }}
            color="white"></MaterialIcons>
          <MaterialIcons name="settings" size={Mini_IconSize} color="white"></MaterialIcons>
        </Animated.View>

        <Animated.View style={{ opacity: IconsOpacity }}>
          <Middle_Buttons></Middle_Buttons>
        </Animated.View> */}

      <Spinner
        size={IconSize}
        animation={"fade"}
        indicatorStyle={{
          //position: "absolute",
          bottom: "30%",
          //height: "10%",
          //backgroundColor: "red",
        }}
        color={selectionColor}
        visible={!isLoaded}></Spinner>

      {/* <Animated.View
          style={{
            height: "20%",
            width: "100%",
            // backgroundColor: "red",
            marginTop: "49%",
            position: "absolute",
            opacity: IconsOpacity,
            justifyContent: "center",
          }}>
          <View
            style={{
              width: "100%",
              //backgroundColor: "red",
              justifyContent: "space-between",
              flexDirection: "row",
              paddingLeft: "3%",
              paddingRight: "4%",
              marginTop: "2%",
            }}>
            <Text
              style={{
                color: "white",
              }}>
              {status.positionMillis ? MilisecondsToTimespamp(status.positionMillis) : "00:00"}
            </Text>

            <Text
              style={{
                color: "white",
              }}>
              {status.durationMillis ? MilisecondsToTimespamp(status.durationMillis) : "00:00"}
            </Text>
          </View>

          <Slider
            style={{
              width: "102%",
              height: "80%",
              //marginTop: WindowSize.Height * 0.05,
              //backgroundColor: "red",
              // marginTop: WindowSize.Height * 0.25,
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
              setwasPlaying(status.isPlaying);
              await video.current.pauseAsync();
            }}
            onSlidingComplete={async () => {
              wasPlaying
                ? await video?.current.playFromPositionAsync(getCurrentPosition)
                : await video?.current.setPositionAsync(getCurrentPosition);
            }}></Slider>
        </Animated.View> */}
    </View>
  );
};

const NextEpisode_Container = () => {
  return (
    <View style={{ marginTop: "5%" }}>
      <Text style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05 }}>
        Nächste Folge
      </Text>
      <MediaItemCard ID_Path={1} Title="TestusKopf"></MediaItemCard>
    </View>
  );
};

const FollowingEpisodes_Container = () => {
  return (
    <View style={{ marginTop: "5%" }}>
      <Text style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05 }}>
        Weitere Folgen
      </Text>
      <MediaItemCard ID_Path={1} Title="TestusKopf"></MediaItemCard>
      <MediaItemCard ID_Path={2} Title="TestusKopf"></MediaItemCard>
      <MediaItemCard ID_Path={3} Title="TestusKopf"></MediaItemCard>
      <MediaItemCard ID_Path={4} Title="TestusKopf"></MediaItemCard>
    </View>
  );
};

const MediaScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <VideoPlayer navigation={navigation}></VideoPlayer>
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: "100%",
            //height: "15%",
            //backgroundColor: "red",
            flexDirection: "column",
            justifyContent: "center",
          }}>
          <Text
            style={{
              ...styles.EpisodeText,
              fontSize: WindowSize.Width * 0.04,
              marginBottom: "1%",
              marginTop: "4%",
              color: "#95b9fc",
              //textDecorationLine: "underline",
            }}>
            One Piece
          </Text>

          <Text style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05 }}>
            Folge 1: Der Kampf der Giganten Ugus ggefe fef efe er e rer er er e r e red wdwdwddwd
            wdwdwdwd dwwdw
          </Text>
          <Octicons
            name="download"
            size={WindowSize.Width * 0.07}
            style={{ marginLeft: "auto", marginRight: "7%" }}
            color="white"></Octicons>
        </View>
        <Seperator style={{ marginTop: "5%" }}></Seperator>
        <NextEpisode_Container></NextEpisode_Container>
        <FollowingEpisodes_Container></FollowingEpisodes_Container>
      </View>
    </ScrollView>
  );
};

export default MediaScreen;

const styles = StyleSheet.create({
  container: { height: "100%", width: "100%", backgroundColor: backgroundColor },
  video: { width: "100%", height: "100%", backgroundColor: "black", position: "absolute" },
  ContainerMiddle: { justifyContent: "center", alignItems: "center" },
  video_container: {
    width: WindowSize.Width,
    height: WindowSize.Height * 0.3,
    backgroundColor: "black",
    //justifyContent: "center",
    //alignItems: "center",
  },
  EpisodeText: {
    marginLeft: "5%",
    color: "white",
  },
});
