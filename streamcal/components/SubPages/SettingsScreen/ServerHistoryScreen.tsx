import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { WindowSize } from "../../constants/Layout";
import { selectionColor } from "../../constants/Colors";
import { FlashList } from "@shopify/flash-list";
import { GetData_AsyncStorage, StoreData_AsyncStorage } from "../../DataHandling";
import { IServerInfo } from "../../../backend/serverConnection";

const HistoryCard = ({ item, navigation }: { item: IServerInfo; navigation: any }) => {
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
  const onPress = () => {
    console.log("first2");
    navigation.navigate("ServerConnectionScreen", item);
  };
  return (
    <Animated.View
      style={{
        ...styles.HistoryCard_Container,
        paddingTop: "2%",
        paddingBottom: "2%",
        paddingLeft: "5%",
        transform: [{ scale }],
      }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        <Text
          style={{
            color: "white",
            fontSize: WindowSize.Width * 0.045,
            maxWidth: "90%",
            textDecorationLine: "underline",
          }}>
          {item.Description}
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: WindowSize.Width * 0.045,
            maxWidth: "90%",
          }}>
          {item.Server}:{item.Port}
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: WindowSize.Width * 0.045,
            maxWidth: "90%",
          }}>
          {item.APIKEY}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

async function ClearHistory(setHistory: any) {
  console.log("first");
  await StoreData_AsyncStorage("ServerConnection_History", null);
  setHistory(null);
}
const ServerHistoryScreen = ({ navigation }: any) => {
  const [getHistory, setHistory] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const HistoryData = await GetData_AsyncStorage("ServerConnection_History");
      setHistory(HistoryData);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Text
        onPress={async () => await ClearHistory(setHistory)}
        style={{
          color: "white",
          fontSize: WindowSize.Width * 0.04,
          textAlign: "right",
          marginRight: "7%",
          marginTop: "5%",
          fontWeight: "500",
        }}>
        CLEAR HISTORY
      </Text>
      {getHistory && getHistory.length > 0 && (
        <FlashList
          estimatedItemSize={10}
          data={getHistory}
          renderItem={({ item }: { item: IServerInfo }) => (
            <HistoryCard navigation={navigation} item={item}></HistoryCard>
          )}></FlashList>
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
