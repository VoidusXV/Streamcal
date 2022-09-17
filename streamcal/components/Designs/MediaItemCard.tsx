import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  ImageSourcePropType,
} from "react-native";
import React from "react";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { WindowSize } from "../../components/constants/Layout";
interface IMediaItemCard {
  ID_Path: number;
  Title?: any;
  onPress?: () => void;
  navigation?: any;
  CoverSrc?: any;
  Source?: ImageSourcePropType | ImageSourcePropType[];
  Duration?: number;
  Description?: any;
  routeParams?: any;
}

function MilisecondsToMinutes(num: any) {
  return Math.round(num / 1000 / 60);
}

const MediaItemCard: React.FC<IMediaItemCard> = ({
  ID_Path,
  Title,
  Duration,
  Description,
  routeParams,
  onPress,
  navigation,
  Source,
}: any) => {
  return (
    <TouchableHighlight
      activeOpacity={0.6}
      underlayColor="#385180"
      style={{ ...styles.MediaItemCard_Container }}
      onPress={() => navigation.navigate("MediaScreen", routeParams)}>
      <>
        <View style={{ backgroundColor: "green", width: "45%", ...styles.ContainerMiddle }}>
          <Image
            source={Source}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}></Image>
          <Octicons
            name="play"
            size={WindowSize.Width * 0.15}
            color="white"
            style={{ position: "absolute" }}></Octicons>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={{
              marginLeft: "5%",
              marginTop: "3%",
              maxWidth: "90%",
              color: "white",
              fontSize: WindowSize.Width * 0.04,
            }}>
            <Text style={{ fontWeight: "bold" }}>{ID_Path}. </Text>
            <Text>{Title}</Text>
          </Text>

          <View
            style={{
              height: "30%",
              // justifyContent: "space-around",
              alignItems: "center",
              flexDirection: "row",
              marginTop: "auto",
            }}>
            <Text
              style={{
                color: "white",
                fontSize: WindowSize.Width * 0.04,
                marginLeft: "5%",
              }}>
              {MilisecondsToMinutes(Duration)} Min
            </Text>
            <Octicons
              name="download"
              size={WindowSize.Width * 0.07}
              style={{ marginLeft: "auto", marginRight: "7%" }}
              color="white"></Octicons>
          </View>
        </View>
      </>
    </TouchableHighlight>
  );
};

export default MediaItemCard;

const styles = StyleSheet.create({
  ContainerMiddle: { justifyContent: "center", alignItems: "center" },
  MediaItemCard_Container: {
    width: "100%",
    height: WindowSize.Height * 0.14,
    marginTop: "4%",
    backgroundColor: "#22314d",
    alignSelf: "center",
    flexDirection: "row",
  },
});
