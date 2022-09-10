import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  BackHandler,
  Image,
  ImageSourcePropType,
} from "react-native";
import React from "react";
import { Video, AVPlaybackStatus, ResizeMode, PitchCorrectionQuality } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";

import Slider from "@react-native-community/slider";
import Spinner from "react-native-loading-spinner-overlay";

import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import Seperator from "../components/Designs/Seperator";
import MediaItemCard from "../components/Designs/MediaItemCard";
import { StatusBar } from "expo-status-bar";
import { generateThumbnail } from "../components/media/Functions";
import { loadAsync } from "expo-font";

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

async function changeScreenOrientation() {
  const Orientation: any = await ScreenOrientation.getOrientationAsync();

  if (Orientation != ScreenOrientation.OrientationLock.ALL) {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    return false;
  }
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
  return true;
}
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

let timer: any = null;
const videoURL = "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";
const Cover = require("../assets/covers/One_Piece.jpg");

const VideoPlayer = ({
  navigation,
  setFullscreen,
  isFullscreen,
  previewVideoRef,
  currentVideoRef,
  onValueChange,
}: any) => {
  const [status, setStatus] = React.useState<any>({});
  const [isLoaded, setLoaded] = React.useState<any>(true);
  const [isIcons, setIcons] = React.useState(true);

  //const video = React.useRef<any>(null);
  const videoLayout = React.useRef<any>(null);
  const isSliding = React.useRef<any>(false);

  const Duration = React.useRef<any>(0);

  const IconSize = WindowSize.Width * 0.15;
  const Mini_IconSize = WindowSize.Width * 0.08;

  const IconsOpacity = React.useRef(new Animated.Value(1)).current;
  //console.log(previewVideoRef.current);
  const fadeIn = () => {
    //console.log("fadeIN");
    Animated.timing(IconsOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setIcons(true));
    autoFade();
  };

  const fadeOut = () => {
    return;
    if (isSliding.current) return;
    Animated.timing(IconsOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setIcons(false);
      isSliding.current = false;
    });
  };

  const autoFade = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout((e) => {
      // if (!isIcons) {
      //console.log("Execute..."), isIcons;
      fadeOut();
      //}
    }, 2000);
  };

  React.useEffect(() => {
    // fadeOut();
  }, []);

  const Slider_Preview = ({ sliderPercent, sliderPos, isSliding }: any) => {
    function pos() {
      const a = WindowSize.Width * sliderPercent - (WindowSize.Width * 0.4) / 2;
      const leftMargin = WindowSize.Width * 0.03;
      const rightMargin = WindowSize.Width * 0.55;

      if (leftMargin < a) {
        if (rightMargin < a) return rightMargin;
        return a;
      }
      if (leftMargin > a) return leftMargin;
      return a;
    }

    //console.log(sliderPos.current);
    return (
      <View
        style={{
          //opacity: isSliding.current ? 1 : 0,
          backgroundColor: "red",
          width: WindowSize.Width * 0.4,
          height: WindowSize.Width * 0.25,
          position: "absolute",
          top: WindowSize.Width * 0.15,
          left: pos(),
        }}
      >
        <Video
          //ref={(e)=> e?.loadAsync({uri:videoURL})}
          // ref={previewVideoRef}
          source={{ uri: videoURL }}
          // style={{ width: "100%", height: "100%" }}
          style={{ ...styles.video, zIndex: 2 }}
          resizeMode={ResizeMode.STRETCH}
          positionMillis={sliderPos.current}
          //rate={32}
          volume={0}
        ></Video>
        <Text style={{ color: "white", textAlign: "center" }}>
          {MilisecondsToTimespamp(sliderPos.current)}
        </Text>
      </View>
    );
  };

  const TopButton = () => (
    <View style={{ ...styles.TopButtonContainer_Normal, width: isFullscreen ? "90%" : "100%" }}>
      <MaterialIcons
        name="arrow-back"
        size={Mini_IconSize}
        style={{ opacity: isFullscreen ? 0 : 1 }}
        onPress={() => !isFullscreen && navigation.goBack()}
        color="white"
      ></MaterialIcons>

      <View style={{ flexDirection: "row" }}>
        <MaterialIcons
          name="settings"
          size={Mini_IconSize}
          style={{ marginRight: WindowSize.Width * 0.1 }}
          color="white"
        ></MaterialIcons>

        <MaterialIcons
          onPress={async () => setFullscreen(await changeScreenOrientation())}
          name={!isFullscreen ? "open-in-full" : "close-fullscreen"}
          size={Mini_IconSize}
          //style={{ left: WindowSize.Width * 0.26 }}
          color="white"
        ></MaterialIcons>
      </View>
    </View>
  );

  const Middle_Buttons = () => {
    return (
      <View
        style={{
          alignSelf: "center",
          height: IconSize,
          // marginTop: (WindowSize.Height * 0.3) / 2 - IconSize / 2,
          //position: "absolute",
          //backgroundColor: "red",
          //width: "100%",
          width: isFullscreen ? "90%" : "100%",
          marginRight: isFullscreen ? WindowSize.Width * 0.2 : 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons
            name="replay-10"
            onPress={async () => {
              //await video.current.replayAsync();
              await currentVideoRef?.current.setPositionAsync(status.positionMillis - 10000);
            }}
            size={IconSize * 0.8}
            style={{ marginRight: "5%" }}
            color="white"
          ></MaterialIcons>
          <MaterialIcons
            name={status.isPlaying ? "pause" : "play-arrow"}
            size={IconSize * 1.1}
            style={{
              bottom: WindowSize.Width * 0.01,
              //backgroundColor: "red",
              minWidth: "20%",
              textAlign: "center",
            }}
            color="white"
            onPress={async () => {
              console.log("PlayPause");
              status.isPlaying
                ? await currentVideoRef.current.pauseAsync()
                : await currentVideoRef.current.playAsync();
            }}
          ></MaterialIcons>
          <MaterialIcons
            name="forward-10"
            onPress={async () => {
              //console.log(status.positionMillis);
              await currentVideoRef?.current.setPositionAsync(status.positionMillis + 10000);
            }}
            size={IconSize * 0.8}
            style={{ marginLeft: "5%" }}
            color="white"
          ></MaterialIcons>
        </View>
      </View>
    );
  };

  const Button_Overlay = () => {
    const [getSliderPercent, setSliderPercent] = React.useState(0);
    const slidingPos = React.useRef(0);

    return (
      <Animated.View
        onTouchStart={() => (isIcons ? autoFade() : fadeIn())}
        style={[
          {
            ...styles.video_container,
            opacity: IconsOpacity,
            backgroundColor: isIcons ? "rgba(0,0,0,0.7)" : "",
          },
          isFullscreen && { width: WindowSize.Height, height: WindowSize.Width },
        ]}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => (isIcons ? fadeOut() : fadeIn())}>
          {isIcons && <TopButton></TopButton>}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => (isIcons ? fadeOut() : fadeIn())}
          //onTouchStart={() => (isIcons ? fadeOut() : fadeIn())}
          // onTouchStart={() => console.log("Kopfus")}
          style={{
            flex: 2,
            justifyContent: "center",
            alignItems: "center",
            marginTop: "3%",
            // backgroundColor: "red",
          }}
        >
          {isIcons && <Middle_Buttons></Middle_Buttons>}
        </TouchableOpacity>

        {/* <Slider_Preview
          isSliding={isSliding}
          sliderPos={slidingPos}
          sliderPercent={getSliderPercent || 0}
        ></Slider_Preview> */}

        <TouchableOpacity
          onPress={() => (isIcons ? fadeOut() : fadeIn())}
          activeOpacity={1}
          style={{
            marginTop: "auto",
            //backgroundColor: "yellow",
            justifyContent: "flex-end",
            flex: 1,
            width: isFullscreen ? "90%" : "100%",
          }}
        >
          {isIcons && (
            <>
              <View
                style={{
                  width: "100%",
                  //backgroundColor: "blue",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  paddingLeft: "3%",
                  paddingRight: "4%",
                  marginBottom: "3%",
                }}
              >
                <Text
                  style={{
                    color: "white",
                  }}
                >
                  {status.positionMillis ? MilisecondsToTimespamp(status.positionMillis) : "00:00"}
                </Text>

                <Text
                  style={{
                    color: "white",
                  }}
                >
                  {status.durationMillis ? MilisecondsToTimespamp(status.durationMillis) : "00:00"}
                </Text>
              </View>

              <Slider
                style={{
                  width: "102%",
                  height: "50%",
                  //flex: 1,
                  //backgroundColor: "pink",
                  right: WindowSize.Width * 0.01,
                }}
                minimumValue={0}
                maximumValue={Duration?.current}
                minimumTrackTintColor={selectionColor}
                maximumTrackTintColor="white"
                thumbTintColor={selectionColor}
                onValueChange={(e) => {
                  slidingPos.current = e;
                  setSliderPercent(e / status.durationMillis);
                  onValueChange && onValueChange({ pos: e, SliderPercent: getSliderPercent });
                }}
                value={status.positionMillis}
                onTouchStart={() => (isSliding.current = true)}
                onSlidingComplete={async (e) => {
                  await currentVideoRef?.current.setPositionAsync(e);
                  isSliding.current = false;
                  autoFade();
                }}
              ></Slider>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View
      style={[
        isFullscreen
          ? { width: WindowSize.Height * 0.9, height: WindowSize.Width, alignSelf: "center" }
          : styles.video_container,
        ,
      ]}
    >
      <Video
        ref={currentVideoRef}
        onLayout={(e) => (videoLayout.current = e)}
        onLoadStart={() => {
          //  console.log("on load start");
          setLoaded(false);
        }}
        onError={(e) => console.log("Error:", e)}
        onLoad={(e: any) => {
          Duration.current = e.durationMillis;
          setLoaded(true);
        }}
        style={{ ...styles.video }}
        resizeMode={ResizeMode.COVER}
        // progressUpdateIntervalMillis={500}
        onPlaybackStatusUpdate={(status: any) => {
          // console.log("onPlaybackStatusUpdate");
          !isSliding.current && setStatus(() => status);
        }}
        // source={{ uri: videoURL }}
      ></Video>

      <Button_Overlay></Button_Overlay>
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
        visible={!isLoaded}
      ></Spinner>
    </View>
  );
};

const MediaScreen = ({ navigation }: any) => {
  const [isFullscreen, setFullscreen] = React.useState<any>(false);
  const currentVideo = React.useRef<any>(null);
  const previewVideo = React.useRef<any>(null);
  const [getA, setA] = React.useState<any>(false);
  const ImagesPath: any = [];

  React.useEffect(() => {
    const backAction = () => {
      if (!isFullscreen) {
        navigation.goBack();
        return true;
      }
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      setFullscreen(false);

      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      backHandler.remove();
    };
  }, [isFullscreen]);

  React.useEffect(() => {
    (async () => {
      const ImageSeekGenerator = async () => {
        const duration = 27;
        const ImageDivi = 10;
        const ImagesAfterSeconds = Math.round(duration / ImageDivi);
        const ImagesAfterMiliseconds = ImagesAfterSeconds * 1000;

        console.log("ImageSeek Generator");
        for (let index = 0; index < ImageDivi; index++) {
          let ImageMili = Math.floor(index * ImagesAfterMiliseconds);
          if (index == ImageDivi - 1) ImageMili -= 1000;
          console.log(ImageMili);

          ImagesPath[index] = await generateThumbnail(
            videoURL,
            1, //Math.floor(index * ImagesAfterMiliseconds),
            0.1
          );
        }
      };

      const vid = currentVideo?.current?.loadAsync({ uri: videoURL });
      const preview = previewVideo?.current?.loadAsync({ uri: videoURL, width: 100, height: 100 });

      console.log("Start Loading Video");
      await Promise.all([vid, preview]).then(async () => {
        console.log("Video Loaded");
        previewVideo?.current?.setStatusAsync({
          pitchCorrectionQuality: PitchCorrectionQuality.Low,
        });
        //console.log("Image:", ImagesPath);
      });

      //await previewVideo?.current.setRateAsync({ uri: videoURL });
    })();
  }, []);

  return (
    <ScrollView
      scrollEnabled={isFullscreen ? false : true}
      style={!isFullscreen ? styles.container : { backgroundColor: "black" }}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {isFullscreen && <StatusBar hidden></StatusBar>}

      <VideoPlayer
        previewVideoRef={previewVideo}
        currentVideoRef={currentVideo}
        setFullscreen={setFullscreen}
        isFullscreen={isFullscreen}
        navigation={navigation}
      ></VideoPlayer>

      <View style={{ flex: 1 }}>
        <View
          style={{
            width: "100%",
            //height: "15%",
            //backgroundColor: "red",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              ...styles.EpisodeText,
              fontSize: WindowSize.Width * 0.04,
              marginBottom: "1%",
              marginTop: "4%",
              color: "#95b9fc",
              //textDecorationLine: "underline",
            }}
          >
            One Piece
          </Text>

          <Text style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05 }}>
            Folge 1: Der Kampf der Giganten Ugus ggefe fef efe er e rer er er e r e red wdwdwddwd
            wdwdwdwd dwwdw
          </Text>
          <Octicons
            onPress={() => clearTimeout(timer)}
            name="download"
            size={WindowSize.Width * 0.07}
            style={{ marginLeft: "auto", marginRight: "7%" }}
            color="white"
          ></Octicons>
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
  TopButtonContainer_Normal: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: "3%",
    paddingRight: "3%",
    marginTop: "4%",
    //backgroundColor: "red",
  },
});
