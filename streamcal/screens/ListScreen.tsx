import React from "react";

import { View, StyleSheet, Image } from "react-native";
import { backgroundColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";

import FadingEdgesView from "../components/Designs/FadingEdgesView";
import { Asset } from "expo-asset";
const Cover2 = require("../assets/covers/One_Piece.jpg");

const zoomImage = async (image: any, setImage: any) => {
  const manipResult = await manipulateAsync(
    image.localUri || image.uri,
    [
      {
        crop: {
          height: WindowSize.Width * 0.13,
          width: WindowSize.Width * 0.22,
          originX: 160,
          originY: 0,
        },
      },
    ],
    { compress: 1, format: SaveFormat.PNG }
  );
  setImage(manipResult);
};
export default function ListScreen() {
  const [image, setImage] = React.useState<any>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const image = Asset.fromURI(
        "http://192.168.2.121:3005/v1/test2?id=0&season=1&episode=7&dr=sliderSeek"
      );
      await image.downloadAsync();
      setImage(image);
      setReady(true);
      await zoomImage(image, setImage);
    })();
  }, []);
  return (
    <View style={styles.container}>
      <View style={{ width: 100, height: 100 }}>
        {ready && (
          <Image
            //resizeMethod="resize"
            //resizeMode="contain"
            style={{
              backgroundColor: "white",
              width: 320,
              height: 180,
              //transform: [{ scale: 10 }],
            }}
            source={{
              uri: image.localUri || image.uri, //"http://192.168.2.121:3005/v1/test2?id=0&season=1&episode=7&dr=sliderSeek",
            }}></Image>
        )}
      </View>
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
    height: WindowSize.Height * 0.7,
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
