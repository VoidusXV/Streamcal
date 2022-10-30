import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { FlashList } from "@shopify/flash-list";
import { WindowSize } from "../../../constants/Layout";
import { selectionColor } from "../../../constants/Colors";
import {
  getMediaLocations,
  getThumbnailURL,
  Server_GetHistory,
} from "../../../../backend/serverConnection";
import { gContent } from "../../../constants/Content";
import { IMediaData } from "../../../constants/interfaces";
import {
  getContentInfoByContentID,
  getEpisodeByEpisdeNum,
  getIndexByEpisodeNum,
} from "../../../../backend/MediaHandler";
import { IFilteredEpisodeHistory, IHistory, IHistoryData } from "./HistoryInterfaces";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface IHistoryCard {
  item?: IFilteredEpisodeHistory;
  onPress?: any;
}
const HistoryCard = ({ item, onPress }: IHistoryCard) => {
  const [ThumbnailURL, setThumbnailURL] = React.useState("");

  const width = WindowSize.Width * 0.47;
  const marginLeft = 1 - (width * 2) / WindowSize.Width;

  React.useEffect(() => {
    (async () => {
      const URL = await getThumbnailURL(
        item?.HistoryData?.ContentID,
        item?.HistoryData?.SeasonNum + 1,
        item?.Episode?.EpisodeNum
      );

      setThumbnailURL(URL);
    })();
  }, [item]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        width: width,
        height: WindowSize.Width * 0.5,
        // backgroundColor: "white",
        borderRadius: 5,
        marginTop: WindowSize.Width * 0.05,
        marginLeft: WindowSize.Width * (marginLeft / 4),
      }}>
      <View style={{ height: "50%", width: "100%" }}>
        {ThumbnailURL && (
          <Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
            source={{ uri: ThumbnailURL }}></Image>
        )}
        {/* <View
          style={{
            backgroundColor: selectionColor,
            width: "50%",
            height: "8%",
            position: "absolute",
            marginTop: WindowSize.Width * 0.185,
          }}
        ></View> */}
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#22314d",
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
        }}>
        <Text
          numberOfLines={1}
          style={{
            marginLeft: "4%",
            marginTop: "4%",
            color: "rgba(255,255,255,0.8)",
            maxWidth: "90%",
          }}>
          {item?.ContentTitle.toUpperCase()}
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            marginLeft: "4%",
            marginTop: "2%",
            color: "rgba(255,255,255,0.8)",
            maxWidth: "90%",
            // fontSize: WindowSize.Width * 0.04,
          }}>
          {`SEASON ${item?.HistoryData?.SeasonNum + 1} | EPISODE ${item?.Episode?.EpisodeNum}`}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginLeft: "4%",
            marginTop: "4%",
            color: "white",
            maxWidth: "90%",
            fontSize: WindowSize.Width * 0.04,
          }}>
          {`${item?.Episode?.Title}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const History = ({ navigation }: { navigation: NativeStackNavigationProp<any> }) => {
  const [getHistoryData, setHistoryData] = React.useState<Array<IFilteredEpisodeHistory>>([]);

  React.useEffect(() => {
    const _AbortController = new AbortController();

    async function FilterData() {
      const historyData: Array<IHistoryData> = await Server_GetHistory();
      // const data = await getMediaLocations(contentData?.ID);

      let filteredHistoryData: Array<IFilteredEpisodeHistory> = [];
      //TODO: only do this if gContent.mediaData is empty
      for (const e of historyData) {
        const data: IMediaData = await getMediaLocations(e?.ContentID, _AbortController);

        const Episode = getEpisodeByEpisdeNum(
          data.Series?.Seasons?.[e.SeasonNum]?.Episodes,
          e.EpisodeNum
        );
        filteredHistoryData.push({
          ContentTitle: getContentInfoByContentID(gContent.data, e.ContentID)?.Title,
          HistoryData: e,
          Episodes: data.Series?.Seasons?.[e.SeasonNum]?.Episodes,
          Episode,
        }); //TODO: If Movies are supported make it variable
      }

      return filteredHistoryData;
    }

    const unsubscribe = navigation.addListener("focus", async () => {
      const filteredContentInfo: Array<IFilteredEpisodeHistory> = await FilterData();
      setHistoryData(filteredContentInfo);
      console.log("onHistoryScreen");
      //TODO: check gContent if its empty fetch data and
      //add mediaData content to the mediaData global variable and check if its emtpy
      // navigation listener
    });

    return () => {
      _AbortController.abort();
      unsubscribe();
    };
  }, [navigation]);

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <FlashList
        estimatedItemSize={200}
        data={getHistoryData}
        numColumns={2}
        refreshing={true}
        contentContainerStyle={{ paddingBottom: 200 }}
        renderItem={({ item }) => (
          <HistoryCard
            onPress={() =>
              navigation.navigate("MediaScreen", {
                Episode: item.Episode, //
                ContentTitle: item?.ContentTitle,
                ContentID: item?.HistoryData?.ContentID,
                Episodes: item.Episodes,
                index: getIndexByEpisodeNum(item.Episodes, item.Episode?.EpisodeNum),
                getSeason: item.HistoryData?.SeasonNum,
                isFullScreen: false,
              })
            }
            item={item}></HistoryCard>
        )}></FlashList>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({});
