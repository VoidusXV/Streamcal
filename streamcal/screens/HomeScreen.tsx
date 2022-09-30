import React from "react";
import { View, StyleSheet, Text, Image, Animated, TouchableHighlight } from "react-native";
import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import { Foundation } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import {
  getAllContent,
  getCoverURL,
  currentConnectionInfo,
  IsServerReachable,
  IServerInfo,
  checkAdminKey,
  SetGlobalConnection,
  ServerAuthentication,
} from "../backend/serverConnection";
import { GetData_AsyncStorage } from "../components/DataHandling";
import SettingsButton from "../components/Designs/SettingsButton";

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

const ErrorContainer = ({ setServerOnline, isServerOnline, getAuthResponse }: any) => {
  //async () => setServerOnline(await IsServerReachable())
  console.log(getAuthResponse, isServerOnline);
  //Re-Connect To Server
  function ErrorText() {
    if (!isServerOnline) return "Server is Offline";

    if (getAuthResponse == AuthResponse.UserNotExist)
      return "Make sure you have an account, check your Server-Connection Settings";
    if (getAuthResponse == AuthResponse.Account_Disabled)
      return "Your Account is disabled, message the Server-Owner";
    if (getAuthResponse == AuthResponse.Wrong_Device)
      return "Make you sure you use the right Device";

    //if (getAuthResponse == AuthResponse.Unkown_Issue) return "";
  }
  return (
    <View style={{ ...styles.container, ...styles.CenterChildren }}>
      <Text
        style={{
          fontSize: WindowSize.Width * 0.07,
          color: "rgba(255,255,255,0.8)",
          marginBottom: "10%",
          maxWidth: "90%",
        }}>
        {ErrorText()}
      </Text>
      {(!isServerOnline || getAuthResponse == AuthResponse.UserNotExist) && (
        <SettingsButton
          style={{ justifyContent: "center" }}
          textStyle={{ maxWidth: "90%" }}
          ButtonText={!isServerOnline ? "Re-Connect To Server" : "Go To The Settings"}
          onPress={() => console.log("first")}></SettingsButton>
      )}
    </View>
  );
};

enum AuthResponse {
  UserNotExist = -1,
  New_User = 0,
  Account_Disabled = 1,
  Wrong_Device = 2,
  Login_Succeed = 3,
  Unkown_Issue = 4,
}

async function GetServerContentAndStatus() {
  const serverStatus = await IsServerReachable();
  if (!serverStatus) return [serverStatus, []];
  const data = await getAllContent();
  return [serverStatus, data];
}

export default function HomeScreen({ navigation }: any) {
  const [getContent, setContent] = React.useState({});
  const [isServerOnline, setServerOnline] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [getAuthResponse, setAuthResponse] = React.useState(null);

  const [getCurrentConnection, setCurrentConnection] = React.useState({});

  React.useEffect(() => {
    (async () => {
      const currentConnection: IServerInfo = await GetData_AsyncStorage("currentConnection");
      //console.log(currentConnection);
      //const isAdmin = await checkAdminKey(currentConnection.AdminKey);
      //currentConnection.isAdmin = isAdmin;
      SetGlobalConnection(currentConnection);

      setAuthResponse(await ServerAuthentication());
      //console.log("ServerAuthentication:", await ServerAuthentication());

      const data = getAllContent();
      const serverStatus = IsServerReachable();

      Promise.all([serverStatus, data])
        .then(async (data) => {
          setServerOnline(data[0]);
          setContent(data[1]);
        })
        .catch((e) => {
          console.log("Error: HomeScreen Z.125");
        });
    })();
  }, []);

  if (!getCurrentConnection)
    return (
      <View style={{ ...styles.container, ...styles.CenterChildren }}>
        <Text
          style={{
            fontSize: WindowSize.Width * 0.07,
            color: "rgba(255,255,255,0.8)",
            marginBottom: "10%",
            maxWidth: "90%",
          }}>
          Set up a server connection
        </Text>
      </View>
    );
  else if (
    isServerOnline &&
    (getAuthResponse == AuthResponse.Login_Succeed || getAuthResponse == AuthResponse.New_User)
  ) {
    return (
      <View style={styles.container}>
        <TilteContainer></TilteContainer>
        <View style={styles.separator}></View>
        <View style={{ flex: 1 }}>
          <ContentContainer data={getContent} navigation={navigation}></ContentContainer>
        </View>
      </View>
    );
  } else {
    return (
      <ErrorContainer
        getAuthResponse={getAuthResponse}
        isServerOnline={isServerOnline}></ErrorContainer>
    );
  }
}

const styles = StyleSheet.create({
  FillContainer: {
    width: "100%",
    height: "100%",
  },
  CenterChildren: {
    alignItems: "center",
    justifyContent: "center",
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
