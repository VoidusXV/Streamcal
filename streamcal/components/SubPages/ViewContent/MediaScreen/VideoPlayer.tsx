import { StyleSheet, Text, View, Animated, TouchableOpacity, Image, ViewStyle } from "react-native";
import { Video, AVPlaybackStatus, ResizeMode, PitchCorrectionQuality } from "expo-av";

import React from "react";
import { WindowSize } from "../../../constants/Layout";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { selectionColor } from "../../../constants/Colors";

const IconSize = WindowSize.Width * 0.15;
const Mini_IconSize = WindowSize.Width * 0.08;

function MilisecondsToTimespamp(num: any) {
  let sec = Math.trunc(num / 1000);
  let min = Math.trunc(sec / 60);
  let result = "";

  if (sec > 60) sec = sec % 60;

  if (min < 10) result += `0${min}:`;
  else result += `${min}:`;

  if (sec < 10) result += `0${sec}`;
  else result += sec;

  return result;
}
interface ITopButton {
  isFullscreen: any;
  BackButtonOnPress?: any;
  ScreenButtonOnPress?: any;
  onSkipForward?: any;
  onSkipBackward?: any;
}

const TopButton: React.FC<ITopButton> = ({
  isFullscreen,
  BackButtonOnPress,
  ScreenButtonOnPress,
  onSkipForward,
  onSkipBackward,
}: any) => (
  <View
    style={{
      ...styles.TopButtonContainer_Normal,
      zIndex: 1,
      width: isFullscreen ? WindowSize.Height : "100%",
      //backgroundColor: "blue",
    }}
  >
    <MaterialIcons
      name="arrow-back"
      size={Mini_IconSize}
      style={{ opacity: isFullscreen ? 0 : 1 }}
      onPress={BackButtonOnPress}
      color="white"
    ></MaterialIcons>

    <View style={{ flexDirection: "row" }}>
      <MaterialIcons
        name="fast-rewind"
        size={Mini_IconSize}
        style={{ marginRight: WindowSize.Width * 0.1 }}
        color="white"
        onPress={onSkipBackward}
      ></MaterialIcons>
      <MaterialIcons
        name="fast-forward"
        size={Mini_IconSize}
        style={{ marginRight: WindowSize.Width * 0.1 }}
        color="white"
        onPress={onSkipForward}
      ></MaterialIcons>

      <MaterialIcons
        name="settings"
        size={Mini_IconSize}
        style={{ marginRight: WindowSize.Width * 0.1 }}
        color="white"
      ></MaterialIcons>
      <MaterialIcons
        onPress={ScreenButtonOnPress}
        name={!isFullscreen ? "open-in-full" : "close-fullscreen"}
        size={Mini_IconSize}
        color="white"
      ></MaterialIcons>
    </View>
  </View>
);

interface IMiddle_Buttons {
  isFullscreen: any;
  status: any;
  VideoRef: any;
  onPressAllButtons: any;
}
const Middle_Buttons: React.FC<IMiddle_Buttons> = ({
  isFullscreen,
  status,
  VideoRef,
  onPressAllButtons,
}: any) => {
  return (
    <View
      style={{
        alignSelf: "center",
        //height: IconSize,
        width: isFullscreen ? "90%" : "100%",
        // marginRight: isFullscreen ? WindowSize.Width * 0.2 : 0,
        justifyContent: "center",
        alignItems: "center",
        //backgroundColor: "red",
        marginTop: !isFullscreen ? WindowSize.Width * 0.1 : WindowSize.Width * 0.25,
        zIndex: 1,

        //position: "absolute",
        //top: WindowSize.Width * 0.1,
      }}
    >
      <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
        <MaterialIcons
          name="replay-10"
          onPress={async () => {
            await VideoRef?.current.setPositionAsync(status.positionMillis - 10000);
            onPressAllButtons();
          }}
          size={IconSize * 0.9}
          style={{ marginRight: "5%", color: "white" }}
        ></MaterialIcons>
        <MaterialIcons
          name={status.isPlaying ? "pause" : "play-arrow"}
          onPress={async () => {
            status.isPlaying
              ? await VideoRef.current.pauseAsync()
              : await VideoRef.current.playAsync();
            onPressAllButtons();
          }}
          size={IconSize * 1.2}
          style={{
            //bottom: WindowSize.Width * 0.01,
            minWidth: "20%",
            textAlign: "center",
            //backgroundColor: "blue",
            color: "white",
          }}
        ></MaterialIcons>
        <MaterialIcons
          name="forward-10"
          onPress={async () => {
            await VideoRef?.current.setPositionAsync(status.positionMillis + 10000);
            onPressAllButtons();
          }}
          size={IconSize * 0.9}
          style={{ marginLeft: "5%", color: "white" }}
        ></MaterialIcons>
      </View>
    </View>
  );
};

interface ISliderBar {
  isFullscreen: Boolean;
  positionMilli?: Number;
  maximumValue: Number;
  onValueChange?: any;
  onSlidingComplete?: any;
  value?: Number;
  onTouchStart?: any;
}

const SliderBar: React.FC<ISliderBar> = ({
  isFullscreen,
  maximumValue,
  onValueChange,
  onSlidingComplete,
  value,
  onTouchStart,
}: any) => {
  return (
    <TouchableOpacity
      //onPress={() => (isIcons ? fadeOut() : fadeIn())}
      activeOpacity={1}
      style={{
        marginTop: "auto",
        //backgroundColor: "yellow",
        justifyContent: "flex-end",
        flex: 1,
        width: isFullscreen ? "90%" : "100%",
      }}
    >
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
          {value ? MilisecondsToTimespamp(value) : "00:00"}
        </Text>

        <Text
          style={{
            color: "white",
          }}
        >
          {maximumValue ? MilisecondsToTimespamp(maximumValue) : "00:00"}
        </Text>
      </View>

      <Slider
        style={{
          width: "102%",
          height: WindowSize.Width * 0.1, //"55%"
          //flex: 1,
          //backgroundColor: "pink",
          right: WindowSize.Width * 0.01,
        }}
        minimumValue={0}
        maximumValue={maximumValue}
        minimumTrackTintColor={selectionColor}
        maximumTrackTintColor="white"
        thumbTintColor={selectionColor}
        onValueChange={onValueChange}
        value={value}
        onTouchStart={onTouchStart}
        onSlidingComplete={onSlidingComplete}
      ></Slider>
    </TouchableOpacity>
  );
};
interface IGeneratedImages {
  zoomImageIndex: any;
  zoomImageURI: any;
}

interface ISlider_Preview {
  getSliderValue: any;
  imageURI: any;
  status: any;
  CroppedImages: IGeneratedImages[];
  isFullScreen: any;
}
const Slider_Preview: React.FC<ISlider_Preview> = ({
  getSliderValue,
  status,
  CroppedImages,
  isFullScreen,
}: ISlider_Preview) => {
  const zoomImageIndex = Math.trunc(getSliderValue / 1000 / 10);
  //const [getImage, setImage] = React.useState<any>(imageURI || "");
  const ImageURI_ByIndex = CroppedImages.find(
    (e: any) => e.zoomImageIndex === zoomImageIndex
  )?.zoomImageURI;

  function pos() {
    if (!status.durationMillis) return;

    const sliderPercent = getSliderValue / status.durationMillis;
    const PreviewBox_Size = (WindowSize.Width * 0.4) / 2;

    const end =
      (!isFullScreen ? WindowSize.Width : WindowSize.Height) * sliderPercent - PreviewBox_Size;
    const leftMargin = !isFullScreen ? WindowSize.Width * 0.03 : WindowSize.Height * 0.03;
    const rightMargin = !isFullScreen ? WindowSize.Width * 0.57 : WindowSize.Height * 0.67;

    if (leftMargin < end) {
      if (rightMargin < end) return rightMargin;
      return end;
    }
    if (leftMargin > end) return leftMargin;
    return end;
  }
  return (
    <View
      style={{
        //opacity: isSliding.current ? 1 : 0,
        //backgroundColor: "red",
        width: WindowSize.Width * 0.4,
        height: WindowSize.Width * 0.25,
        position: "absolute",
        top: !isFullScreen ? WindowSize.Width * 0.2 : WindowSize.Width * 0.55,
        left: pos(),
        zIndex: 2,
      }}
    >
      <Image
        resizeMode="cover"
        style={{ flex: 1, borderWidth: 1, borderColor: "white" }}
        source={{ uri: ImageURI_ByIndex }}
      ></Image>
      <Text style={{ color: "white", textAlign: "center" }}>
        {MilisecondsToTimespamp(getSliderValue)}
      </Text>
    </View>
  );
};

interface IVideoPlayer {
  VideoRef: any;
  CroppedImages: any;
  isFullScreen?: any;
  navigation?: any;
  ScreenButtonOnPress?: any;
  style?: ViewStyle | ViewStyle[];
}

let timer: any = null;

const VideoPlayer: React.FC<IVideoPlayer> = ({
  VideoRef,
  CroppedImages,
  isFullScreen,
  navigation,
  ScreenButtonOnPress,
  style,
}: any) => {
  // UseStates
  const [getStatus, setStatus] = React.useState<any>({});
  const [isLoaded, setLoaded] = React.useState<any>(true);
  const [isIcons, setIcons] = React.useState(true);
  const [getCroppedImage, setCroppedImage] = React.useState<any>(null);

  //UseRefs
  const videoLayout = React.useRef<any>(null);
  const isSliding = React.useRef<any>(false);
  const Duration = React.useRef<any>(0);
  const IconsOpacity = React.useRef(new Animated.Value(1)).current;

  const [getSliderValue, setSliderValue] = React.useState<any>(0);

  const fadeIn = () => {
    // console.log("fadeIN");
    setIcons(true);

    Animated.timing(IconsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {}); // () => setIcons(true)

    autoFade();
  };

  const fadeOut = () => {
    if (isSliding.current) return;

    //setIcons(false);
    Animated.timing(IconsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIcons(false);
      //isSliding.current = false;
    });
  };

  const autoFade = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout((e) => {
      fadeOut();
    }, 3000);
  };

  React.useEffect(() => {
    fadeOut();
  }, []);

  const Width = isFullScreen ? WindowSize.Height * 0.9 : WindowSize.Width;
  return (
    <View
      style={{
        ...styles.video_container,
        width: Width,
        height: !isFullScreen ? WindowSize.Width * 0.6 : WindowSize.Width,
        alignSelf: "center",
        ...style,
      }}
    >
      <Video
        ref={VideoRef}
        //source={{ uri: videoURL }}
        onLayout={(e) => (videoLayout.current = e)}
        onLoadStart={() => {
          setLoaded(false);
        }}
        onLoad={(e: any) => {
          Duration.current = e.durationMillis;
          setLoaded(true);
        }}
        style={{ ...styles.video }}
        resizeMode={ResizeMode.COVER}
        onPlaybackStatusUpdate={(status: any) => {
          !isSliding.current && setSliderValue(status.positionMillis);
          !isSliding.current && setStatus(status);
        }}
      ></Video>

      <Animated.View
        style={{
          position: "absolute",
          ...styles.video_container,
          backgroundColor: !getStatus.isPlaying ? "rgba(0,0,0,0.4)" : "",
          //backgroundColor: "red",
          opacity: IconsOpacity,
          width: Width,
          height: !isFullScreen ? WindowSize.Width * 0.6 : WindowSize.Width,
        }}
      >
        <TouchableOpacity
          onPress={() => (isIcons ? fadeOut() : fadeIn())}
          activeOpacity={1}
          style={{ width: "100%", height: "100%" }}
        >
          {isIcons && (
            <>
              <TopButton
                isFullscreen={isFullScreen}
                BackButtonOnPress={() => navigation.goBack()}
                ScreenButtonOnPress={ScreenButtonOnPress}
              ></TopButton>

              <Middle_Buttons
                isFullscreen={isFullScreen}
                status={getStatus}
                VideoRef={VideoRef}
                onPressAllButtons={() => {
                  clearTimeout(timer);
                  autoFade();
                }}
              ></Middle_Buttons>
              {isSliding.current && (
                <Slider_Preview
                  status={getStatus}
                  getSliderValue={getSliderValue}
                  imageURI={getCroppedImage}
                  CroppedImages={CroppedImages}
                  isFullScreen={isFullScreen}
                ></Slider_Preview>
              )}
              <SliderBar
                isFullscreen={false}
                maximumValue={Duration.current}
                value={getStatus.positionMillis}
                onValueChange={async (e: any) => {
                  setSliderValue(e);
                }}
                onSlidingComplete={async (e: any) => {
                  await VideoRef?.current.setPositionAsync(e);
                  isSliding.current = false;
                  autoFade();
                }}
                onTouchStart={() => (isSliding.current = true)}
              ></SliderBar>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  video: { width: "100%", height: "100%", backgroundColor: "black", position: "absolute" },
  video_container: {
    //width: WindowSize.Width,
    //height: WindowSize.Width * 0.6,

    backgroundColor: "black",
  },
  TopButtonContainer_Normal: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: "3%",
    paddingRight: "3%",
    marginTop: "4%",
  },
});
