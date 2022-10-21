import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { FlashList } from "@shopify/flash-list";
import { WindowSize } from "../../constants/Layout";
import { selectionColor } from "../../constants/Colors";
import { Server_GetHistory } from "../../../backend/serverConnection";
import { gContent } from "../../constants/Content";
import { IContentInfo } from "../../constants/interfaces";

const HistoryCard = () => {
  const width = WindowSize.Width * 0.47;
  const marginLeft = 1 - (width * 2) / WindowSize.Width;
  return (
    <View
      style={{
        width: width,
        height: WindowSize.Width * 0.4,
        backgroundColor: "white",
        borderRadius: 5,
        marginTop: WindowSize.Width * 0.05,
        marginLeft: WindowSize.Width * (marginLeft / 4),
      }}
    >
      <View style={{ height: "50%", width: "100%", backgroundColor: "red" }}>
        {/* <Image></Image> */}
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
      <View style={{ flex: 1, backgroundColor: "#22314d" }}>
        <Text
          numberOfLines={1}
          style={{
            marginLeft: "4%",
            marginTop: "2%",
            color: "rgba(255,255,255,0.8)",
            maxWidth: "90%",
          }}
        >
          {"Kokus Managers e ef ef ef ef ef".toUpperCase()}
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
          }}
        >
          SEASON 1 | EPISODE 3
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            marginLeft: "4%",
            marginTop: "2%",
            color: "white",
            maxWidth: "90%",
            fontSize: WindowSize.Width * 0.04,
          }}
        >
          Der Kampf
        </Text>
      </View>
    </View>
  );
};

const data = [{ kok: "1" }, { kok: "2" }, { kok: "3" }, { kok: "4" }, {}, {}];

interface IHistory {
  ContentID: any;
  Season: any; // TODO: change to SeasonNum and backend
  EpisodeNum: any;
}

function getContentByContentID(contentData: Array<IContentInfo>, ContentID: any): IContentInfo {
  for (let index = 0; index < contentData.length; index++) {
    if (contentData[index].ID == ContentID) return contentData[index];
  }
  return "" as IContentInfo;
}

const History = () => {
  const [getHistoryData, setHistoryData] = React.useState<Array<IContentInfo>>([]);
  React.useEffect(() => {
    (async () => {
      const historyData: Array<IHistory> = await Server_GetHistory();
      let filteredHistoryData: Array<IContentInfo> = [];
      historyData.forEach((e) =>
        filteredHistoryData.push(getContentByContentID(gContent.data, e.ContentID))
      );

      setHistoryData(filteredHistoryData);

      // historyData.
      //console.log("Test:", gContent.data[0]);
    })();
  }, []);

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <FlashList
        estimatedItemSize={20}
        data={getHistoryData}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 200 }}
        renderItem={() => <HistoryCard></HistoryCard>}
      ></FlashList>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({});
