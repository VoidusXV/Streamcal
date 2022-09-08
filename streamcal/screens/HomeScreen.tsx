import React from "react";
import { View, StyleSheet, Text, Image, Animated, TouchableHighlight } from "react-native";
import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import { Foundation } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { getAllContent, getCoverURL } from "../backend/serverConnection";

const Cover = require("../assets/covers/kurokos-basketball-stream-cover-DCQ2LYPVqVRk0cyMCmDlMQPzkRHLtyqZ_220x330.jpeg");
const Cover2 = require("../assets/covers/One_Piece.jpg");
//<FontAwesome5 name="list-ul" size={24} color="black" />
//<MaterialIcons name="grid-view" size={24} color="black" />
// const data = [
//   { ID: 7, Path: "/Series/Season_1/7.mp4", Title: "Du wirst etwas einmaliges sehen" },
//   { ID: 7, Path: "/Series/Season_1/7.mp4", Title: "Du wirst etwas einmaliges sehen" },
//   { ID: 7, Path: "/Series/Season_1/7.mp4", Title: "Du wirst etwas einmaliges sehen" },
//   { ID: 7, Path: "/Series/Season_1/7.mp4", Title: "Du wirst etwas einmaliges sehen" },
// ];

const TilteContainer = () => {
  return (
    <View style={styles.TitleContainer}>
      <Foundation
        name="play-video"
        style={{ marginLeft: "5%" }}
        size={WindowSize.Width * 0.1}
        color={selectionColor}></Foundation>
      <Text style={styles.title}>Streamcal</Text>
    </View>
  );
};

const RenderItem = ({ onPress, TitleText, CoverURL, Availability }: any) => {
  //const AnimValue = React.useState(0);
  const animation = new Animated.Value(0);
  const inputRange = [0, 1];
  const outputRange = [1, 0.985];
  const scale = animation.interpolate({ inputRange, outputRange });

  const onPressIn = () => {
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      speed: 500,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      speed: 500,
    }).start();
  };

  return (
    <Animated.View
      style={{
        borderRadius: 5,
        width: "90%",
        height: WindowSize.Width * 0.825,
        backgroundColor: "#22314d",
        marginLeft: "5%",
        marginTop: "10%",
        transform: [{ scale }],
      }}>
      <TouchableHighlight
        style={{ flex: 1, borderRadius: 5 }}
        underlayColor="#2c4063"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}>
        <>
          <View style={{ height: "80%", width: "100%" }}>
            <Image
              borderRadius={5}
              source={{ uri: CoverURL }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"></Image>
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={2} style={{ ...styles.ContentText, marginTop: "4%" }}>
              {TitleText}
            </Text>
            <Text style={{ ...styles.ContentText, marginTop: "2%", color: "#acc0e3" }}>
              &#9679; Serie
            </Text>
          </View>
        </>
      </TouchableHighlight>
    </Animated.View>
  );
};

const ContentContainer = ({ navigation, data }: any) => {
  const [getMediaData, setMediaData] = React.useState([]);
  return (
    <FlashList
      numColumns={2}
      contentContainerStyle={{ paddingBottom: WindowSize.Width * 0.1 }}
      estimatedItemSize={20}
      data={data}
      renderItem={({ item }: any) => (
        <RenderItem
          TitleText={item.Title}
          CoverURL={getCoverURL(item.ID)}
          onPress={() =>
            navigation.navigate("ViewContent", {
              contentData: { ID: item.ID, Title: item.Title, Cover: getCoverURL(item.ID) },
            })
          }></RenderItem>
      )}></FlashList>
  );
};
export default function HomeScreen({ navigation }: any) {
  const [getContent, setContent] = React.useState({});

  React.useEffect(() => {
    (async () => {
      const data = await getAllContent();
      setContent(data);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <TilteContainer></TilteContainer>
      <View style={styles.separator}></View>
      <View style={{ flex: 1 }}>
        <ContentContainer data={getContent} navigation={navigation}></ContentContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  FillContainer: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    //alignItems: "center",
    //justifyContent: "center",
    backgroundColor: backgroundColor,
  },
  TitleContainer: {
    width: "100%",
    height: "8%",
    //backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "center",
    //justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: "3%",
  },
  ContentText: {
    color: "white",
    fontSize: WindowSize.Width * 0.04,
    marginLeft: "4%",
    //marginTop: "5%",
    maxWidth: "90%",
  },
  separator: {
    //  marginVertical: 30,
    height: "0.2%",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});
