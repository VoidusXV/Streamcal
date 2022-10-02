import { StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";

import React from "react";
import { checkAdminKey, currentConnectionInfo } from "../../../backend/serverConnection";
import SettingsButton from "../../Designs/SettingsButton";
import { Animation_Main } from "../../Designs/NotifyBox";

async function AdminAuth() {
  const adminNotPossible =
    currentConnectionInfo.isAdmin == null || currentConnectionInfo.isAdmin == undefined;

  if (!currentConnectionInfo?.AdminKey || adminNotPossible) {
    return false;
  }

  const isAdmin = await checkAdminKey(currentConnectionInfo?.AdminKey);
  currentConnectionInfo.isAdmin = isAdmin;
  return isAdmin;
}

interface IManagerUsersScreen {
  navigation?: any; //NativeStackScreenProps<any,any>;
  MessageText?: any;
}
const ManagerUsersScreen = ({ navigation, MessageText }: IManagerUsersScreen) => {
  const [getUserData, setUserData] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const isAdmin = await AdminAuth();
      if (!isAdmin) {
        MessageText("You're not Admin");
        Animation_Main();
        navigation.navigate("Settings_DefaultScreen");
        return;
      }
    })();
  }, []);
  return (
    <View>
      <Text>ManagerUsersScreen</Text>
      <SettingsButton onPress={() => {}}></SettingsButton>
    </View>
  );
};

export default ManagerUsersScreen;

const styles = StyleSheet.create({});
