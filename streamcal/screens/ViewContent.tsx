import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Animated,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { Children } from "react";
import { MaterialIcons } from "@expo/vector-icons";

import { backgrounColorRGB, backgroundColor } from "../components/constants/Colors";
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
import { ICurrentContentInfo, IMediaData } from "../components/constants/interfaces";
import LoadingIndicator from "../components/Designs/LoadingIndicator";

const ImageContainer = ({ ContentTitle, CoverURL, scrollValue }: any) => {
  const [getTextHeight, setTextHeight] = React.useState<any>(0);
  return (
    <View
      style={{
        width: "100%",
        height: WindowSize.Width * 1.1,
        position: "absolute",
      }}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: `rgba(${backgrounColorRGB},${scrollValue / WindowSize.Width})`,
          position: "absolute",
          zIndex: 2,
        }}
      ></View>

      <FadingEdgesView
        style={{ width: "100%", height: "100%", backgroundColor: "red" }}
        // BottomGradient_Position={WindowSize.Width * 0.2}
        ParentBackgroundColor={backgroundColor}
      >
        <Image
          source={{ uri: CoverURL }}
          resizeMethod="scale"
          resizeMode="cover"
          //blurRadius={0}
          style={{
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        ></Image>
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
          }}
        >
          {ContentTitle}
        </Text>
      </FadingEdgesView>
    </View>
  );
};

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
      }}
    >
      <Text
        numberOfLines={2}
        style={{ color: "white", fontSize: WindowSize.Width * 0.05, maxWidth: "90%" }}
      >
        {DescriptionText}
      </Text>
    </View>
  );
};
const ContentInfo = ({ SeasonNum, EpisodeNum, DescriptionText }: any) => (
  <>
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
      <Text style={styles.InfoText}>&#9679; Series</Text>
      <Text style={styles.InfoText}>
        &#9679; {SeasonNum} {SeasonNum == 1 ? "Season" : "Seasons"}
      </Text>
      <Text style={styles.InfoText}>
        &#9679; {EpisodeNum} {EpisodeNum == 1 ? "Episode" : "Episodes"}
      </Text>
    </View>
    <DescriptionContainer DescriptionText={DescriptionText}></DescriptionContainer>
    <Text
      onPress={() => console.log("Show More Details")}
      style={{ ...styles.InfoText, textDecorationLine: "underline", textAlign: "center" }}
    >
      Show More Details
    </Text>
  </>
);

const SelectionBox = () => (
  <View style={styles.SelectionBox}>
    <Text
      style={{
        fontSize: WindowSize.Width * 0.05,
        color: "white",
        textAlign: "center",
        letterSpacing: 2,
      }}
    >
      EPISODES
    </Text>
  </View>
);

const Season_SelectionBox = ({ TitleText, onPress }: any) => {
  return (
    <View style={styles.Season_SelectionBox}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={{ width: "100%", alignItems: "center", flexDirection: "row" }}
      >
        <MaterialIcons
          name="arrow-drop-down"
          size={WindowSize.Width * 0.07}
          color="white"
          style={{ marginLeft: "3%" }}
        ></MaterialIcons>
        <Text
          numberOfLines={1}
          style={{
            color: "white",
            fontSize: WindowSize.Width * 0.05,
            marginLeft: "2%",
            maxWidth: "85%",
          }}
        >
          {TitleText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const SeasonModalContainer = ({ onClose, onPress, SeasonData, ContentTitle }: any) => {
  //console.log(SeasonData);
  return (
    <View style={{ backgroundColor: backgroundColor, width: "100%", height: "100%" }}>
      <View
        style={{
          height: "8%",
          width: "100%",
          flexDirection: "row",
          //backgroundColor: "red",
          alignItems: "center",
          paddingLeft: "5%",
          borderBottomWidth: 1,
          borderColor: "white",
        }}
      >
        <MaterialIcons name="close" size={Mini_IconSize} color="white" onPress={onClose} />
        <Text style={{ color: "white", fontSize: WindowSize.Width * 0.06, marginLeft: "5%" }}>
          Seasons
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <FlashList
          data={SeasonData}
          estimatedItemSize={20}
          //contentContainerStyle={{ backgroundColor: "red" }}
          renderItem={({ item, index }: any) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onPress && onPress(index)}
              style={{
                width: "100%",
                height: WindowSize.Width * 0.15,
                borderBottomWidth: 1,
                borderColor: "rgba(255,255,255,0.5)",
                justifyContent: "center",
                // backgroundColor: "red",
              }}
            >
              <Text style={{ color: "white", fontSize: WindowSize.Width * 0.05, marginLeft: "5%" }}>
                Season {item?.SeasonNum} - {ContentTitle}
              </Text>
            </TouchableOpacity>
          )}
        ></FlashList>
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
        height: WindowSize.Width * 0.15,
        // backgroundColor: `rgba(${backgrounColorRGB},${scrollEnd})`,
        backgroundColor: alphaColor >= 1 ? backgroundColor : "transparent",
        position: "absolute",
        zIndex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: "2%",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <MaterialIcons
          name="arrow-back"
          size={Mini_IconSize}
          onPress={() => navigation.goBack()}
          color="white"
        ></MaterialIcons>
        <Text
          numberOfLines={1}
          style={{
            fontSize: WindowSize.Width * 0.06,
            fontWeight: "500",
            marginLeft: "4%",
            color: "white",
            maxWidth: "85%",
            opacity: scrollEnd,
          }}
        >
          {Title}
        </Text>
      </View>
    </Animated.View>
  );
};

const ViewContent = ({ route, navigation }: any) => {
  const contentData: ICurrentContentInfo = route.params?.contentData;

  const [isLoading, setIsLoading] = React.useState(true);
  const [getMediaLocation, setMediaLocation] = React.useState<IMediaData>({});
  const [getSeason, setSeason] = React.useState(0);
  const [isSeasonModal, setSeasonModal] = React.useState(false);
  const [getScrollValue, setScrollValue] = React.useState(0);

  let data: any;
  React.useEffect(() => {
    let unsub = setTimeout(async () => {
      data = await getMediaLocations(contentData?.ID);
      setMediaLocation(data);
      setIsLoading(false);
    }, 0);

    return () => {
      clearTimeout(unsub);
      console.log("Unload ViewContent");
    };
  }, []);

  return (
    <>
      <TopBar
        scrollValue={getScrollValue}
        navigation={navigation}
        alphaColor={getScrollValue}
        Title={contentData?.Title}
      ></TopBar>

      <ScrollView
        onScroll={(e) => setScrollValue(e.nativeEvent.contentOffset.y)}
        style={styles.container}
      >
        {isLoading && <LoadingIndicator></LoadingIndicator>}
        {!isLoading && (
          <>
            <ImageContainer
              scrollValue={getScrollValue}
              CoverURL={contentData?.Cover}
              ContentTitle={contentData?.Title}
            ></ImageContainer>
            <View style={styles.ContentContainer}>
              <ContentInfo
                DescriptionText={contentData?.Description}
                SeasonNum={getSeasonAmount(getMediaLocation)}
                EpisodeNum={getEpisodeAmount(getMediaLocation)}
              ></ContentInfo>
              <SelectionBox></SelectionBox>
              <Season_SelectionBox
                onPress={() => setSeasonModal(true)}
                TitleText={`Season ${getMediaLocation?.Series?.Seasons?.[getSeason].SeasonNum} - ${contentData.Title}`}
              ></Season_SelectionBox>

              <Modal
                transparent
                visible={isSeasonModal}
                onRequestClose={() => setSeasonModal(false)}
                animationType="slide"
              >
                <SeasonModalContainer
                  onClose={() => setSeasonModal(false)}
                  SeasonData={getMediaLocation?.Series?.Seasons}
                  ContentTitle={contentData?.Title}
                  onPress={(index: any) => {
                    setSeason(index);
                    setSeasonModal(false);
                  }}
                ></SeasonModalContainer>
              </Modal>

              <FlashList
                data={getMediaLocation?.Series?.Seasons?.[getSeason].Episodes} // Staffel 1
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
                      Episodes: getMediaLocation?.Series?.Seasons?.[getSeason].Episodes,
                      index: index,
                      getSeason: getSeason,
                      isFullScreen: false,
                    }}
                    Source={{
                      uri: getThumbnailURL(contentData?.ID, getSeason + 1, item.Episode),
                    }}
                  ></MediaItemCard>
                )}
              ></FlashList>
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
