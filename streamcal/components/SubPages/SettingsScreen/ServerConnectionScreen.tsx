import { View, StyleSheet, Text, ScrollView, Alert } from "react-native";
import React from "react";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { backgroundColor } from "../../constants/Colors";
import { WindowSize } from "../../constants/Layout";
import { NormalTextInput } from "../../Designs/TextInput";
import SettingsButton from "../../Designs/SettingsButton";
import { GetData_AsyncStorage, StoreData_AsyncStorage } from "../../DataHandling";
import {
  checkAdminKey,
  currentConnectionInfo,
  IServerInfo,
  IsServerReachable,
  ServerAuthentication,
} from "../../../backend/serverConnection";
import LoadingIndicator from "../../Designs/LoadingIndicator";
import { Animation_Main } from "../../Designs/NotifyBox";

async function ConnectToServer(getServerInfo: any, onLoadStarted?: any, onLoadEnded?: any) {
  if (!getServerInfo) return;
  let currentConnection: IServerInfo = getServerInfo;
  currentConnectionInfo.Server = currentConnection.Server;
  currentConnectionInfo.Port = currentConnection.Port;
  //console.log(currentConnectionInfo);

  onLoadStarted && onLoadStarted();
  await StoreData_AsyncStorage("currentConnection", currentConnection);
  const serverStatus = await IsServerReachable();
  onLoadEnded && onLoadEnded();

  if (!serverStatus) {
    Alert.alert("Error", "Server is Offline");
    return;
  }

  if (currentConnection.AdminKey) {
    const isAdmin = await checkAdminKey(currentConnection.AdminKey);
    currentConnectionInfo.isAdmin = isAdmin;
  }
  const authResponse = await ServerAuthentication(currentConnection.APIKEY);
  console.log("ServerConnection AuthResponse:", authResponse);
  onLoadEnded && onLoadEnded();
}

const ServerConnectionScreen = ({ navigation, route }: any) => {
  const [isLoading, setIsLoading] = React.useState<any>(false);

  const [getServerInfo, setServerInfo] = React.useState<IServerInfo>({});
  const newServerConnection: IServerInfo = route.params || null;

  React.useEffect(() => {
    (async () => {
      console.log("Load ServerConnectionScreen");
      const Storage_currentConnection = await GetData_AsyncStorage("currentConnection");
      setServerInfo(newServerConnection || Storage_currentConnection || {});
    })();
  }, [newServerConnection]);

  return (
    <>
      <ScrollView
        style={{ height: WindowSize.Height, width: "100%", backgroundColor: backgroundColor }}
        contentContainerStyle={{ paddingBottom: WindowSize.Width * 0.1 }}>
        <>
          <NormalTextInput
            defaultValue={getServerInfo?.Server}
            onChangeText={(e: any) => setServerInfo({ ...getServerInfo, Server: e })}
            bodyStyle={{ ...styles.NormalTextInputStyle }}
            PlaceholderText={"Server Domain"}></NormalTextInput>
          <NormalTextInput
            defaultValue={getServerInfo?.Port}
            onChangeText={(e: any) => setServerInfo({ ...getServerInfo, Port: e })}
            bodyStyle={{ ...styles.NormalTextInputStyle }}
            PlaceholderText={"Port"}></NormalTextInput>
          <NormalTextInput
            defaultValue={getServerInfo?.APIKEY}
            onChangeText={(e: any) => setServerInfo({ ...getServerInfo, APIKEY: e })}
            bodyStyle={{ ...styles.NormalTextInputStyle }}
            PlaceholderText={"API-KEY"}></NormalTextInput>
          <SettingsButton
            IconFamily={MaterialCommunityIcons}
            IconName={"qrcode-scan"}
            ButtonText="Scan QR-Code"
            onPress={() => navigation.navigate("QRCode_ScannerScreen")}
            style={{
              marginLeft: WindowSize.Width * 0.05,
              marginTop: WindowSize.Width * 0.05,
            }}></SettingsButton>
          <Text
            style={{
              fontSize: WindowSize.Width * 0.04,
              color: "white",
              marginTop: WindowSize.Width * 0.05,
              marginLeft: WindowSize.Width * 0.05,

              textAlign: "left",
            }}>
            Use Your Admin-Key for Admin-Access
          </Text>
          <NormalTextInput
            bodyStyle={{ ...styles.NormalTextInputStyle, alignSelf: "center" }}
            defaultValue={getServerInfo.AdminKey}
            onChangeText={(e: any) => setServerInfo({ ...getServerInfo, AdminKey: e })}
            PlaceholderText={"Admin-KEY"}></NormalTextInput>

          <SettingsButton
            IconFamily={MaterialCommunityIcons}
            IconName={"connection"}
            ButtonText="Connect To Server"
            onPress={async () =>
              await ConnectToServer(
                getServerInfo,
                () => setIsLoading(true),
                () => {
                  setIsLoading(false);
                  navigation.navigate("Home", {});
                }
              )
            }
            style={{
              marginLeft: WindowSize.Width * 0.05,
              marginTop: WindowSize.Width * 0.05,
            }}></SettingsButton>
          <SettingsButton
            IconFamily={MaterialCommunityIcons}
            IconName={"history"}
            ButtonText="History"
            onPress={() => console.log("first")}
            style={{
              marginLeft: WindowSize.Width * 0.05,
              marginTop: WindowSize.Width * 0.05,
            }}></SettingsButton>
        </>
      </ScrollView>

      {isLoading && <LoadingIndicator></LoadingIndicator>}
    </>
  );
};

export default ServerConnectionScreen;

const styles = StyleSheet.create({
  NormalTextInputStyle: {
    marginTop: WindowSize.Width * 0.05,
    alignSelf: "center",
  },
});
