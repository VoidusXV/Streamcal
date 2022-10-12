import React from "react";

import {
  View,
  StyleSheet,
  Image,
  Text,
  Animated,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Easing,
  LayoutChangeEvent,
} from "react-native";
import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";

import FadingEdgesView from "../components/Designs/FadingEdgesView";
import { Asset } from "expo-asset";
import VideoPlayer from "../components/SubPages/MediaScreen/VideoPlayer/VideoPlayer";
import NotifyBox, { Animation_Main } from "../components/Designs/NotifyBox";
import SettingsButton from "../components/Designs/SettingsButton";

import { MaterialIcons } from "@expo/vector-icons";
import DropDownMenu from "../components/Designs/DropDownMenu";

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

const DescriptionContainer = ({ DescriptionText }: any) => {
  return (
    <View
      style={{
        width: "100%",
        //backgroundColor: "red",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "3%",
        paddingBottom: "3%",
      }}>
      <Text
        numberOfLines={2}
        style={{ color: "white", fontSize: WindowSize.Width * 0.05, maxWidth: "90%" }}>
        {DescriptionText}
      </Text>
    </View>
  );
};

export default function ListScreen() {
  const [a, b] = React.useState<any>("");

  const t =
    "Dank einer geheimen Organisation namens Lycoris, die nur aus Mädchen besteht, herrscht Frieden. Die elitäre, freigeistige Chisato ist die stärkste Agentin aller Zeiten und bildet zusammen mit der kühlen, talentierten, aber geheimnisvollen Takina ein nahezu perfektes Duo";
  return (
    <View style={styles.container}>
      {/* <DropDownMenu endHeight={300}></DropDownMenu> */}

      <NotifyBox MessageText={a}></NotifyBox>

      <SettingsButton
        onPress={() => {
          b(new Date().getMilliseconds());
          Animation_Main();
        }}></SettingsButton>

      {/* <DescriptionContainer DescriptionText={t}></DescriptionContainer> */}
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
  DropDownMenuContainer: {
    backgroundColor: "#253959",
    width: "90%",
    minHeight: WindowSize.Width * 0.13,
    //height: WindowSize.Width * 0.13,
    alignSelf: "center",
    padding: "3%",
    borderRadius: WindowSize.Width * 0.02,
  },
});
