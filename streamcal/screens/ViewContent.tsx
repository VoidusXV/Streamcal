import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Octicons } from "@expo/vector-icons";

import { backgrounColorRGB, backgroundColor, selectionColor } from "../components/constants/Colors";
import { Mini_IconSize, WindowSize } from "../components/constants/Layout";
import { FlashList } from "@shopify/flash-list";
import MediaItemCard from "../components/Designs/MediaItemCard";
import FadingEdgesView from "../components/Designs/FadingEdgesView";
import {
  getEpisodeAmount,
  getMediaLocations,
  getSeasonAmount,
  getThumbnailURL,
} from "../backend/serverConnection";
import { generateThumbnail } from "../components/media/Functions";

const ImageContainer = ({ ContentTitle, CoverURL, scrollValue }: any) => {
  const [getTextHeight, setTextHeight] = React.useState<any>(0);
  return (
    <View
      style={{
        width: "100%",
        height: WindowSize.Width * 1.1,
        position: "absolute",
      }}>
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: `rgba(${backgrounColorRGB},${scrollValue / WindowSize.Width})`,
          position: "absolute",
          zIndex: 2,
        }}></View>

      <FadingEdgesView
        style={{ width: "100%", height: "100%", backgroundColor: "red" }}
        // BottomGradient_Position={WindowSize.Width * 0.2}
        ParentBackgroundColor={backgroundColor}>
        <Image
          source={{ uri: CoverURL }}
          resizeMethod="scale"
          style={{
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}></Image>
        <Text
          onLayout={(e) => setTextHeight(e.nativeEvent.layout.height)}
          style={{
            color: "white",
            fontWeight: "500",
            position: "absolute",
            fontSize: WindowSize.Width * 0.07,
            zIndex: 3,
            marginTop: WindowSize.Width * 0.85 - (getTextHeight - WindowSize.Width * 0.1), //"85%",
            marginLeft: "5%",
            //maxWidth: "90%",
            // backgroundColor: "red",
          }}>
          {ContentTitle}
        </Text>
      </FadingEdgesView>
    </View>
  );
};

const ContentInfo = ({ SeasonNum, EpisodeNum }: any) => (
  <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
    <Text style={styles.InfoText}>&#9679; Serie</Text>
    <Text style={styles.InfoText}>&#9679; {SeasonNum} Staffel</Text>
    <Text style={styles.InfoText}>&#9679; {EpisodeNum} Folgen</Text>
  </View>
);

const SelectionBox = () => (
  <View style={styles.SelectionBox}>
    <Text
      style={{
        fontSize: WindowSize.Width * 0.05,
        color: "white",
        textAlign: "center",
        letterSpacing: 2,
      }}>
      FOLGEN
    </Text>
  </View>
);
const Season_SelectionBox = ({ TitleText }: any) => {
  return (
    <View style={styles.Season_SelectionBox}>
      <View style={{ width: "20%", ...styles.ContainerMiddle }}>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={WindowSize.Width * 0.09}
          color="white"></MaterialIcons>
      </View>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            color: "white",
            fontSize: WindowSize.Width * 0.06,
          }}>
          {TitleText}
        </Text>
      </View>
    </View>
  );
};

const TopBar = ({ navigation, Title, scrollValue }: any) => {
  const scrollStart = -(WindowSize.Width * 0.7);
  const scrollEnd = (scrollStart + scrollValue) / (WindowSize.Width * 0.3);
  const alphaColor = scrollValue / WindowSize.Width;
  return (
    <Animated.View
      style={{
        width: "100%",
        height: WindowSize.Width * 0.1,
        // backgroundColor: `rgba(${backgrounColorRGB},${scrollEnd})`,
        backgroundColor: alphaColor >= 1 ? backgroundColor : "transparent",
        position: "absolute",
        zIndex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: "2%",
      }}>
      <View style={{ flexDirection: "row" }}>
        <MaterialIcons
          name="arrow-back"
          size={Mini_IconSize}
          onPress={() => navigation.goBack()}
          color="white"></MaterialIcons>
        <Text
          numberOfLines={1}
          style={{
            fontSize: WindowSize.Width * 0.06,
            fontWeight: "500",
            marginLeft: "4%",
            color: "white",
            maxWidth: "85%",
            opacity: scrollEnd,
          }}>
          {Title}
        </Text>
      </View>
    </Animated.View>
  );
};

const ViewContent = ({ route, navigation }: any) => {
  const { contentData } = route.params;
  const [isLoaded, setLoaded] = React.useState(false);

  const [getMediaLocation, setMediaLocation] = React.useState<any>([]);
  const [getVideoThumbnailURLs, setVideoThumbnailURLs] = React.useState<any>([]);
  const [getSeason, setSeason] = React.useState(0);

  const [getScrollValue, setScrollValue] = React.useState(0);
  // console.log(getMediaLocation.Series.Seasons[0]);
  //console.log(contentData.ID);
  let data: any;
  React.useEffect(() => {
    (async () => {
      const URL = "http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";
      const thumbnailURL = await generateThumbnail(URL);
      setVideoThumbnailURLs([thumbnailURL]);

      data = await getMediaLocations(contentData.ID);
      setMediaLocation(data);
      setLoaded(true);
    })();
  }, []);

  return (
    <>
      <TopBar
        scrollValue={getScrollValue}
        navigation={navigation}
        alphaColor={getScrollValue}
        Title={contentData.Title}></TopBar>

      <ScrollView
        onScroll={(e) => setScrollValue(e.nativeEvent.contentOffset.y)}
        style={styles.container}>
        {isLoaded && (
          <>
            <ImageContainer
              scrollValue={getScrollValue}
              CoverURL={contentData?.Cover}
              ContentTitle={contentData?.Title}></ImageContainer>
            <View style={styles.ContentContainer}>
              <ContentInfo
                SeasonNum={getSeasonAmount(getMediaLocation)}
                EpisodeNum={getEpisodeAmount(getMediaLocation)}></ContentInfo>
              <SelectionBox></SelectionBox>
              <Season_SelectionBox TitleText="Staffel 1"></Season_SelectionBox>

              <FlashList
                data={getMediaLocation.Series.Seasons[0].Episodes} // Staffel 1
                //keyExtractor={(item: any) => item.ID}
                estimatedItemSize={20}
                contentContainerStyle={{ paddingBottom: WindowSize.Width * 0.1 }}
                renderItem={({ item, index }: any) => (
                  <MediaItemCard
                    ID_Path={item.Episode}
                    Title={item.Title}
                    Duration={item.Duration}
                    Description={item.Description}
                    navigation={navigation}
                    routeParams={{
                      item,
                      ContentTitle: contentData?.Title,
                      ContentID: contentData?.ID,
                      AllData: getMediaLocation.Series.Seasons[getSeason].Episodes,
                      index: index,
                    }}
                    Source={{
                      uri: getThumbnailURL(contentData?.ID, getSeason + 1, item.Episode),
                    }}></MediaItemCard>
                )}></FlashList>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
};

export default ViewContent;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: backgroundColor,
  },
  ContainerMiddle: { justifyContent: "center", alignItems: "center" },
  InfoText: {
    color: "#e0ebff",
    fontSize: WindowSize.Width * 0.05,
    marginRight: "3%",
    marginTop: "5%",
  },
  ContentContainer: {
    width: "100%",
    minHeight: WindowSize.Width * 0.97,
    //height: WindowSize.Height * 0.8,
    marginTop: WindowSize.Width * 1.05,
    backgroundColor: backgroundColor,
    //flexDirection: "row",
  },
  SelectionBox: {
    width: "100%",
    height: WindowSize.Width * 0.13,
    backgroundColor: "#22314d",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "white",
  },
  Season_SelectionBox: {
    width: "100%",
    height: WindowSize.Width * 0.13,
    //borderRadius: 5,
    backgroundColor: "#22314d",
    marginTop: "4%",
    alignSelf: "center",
    flexDirection: "row",
  },
});
