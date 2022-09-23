import React from "react";

import { View, StyleSheet, Image } from "react-native";
import { backgroundColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";

import FadingEdgesView from "../components/Designs/FadingEdgesView";
import { Asset } from "expo-asset";
import VideoPlayer from "../components/SubPages/ViewContent/MediaScreen/VideoPlayer";
const Cover2 = require("../assets/covers/One_Piece.jpg");

export default function ListScreen() {
  const VideoRef = React.useRef<any>(null);
  const [getImage, setImage] = React.useState<any>(null);

  const videoURL = "http://192.168.2.121:3005/v1/test2?id=0&season=1&episode=7&dr=video "; //"http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";
  const image = Asset.fromURI(
    "http://192.168.2.121:3005/v1/test2?id=0&season=1&episode=7&dr=sliderSeek"
  );

  React.useEffect(() => {
    (async () => {
      // TODO: Running both asyncs at the same time
      await image.downloadAsync();
      setImage(image);

      await VideoRef?.current?.loadAsync({ uri: videoURL });
    })();
  }, []);

  return (
    <View style={styles.container}>
      {getImage && <VideoPlayer VideoRef={VideoRef} imageURI={getImage}></VideoPlayer>}
      {/* <FadingEdgesView
        style={{ width: "100%", height: "100%", borderWidth: 1, borderColor: "green" }}
        ParentBackgroundColor={"red"}>
        <Image
          source={Cover2}
          resizeMethod="scale"
          style={{
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}></Image>
      </FadingEdgesView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: "center",
    //justifyContent: "center",
    width: "100%",
    height: "100%", //WindowSize.Height * 0.7,
    backgroundColor: backgroundColor,
    position: "absolute",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
