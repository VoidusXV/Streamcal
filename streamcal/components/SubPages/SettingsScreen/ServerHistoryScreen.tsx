import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { WindowSize } from "../../constants/Layout";
import { selectionColor } from "../../constants/Colors";
import { FlashList } from "@shopify/flash-list";
import { GetData_AsyncStorage } from "../../DataHandling";
import { IServerInfo } from "../../../backend/serverConnection";

const HistoryCard = ({ item }: { item: IServerInfo }) => {
  return (
    <View
      style={{
        ...styles.HistoryCard_Container,
        paddingTop: "2%",
        paddingBottom: "2%",
        paddingLeft: "5%",
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: WindowSize.Width * 0.045,
          maxWidth: "90%",
        }}
      >
        {item.Description}
      </Text>
      <Text
        style={{
          color: "white",
          fontSize: WindowSize.Width * 0.045,
          maxWidth: "90%",
        }}
      >
        {item.Server}:{item.Port}
      </Text>
      <Text
        style={{
          color: "white",
          fontSize: WindowSize.Width * 0.045,
          maxWidth: "90%",
        }}
      >
        {item.APIKEY}
      </Text>
    </View>
  );
};

const ServerHistoryScreen = () => {
  const [getHistory, setHistory] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const a = await GetData_AsyncStorage("ServerConnection_History");
      setHistory(a);
      //console.log(a);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {getHistory.length > 0 && (
        <FlashList
          estimatedItemSize={10}
          data={getHistory}
          renderItem={({ item }: { item: IServerInfo }) => <HistoryCard item={item}></HistoryCard>}
        ></FlashList>
      )}
    </View>
  );
};

export default ServerHistoryScreen;

const styles = StyleSheet.create({
  HistoryCard_Container: {
    width: "90%",
    backgroundColor: selectionColor,
    alignSelf: "center",
    marginTop: "5%",
    borderRadius: WindowSize.Width * 0.02,
  },
});
