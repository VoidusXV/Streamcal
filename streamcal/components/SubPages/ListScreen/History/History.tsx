import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { FlashList } from "@shopify/flash-list";
import { Bigger_IconSize, Mini_IconSize, WindowSize } from "../../../constants/Layout";
import { selectionColor } from "../../../constants/Colors";
import {
  getMediaLocations,
  getThumbnailURL,
  Server_GetHistory,
  Server_GetWatchTime,
} from "../../../../backend/serverConnection";
import { gContent } from "../../../constants/Content";
import { IMediaData, IWatchTime } from "../../../constants/interfaces";
import {
  getContentInfoByContentID,
  getEpisodeByEpisdeNum,
  getIndexByEpisodeNum,
  getSeasonIndexBySeasonNum,
} from "../../../../backend/MediaHandler";
import { IFilteredEpisodeHistory, IHistory, IHistoryData } from "./HistoryInterfaces";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MilisecondsToMinutes } from "../../../media/Functions";
import { MaterialIcons } from "@expo/vector-icons";

interface HistoryCard_WatchedHUD {
  WatchedDurationLeft_Minutes?: any;
  WatchedDuration_Minutes?: any;
  WatchedDurationPercent?: any;
}
const HistoryCard_WatchedHUD = ({
  WatchedDurationLeft_Minutes,
  WatchedDuration_Minutes,
  WatchedDurationPercent,
}: HistoryCard_WatchedHUD) => {
  const contentWatchted = Math.round(WatchedDurationLeft_Minutes) <= 2;

  const TextValue = !contentWatchted
    ? `${Math.round(WatchedDurationLeft_Minutes)} Min Left`
    : "Watched";

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 5,
      }}>
      <Text numberOfLines={1} style={styles.textWatchedHUD_Style}>
        {TextValue}
      </Text>
      {contentWatchted ? (
        <MaterialIcons
          style={{ position: "absolute", alignSelf: "center", marginTop: "18%" }}
          name="refresh"
          size={Mini_IconSize}
          color="white"></MaterialIcons>
      ) : (
        <MaterialIcons
          style={{ position: "absolute", alignSelf: "center", marginTop: "18%" }}
          name="play-arrow"
          size={Mini_IconSize}
          color="white"></MaterialIcons>
      )}
      {!contentWatchted && (
        <View
          style={{
            backgroundColor: selectionColor,
            width: `${WatchedDurationPercent}%`, //WatchedDurationPercent
            height: "4%",
            position: "absolute",
            marginTop: WindowSize.Width * 0.24,
          }}></View>
      )}
    </View>
  );
};

interface IHistoryCard {
  item?: IFilteredEpisodeHistory;
  onPress?: any;
  WatchTimeData?: Array<IWatchTime>;
}
const HistoryCard = ({ item, onPress, WatchTimeData }: IHistoryCard) => {
  const [ThumbnailURL, setThumbnailURL] = React.useState("");

  const width = WindowSize.Width * 0.47;
  const marginLeft = 1 - (width * 2) / WindowSize.Width;

  const WatchTimeContent = WatchTimeData?.find((x) => x.ContentID == item?.HistoryData?.ContentID);
  const Find_WatchTimeLocation = (x: any) =>
    x.SeasonNum == item?.HistoryData?.SeasonNum && x.EpisodeNum == item?.HistoryData?.EpisodeNum;

  const WatchTimeLocation = WatchTimeContent?.Locations?.find(Find_WatchTimeLocation);
  const WatchedDurationPercent = Math.floor(
    (WatchTimeLocation?.WatchedDuration / item?.Episode?.Duration) * 100
  );
  const WatchedDurationLeft_Minutes = MilisecondsToMinutes(
    item?.Episode?.Duration - WatchTimeLocation?.WatchedDuration,
    false
  );

  const WatchedDuration_Minutes = MilisecondsToMinutes(WatchTimeLocation?.WatchedDuration, false);

  React.useEffect(() => {
    (async () => {
      const URL = await getThumbnailURL(
        item?.HistoryData?.ContentID,
        item?.HistoryData?.SeasonNum,
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
        {WatchTimeLocation && (
          <HistoryCard_WatchedHUD
            WatchedDurationLeft_Minutes={WatchedDurationLeft_Minutes}
            WatchedDurationPercent={WatchedDurationPercent}
            WatchedDuration_Minutes={WatchedDuration_Minutes}></HistoryCard_WatchedHUD>
        )}
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
          {item?.ContentTitle?.toUpperCase()}
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
          {`SEASON ${item?.HistoryData?.SeasonNum} | EPISODE ${item?.Episode?.EpisodeNum}`}
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
  const [getWatchTimeData, setWatchTimeData] = React.useState<Array<IWatchTime>>([]);

  React.useEffect(() => {
    const _AbortController = new AbortController();

    async function FilterData() {
      let historyData: Array<IHistoryData> = [];
      //let watchTimeData: Array<IWatchTime> = [];

      await Promise.all([Server_GetHistory(), Server_GetWatchTime()]).then((data) => {
        historyData = data[0];
        setWatchTimeData(data[1]);
      });

      let filteredHistoryData: Array<IFilteredEpisodeHistory> = [];
      //TODO: only do this if gContent.mediaData is empty
      for (const e of historyData) {
        const data: IMediaData = await getMediaLocations(e?.ContentID, _AbortController);

        const SeasonIndex = getSeasonIndexBySeasonNum(data.Series?.Seasons, e.SeasonNum) || 0;

        const Episode = getEpisodeByEpisdeNum(
          data.Series?.Seasons?.[SeasonIndex]?.Episodes,
          e.EpisodeNum
        );
        filteredHistoryData.push({
          ContentTitle: getContentInfoByContentID(gContent.data, e.ContentID)?.Title,
          HistoryData: e,
          Episodes: data.Series?.Seasons?.[SeasonIndex]?.Episodes,
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
        extraData={{ WatchTimeData: getWatchTimeData }}
        data={getHistoryData}
        numColumns={2}
        refreshing={true}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, WatchTimeData }: any) => (
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
            item={item}
            WatchTimeData={getWatchTimeData}></HistoryCard>
        )}></FlashList>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  textWatchedHUD_Style: {
    backgroundColor: "rgba(0,0,0,0.7)",
    marginTop: WindowSize.Width * 0.16,
    marginLeft: "auto",
    marginRight: "10%",
    maxWidth: "70%",
    color: "white",
    padding: "2%",
    paddingLeft: "5%",
    paddingRight: "5%",
  },
});
