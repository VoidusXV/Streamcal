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
import VideoPlayer from "../components/SubPages/ViewContent/MediaScreen/VideoPlayer";

import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { Mini_IconSize, WindowSize } from "../components/constants/Layout";
import Seperator from "../components/Designs/Seperator";
import MediaItemCard from "../components/Designs/MediaItemCard";
import { StatusBar } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Asset } from "expo-asset";
import * as NavigationBar from "expo-navigation-bar";
import { getPreviewImageURL, getThumbnailURL, getVideoURL } from "../backend/serverConnection";
import LoadingIndicator from "../components/Designs/LoadingIndicator";

//LogBox.ignoreAllLogs();

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
interface INextEpisode_Container {
  Episodes: any;
  ContentID: any;
  ContentTitle: any;
  getSeason: any;
  navigation: any;
  index: any;
}
const NextEpisode_Container = ({
  Episodes,
  ContentID,
  ContentTitle,
  getSeason,
  navigation,
  index,
}: INextEpisode_Container) => {
  // console.log(AllData);
  const EpisodeData = Episodes[index];

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
            item: EpisodeData,
            ContentTitle: ContentTitle,
            ContentID: ContentID,
            Episodes: Episodes,
            index: index,
          }}
          Source={{
            uri: getThumbnailURL(ContentID, getSeason + 1, EpisodeData.Episode),
          }}></MediaItemCard>
      </View>
    );
  } else return <></>;
};

const FollowingEpisodes_Container = ({ data, ContentID, index }: any) => {
  //data.splice(0, 2);
  const splicedData = [...data];
  splicedData.splice(0, index + 2);
  if (splicedData && splicedData.length > 0) {
    return (
      <View style={{ marginTop: "5%", flex: 1 }}>
        <Text style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05 }}>
          Weitere Folgen
        </Text>
        <FlashList
          data={splicedData} // Staffel 1
          estimatedItemSize={8}
          contentContainerStyle={{ paddingBottom: WindowSize.Width * 0.1 }}
          renderItem={({ item, index }: any) => (
            <MediaItemCard
              ID_Path={item.Episode}
              Title={item.Title}
              Duration={item.Duration}
              Description={item.Description}
              Source={{
                uri: `http://192.168.2.121:3005/v1/test2?id=${ContentID}&season=1&episode=${item.Episode}&dr=thumb`,
              }}></MediaItemCard>
          )}></FlashList>
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

interface IGeneratedImages {
  zoomImageIndex: any;
  zoomImageURI: any;
}

function GoToEpisode(
  index: any,
  navigation: any,
  ContentTitle: any,
  Episodes: any,
  ContentID: any
) {
  if (!Episodes[index]) return null;
  navigation.replace("MediaScreen", {
    item: Episodes[index],
    ContentTitle: ContentTitle,
    ContentID: ContentID,
    Episodes: Episodes,
    index: index,
  });
}

const MediaScreen = ({ route, navigation }: any) => {
  const { item, Episodes, ContentTitle, ContentID, index } = route.params;

  //console.log(Episodes[index]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFullScreen, setFullScreen] = React.useState<any>(false);
  const [getImage, setImage] = React.useState<any>(null);
  const [getGeneratedImages, setGeneratedImages] = React.useState<any>([{}]);
  let generatedImages: IGeneratedImages[] = [];

  const VideoRef = React.useRef<any>(null);
  const image = Asset.fromURI(getPreviewImageURL(ContentID, 1, item.Episode));
  const videoURL = getVideoURL(ContentID, 1, item.Episode);

  React.useEffect(() => {
    const backAction = () => {
      if (!isFullScreen) {
        navigation.goBack();
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
    (async () => {
      setIsLoading(true);
      // TODO: Running both asyncs at the same time
      await image.downloadAsync();
      setImage(image);

      await VideoRef?.current?.loadAsync({ uri: videoURL });
      await VideoRef.current.playAsync();
      setIsLoading(false);

      const DurationMinutes = item.Duration / 60;
      const RandomConstant = 0.4;
      const SecondsPerImage = Math.ceil(DurationMinutes * RandomConstant);
      const ImageAmount = Math.ceil(item.Duration / SecondsPerImage);

      console.log("Starting Generate CroppedImages:", ImageAmount);
      for (let index = 0; index < ImageAmount; index++) {
        generatedImages.push({
          zoomImageIndex: index,
          zoomImageURI: await zoomImage(image, index),
        });
      }

      console.log("Generate CroppedImages Done");
      setGeneratedImages(generatedImages);
      console.log("Loading Should be done");
    })();
  }, []);

  return (
    <ScrollView
      scrollEnabled={isFullScreen ? false : true}
      style={!isFullScreen ? styles.container : { backgroundColor: "black" }}
      contentContainerStyle={{ paddingBottom: 50 }}>
      {isFullScreen && <StatusBar hidden></StatusBar>}

      {getImage && (
        <View
          style={{
            height: !isFullScreen ? WindowSize.Width * 0.6 : WindowSize.Width,
            backgroundColor: "black",
          }}>
          {isLoading && (
            <>
              <MaterialIcons
                name="arrow-back"
                size={Mini_IconSize}
                style={{ position: "absolute", zIndex: 2, marginLeft: "2%", marginTop: "2%" }}
                onPress={() => navigation.goBack()}
                color="white"></MaterialIcons>
              <LoadingIndicator
                style={{
                  position: "absolute",
                  height: !isFullScreen ? WindowSize.Width * 0.6 : WindowSize.Width,
                  zIndex: 1,
                }}></LoadingIndicator>
            </>
          )}
          <VideoPlayer
            // style={{ opacity: 0 }}
            onSkipForward={() =>
              GoToEpisode(index + 1, navigation, ContentTitle, Episodes, ContentID)
            }
            onSkipBackward={() =>
              GoToEpisode(index - 1, navigation, ContentTitle, Episodes, ContentID)
            }
            navigation={navigation}
            VideoRef={VideoRef}
            CroppedImages={getGeneratedImages}
            isFullScreen={isFullScreen}
            ScreenButtonOnPress={async () =>
              setFullScreen(await changeScreenOrientation())
            }></VideoPlayer>
        </View>
      )}

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
            {ContentTitle}
          </Text>

          <Text
            style={{ ...styles.EpisodeText, fontSize: WindowSize.Width * 0.05, maxWidth: "90%" }}>
            Folge {item.Episode}: {item.Title}
          </Text>
          <Octicons
            onPress={() => clearTimeout(timer)}
            name="download"
            size={WindowSize.Width * 0.07}
            style={{ marginLeft: "auto", marginRight: "7%" }}
            color="white"></Octicons>
        </View>
        <Seperator style={{ marginTop: "5%", height: "0.2%" }}></Seperator>
        <NextEpisode_Container
          Episodes={Episodes}
          getSeason={0}
          ContentID={ContentID}
          ContentTitle={ContentTitle}
          navigation={navigation}
          index={index + 1}></NextEpisode_Container>
        {/* <FollowingEpisodes_Container
          ContentID={ContentID}
          index={index}
          data={AllData}></FollowingEpisodes_Container> */}
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
