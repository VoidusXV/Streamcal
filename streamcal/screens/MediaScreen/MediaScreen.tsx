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
  LogBox,
} from "react-native";
import React from "react";
import { Video, AVPlaybackStatus, ResizeMode, PitchCorrectionQuality } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import VideoPlayer from "../../components/SubPages/MediaScreen/VideoPlayer/VideoPlayer";

import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { backgroundColor, selectionColor } from "../../components/constants/Colors";
import { Mini_IconSize, WindowSize } from "../../components/constants/Layout";
import Seperator from "../../components/Designs/Seperator";
import MediaItemCard from "../../components/Designs/MediaItemCard";
import { StatusBar } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Asset } from "expo-asset";
import * as NavigationBar from "expo-navigation-bar";
import { getPreviewImageURL, getThumbnailURL, getVideoURL } from "../../backend/serverConnection";
import LoadingIndicator from "../../components/Designs/LoadingIndicator";
import { IMediaRouteParams, IMediaScreen } from "./MediaScreenInterfaces";
import { IGeneratedImages } from "../../components/constants/interfaces";

//LogBox.ignoreAllLogs();

async function changeScreenOrientation() {
  const Orientation: any = await ScreenOrientation.getOrientationAsync();
  let ScreenOrientationLock;
  let NavBar;

  if (Orientation != ScreenOrientation.OrientationLock.ALL) {
    ScreenOrientationLock = ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    NavBar = NavigationBar.setVisibilityAsync("visible");
    await Promise.all([ScreenOrientationLock, NavBar]);
    return false;
  }
  ScreenOrientationLock = ScreenOrientation.lockAsync(
    ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
  );
  NavBar = NavigationBar.setVisibilityAsync("hidden");
  await Promise.all([ScreenOrientationLock, NavBar]);

  return true;
}

const NextEpisode_Container = ({
  routeParams,
  navigation,
}: {
  routeParams: IMediaRouteParams;
  navigation: any;
}) => {
  const EpisodeData = routeParams?.Episodes?.[routeParams?.index + 1];

  if (EpisodeData) {
    return (
      <View style={{ marginTop: "5%" }}>
        <Text style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05 }}>
          Nächste Folge
        </Text>
        <MediaItemCard
          ID_Path={EpisodeData.Episode}
          Duration={EpisodeData.Duration}
          Title={EpisodeData.Title}
          navigation={navigation}
          isMediaScreen={true}
          routeParams={{
            ...routeParams,
            item: EpisodeData,
            index: routeParams?.index + 1,
          }}
          Source={{
            uri: getThumbnailURL(
              routeParams?.ContentID,
              routeParams?.getSeason + 1,
              EpisodeData?.Episode
            ),
          }}
        ></MediaItemCard>
      </View>
    );
  } else return <></>;
};

const FollowingEpisodes_Container = ({ Episodes, ContentID, index, getSeason }: any) => {
  const splicedEpisodes = [...Episodes];
  splicedEpisodes.splice(0, index + 2);
  if (splicedEpisodes && splicedEpisodes.length > 0) {
    return (
      <View style={{ marginTop: "5%", flex: 1 }}>
        <Text style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05 }}>
          Weitere Folgen
        </Text>
        <FlashList
          data={splicedEpisodes} // Staffel 1
          estimatedItemSize={8}
          contentContainerStyle={{ paddingBottom: WindowSize.Width * 0.1 }}
          renderItem={({ item, index }: any) => (
            <MediaItemCard
              ID_Path={item.Episode}
              Title={item.Title}
              Duration={item.Duration}
              Description={item.Description}
              Source={{
                uri: getThumbnailURL(ContentID, getSeason + 1, splicedEpisodes[index].Episode), // `http://192.168.2.121:3005/v1/test2?id=${ContentID}&season=1&episode=${item.Episode}&dr=thumb`,
              }}
            ></MediaItemCard>
          )}
        ></FlashList>
      </View>
    );
  } else {
    return <></>;
  }
};

async function zoomImage(imageURI: any, index: any) {
  if (!imageURI) {
    throw "Invalid imageURI";
  }

  const ImagesPerRow = 10;
  const ImageWidth = 80;
  const ImageHeight = 45;

  const originX = (index % 10) * ImageWidth;
  const originY = Math.trunc(index / ImagesPerRow) * ImageHeight;

  const manipResult = await manipulateAsync(
    imageURI.localUri || imageURI.uri,
    [
      {
        crop: {
          height: ImageHeight,
          width: ImageWidth,
          originX: originX,
          originY: originY,
        },
      },
    ],
    { compress: 1, format: SaveFormat.JPEG }
  );
  return manipResult.uri;
}

let timer: any = null;

function SkipEpisode(
  routeParams: IMediaRouteParams,
  navigation: any,
  index: any,
  isFullScreen: any
) {
  if (!routeParams?.Episodes?.[routeParams?.index + index]) return;

  navigation.replace("MediaScreen", {
    ...routeParams,
    item: routeParams?.Episodes?.[routeParams?.index + index],
    index: routeParams?.index + index,
    isFullScreen: isFullScreen,
  });
}

const MediaScreen = ({ route, navigation }: IMediaScreen) => {
  const { item, Episodes, ContentTitle, ContentID, index, getSeason }: IMediaRouteParams =
    route?.params;

  const [isLoading, setIsLoading] = React.useState(false);
  const [isFullScreen, setFullScreen] = React.useState<any>(false);
  //const [getImage, setImage] = React.useState<any>(null);
  const [getGeneratedImages, setGeneratedImages] = React.useState<any>([{}]);
  let generatedImages: IGeneratedImages[] = [];

  const VideoRef = React.useRef<any>(null);
  const image = Asset.fromURI(getPreviewImageURL(ContentID, 1, item.Episode));
  const videoURL = getVideoURL(ContentID, 1, item.Episode);

  React.useEffect(() => {
    const backAction = () => {
      if (!isFullScreen) {
        navigation?.goBack();
        return true;
      }
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      NavigationBar.setVisibilityAsync("visible");

      setFullScreen(false);

      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      backHandler.remove();
    };
  }, [isFullScreen]);

  React.useEffect(() => {
    let isCancelled = false;

    (async () => {
      if (route.params?.isFullScreen) {
        setFullScreen(route.params?.isFullScreen);
      }

      setIsLoading(true);
      if (isCancelled) return;

      await image.downloadAsync();
      if (isCancelled) return;

      await VideoRef?.current?.loadAsync({ uri: videoURL });
      await VideoRef.current.playAsync();
      setIsLoading(false);

      const DurationMinutes = item.Duration / 60;
      const RandomConstant = 0.4;
      const SecondsPerImage = Math.ceil(DurationMinutes * RandomConstant);
      const ImageAmount = Math.ceil(item.Duration / SecondsPerImage);

      console.log("Starting Generate CroppedImages:", ImageAmount);
      for (let index = 0; index < ImageAmount; index++) {
        if (isCancelled) return;
        generatedImages.push({
          zoomImageIndex: index,
          zoomImageURI: await zoomImage(image, index),
        });
      }

      console.log("Generate CroppedImages Done");
      setGeneratedImages(generatedImages);
      console.log("Loading Should be done");
    })();

    return () => {
      console.log("Unload MediaScreen");
      isCancelled = true;
    };
  }, []);

  return (
    <ScrollView
      scrollEnabled={isFullScreen ? false : true}
      style={!isFullScreen ? styles.container : { backgroundColor: "black" }}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {isFullScreen && <StatusBar hidden></StatusBar>}

      <View
        style={{
          height: !isFullScreen ? WindowSize.Width * 0.6 : WindowSize.Width,
          backgroundColor: "black",
        }}
      >
        {isLoading && (
          <>
            <MaterialIcons
              name="arrow-back"
              size={Mini_IconSize}
              style={{ position: "absolute", zIndex: 2, marginLeft: "2%", marginTop: "2%" }}
              onPress={() => navigation?.goBack()}
              color="white"
            ></MaterialIcons>
            <LoadingIndicator
              style={{
                position: "absolute",
                height: !isFullScreen ? WindowSize.Width * 0.6 : WindowSize.Width,
                zIndex: 1,
              }}
            ></LoadingIndicator>
          </>
        )}
        <VideoPlayer
          onSkipForward={() => SkipEpisode(route?.params, navigation, 1, isFullScreen)}
          onSkipBackward={() => SkipEpisode(route?.params, navigation, -1, isFullScreen)}
          navigation={navigation}
          VideoRef={VideoRef}
          CroppedImages={getGeneratedImages}
          isFullScreen={isFullScreen}
          isLoading={(e: any) => setIsLoading(e)}
          ScreenButtonOnPress={async () => setFullScreen(await changeScreenOrientation())}
        ></VideoPlayer>
      </View>

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
            {ContentTitle}
          </Text>

          <Text
            style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05, maxWidth: "90%" }}
          >
            Folge {item.Episode}: {item.Title}
          </Text>
          <Octicons
            onPress={() => clearTimeout(timer)}
            name="download"
            size={WindowSize.Width * 0.07}
            style={{ marginLeft: "auto", marginRight: "7%" }}
            color="white"
          ></Octicons>
        </View>
        <Seperator style={{ marginTop: "5%", height: "0.2%" }}></Seperator>
        <NextEpisode_Container
          routeParams={{ ...route?.params, isFullScreen: isFullScreen }}
          navigation={navigation}
        ></NextEpisode_Container>
        {/* <FollowingEpisodes_Container
          Episodes={Episodes}
          ContentID={ContentID}
          getSeason={getSeason}
          index={index}></FollowingEpisodes_Container> */}
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
