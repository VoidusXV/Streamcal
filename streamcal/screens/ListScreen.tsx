import React from "react";

import { View, StyleSheet, Image } from "react-native";
import { backgroundColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";

import FadingEdgesView from "../components/Designs/FadingEdgesView";
import { Asset } from "expo-asset";
import VideoPlayer from "../components/SubPages/ViewContent/MediaScreen/VideoPlayer";
const Cover2 = require("../assets/covers/One_Piece.jpg");

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

function GeneratedImageExist(array: any, zoomImageIndex: any) {
  return Boolean(array.find((element: any) => element.zoomImageIndex === zoomImageIndex));
}

function SaveGenerated_PreviewImages(array: any, zoomImageIndex: any, onAdd: any) {
  if (GeneratedImageExist(array, zoomImageIndex)) return;

  onAdd();
  array.push(zoomImageIndex);
}

interface IGeneratedImages {
  zoomImageIndex: any;
  zoomImageURI: any;
}

export default function ListScreen() {
  const VideoRef = React.useRef<any>(null);

  const [getImage, setImage] = React.useState<any>(null);
  let generatedImages: IGeneratedImages[] = [];
  const [getGeneratedImages, setGeneratedImages] = React.useState<any>([{}]);

  const videoURL = "http://192.168.2.121:3005/v1/test2?id=0&season=1&episode=7&dr=video "; //"http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";
  const image = Asset.fromURI(
    "http://192.168.2.121:3005/v1/test2?id=0&season=1&episode=7&dr=sliderSeek"
  );

  React.useEffect(() => {
    return;
    (async () => {
      // TODO: Running both asyncs at the same time
      await image.downloadAsync();
      setImage(image);
      await VideoRef?.current?.loadAsync({ uri: videoURL });

      console.log("Starting Generate CroppedImages");
      for (let index = 0; index < 145; index++) {
        generatedImages.push({
          zoomImageIndex: index,
          zoomImageURI: await zoomImage(image, index),
        });
      }

      console.log("Generate CroppedImages Done");
      setGeneratedImages(generatedImages);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <VideoPlayer VideoRef={VideoRef} CroppedImages={getGeneratedImages}></VideoPlayer>

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
