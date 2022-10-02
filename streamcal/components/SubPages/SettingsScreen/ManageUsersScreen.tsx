import { Animated, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";

import React from "react";
import {
  checkAdminKey,
  currentConnectionInfo,
  getAllUsers,
} from "../../../backend/serverConnection";
import SettingsButton from "../../Designs/SettingsButton";
import { Animation_Main } from "../../Designs/NotifyBox";
import { WindowSize } from "../../constants/Layout";
import { selectionColor } from "../../constants/Colors";
import { FlashList } from "@shopify/flash-list";

interface IManageUsersScreen {
  navigation?: any; //NativeStackScreenProps<any,any>;
  MessageText?: any;
}

interface IUserInfo {
  APIKEY: any;
  Enabled: any;
  FirstLogin: any;
  LastLogin: any;
  History: any;
  DeviceID: any;
  Description: any;
}

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

interface IUserCard {
  item?: IUserInfo;
  index: any;
  navigation?: NativeStackNavigationProp<any>;
}
const UserCard = ({ item, index, navigation }: IUserCard) => {
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
    console.log("User:", index);
    navigation?.navigate("EditUserScreen");
    //navigation?.canGoBack();
  };

  return (
    <Animated.View
      style={{
        ...styles.UserCard_Container,
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
          {item?.Description}
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: WindowSize.Width * 0.045,
            maxWidth: "90%",
          }}>
          {item?.APIKEY}
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: WindowSize.Width * 0.045,
            maxWidth: "90%",
          }}>
          {item?.LastLogin}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ManageUsersScreen = ({ navigation, MessageText }: IManageUsersScreen) => {
  const [getUserData, setUserData] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const UserData = await getAllUsers(currentConnectionInfo.AdminKey);
      setUserData(UserData);
    })();
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <FlashList
        estimatedItemSize={10}
        data={getUserData}
        renderItem={({ item, index }: { item: IUserInfo; index: any }) => (
          <UserCard item={item} index={index} navigation={navigation}></UserCard>
        )}></FlashList>
    </View>
  );
};

export default ManageUsersScreen;

const styles = StyleSheet.create({
  UserCard_Container: {
    width: "90%",
    backgroundColor: selectionColor,
    alignSelf: "center",
    marginTop: "5%",
    borderRadius: WindowSize.Width * 0.02,
  },
});
