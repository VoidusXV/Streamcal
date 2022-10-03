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
  isManaging?: any;
  getUserSelections?: any;
  setUserSelections?: any;
}
const UserCard = ({
  item,
  index,
  navigation,
  isManaging,
  getUserSelections,
  setUserSelections,
}: IUserCard) => {
  const isSelected = getUserSelections[index];

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
    let data = [];
    if (isManaging) {
      data = [...getUserSelections];
      data[index] = !data[index];
      setUserSelections(data);
    }

    //console.log("User:", index);
    //navigation?.navigate("EditUserScreen");
    //navigation?.canGoBack();
  };

  //console.log("isManaging:", isManaging);
  //console.log("isSelected:", isSelected, index);

  return (
    <Animated.View
      style={{
        ...styles.UserCard_Container,
        backgroundColor: !isSelected ? selectionColor : "#436199",
        paddingTop: "2%",
        paddingBottom: "2%",
        paddingLeft: "5%",
        transform: [{ scale }],
      }}>
      <TouchableOpacity
        //style={{ transform: [{ rotateY: "180deg" }, { translateX: 20 }] }}
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        <Text
          style={{
            color: "white",
            fontWeight: "500",
            fontSize: WindowSize.Width * 0.045,
            maxWidth: "90%",

            //textDecorationLine: "underline",
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

interface IEditingButtons {
  setManaging?: any;
  isManaging?: any;
  onManage?: any;
  onCancel?: any;
  onAddUser?: any;
  onSelectAll?: any;
  onUnSelectAll?: any;
}
const EditingButtons = ({
  isManaging,
  setManaging,
  onManage,
  onCancel,
  onSelectAll,
  onUnSelectAll,
}: IEditingButtons) => {
  const [isAllSelected, setAllSected] = React.useState(true);

  function RightButtons() {
    setManaging(!isManaging);
    if (!isManaging) onManage && onManage();
    if (isManaging) onCancel && onCancel();
  }
  function LeftButtons() {
    if (isManaging) onSelectAll && onSelectAll(setAllSected(!isAllSelected));
    if (isAllSelected) onUnSelectAll && onUnSelectAll(setAllSected(!isAllSelected));
  }

  console.log(isAllSelected);
  return (
    <View style={{ flexDirection: "row", height: "5%", justifyContent: "space-between" }}>
      <TouchableOpacity style={{ width: "40%" }} onPress={LeftButtons} activeOpacity={0.6}>
        <Text style={{ ...styles.ManageTextStyle, marginLeft: "15%" }}>
          {!isManaging ? "ADD USER" : !isAllSelected ? "SELECT ALL" : "UNSELECT ALL"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: "40%",
          alignItems: "center",
        }}
        onPress={RightButtons}
        activeOpacity={0.6}>
        <Text style={styles.ManageTextStyle}>{!isManaging ? "MANAGE" : "CANCEL"}</Text>
      </TouchableOpacity>
    </View>
  );
};

function UnMarkedArray(getUserSelections: any, setUserSelections: any, state = false) {
  let data = [...getUserSelections];
  data.map((e: any, index: any) => {
    data[index] = state;
  });
  setUserSelections(data);
}

function getMarkedCardAmount(getUserSelections: any) {
  let count = 0;
  getUserSelections.map((e: any) => e && count++);
  return count;
}
interface IFlashlist {
  item?: IUserInfo;
  index?: any;
  target?: any;
  extraData?: any;
}
const ManageUsersScreen = ({ navigation, MessageText }: IManageUsersScreen) => {
  const [getUserData, setUserData] = React.useState<any>([]);
  const [isManaging, setManaging] = React.useState(false);
  const [getUserSelections, setUserSelections] = React.useState([false, false]);

  //console.log("first");
  React.useEffect(() => {
    (async () => {
      const UserData = await getAllUsers(currentConnectionInfo.AdminKey);
      setUserData(UserData);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <EditingButtons
        isManaging={isManaging}
        setManaging={setManaging}
        onCancel={() => UnMarkedArray(getUserSelections, setUserSelections)}
        onSelectAll={() => UnMarkedArray(getUserSelections, setUserSelections, true)}
        onUnSelectAll={() => UnMarkedArray(getUserSelections, setUserSelections)}></EditingButtons>
      <FlashList
        estimatedItemSize={10}
        data={getUserData}
        extraData={{ isManaging, getUserSelections, setUserSelections }}
        refreshing={true}
        renderItem={({ item, index, extraData }: IFlashlist) => (
          <UserCard
            item={item}
            index={index}
            navigation={navigation}
            isManaging={extraData.isManaging}
            getUserSelections={extraData.getUserSelections}
            setUserSelections={extraData.setUserSelections}></UserCard>
        )}></FlashList>

      {isManaging && (
        <View
          style={{
            backgroundColor: selectionColor,
            width: "100%",
            height: WindowSize.Height * 0.1,
            position: "absolute",
            marginTop: WindowSize.Height * 0.82,
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            padding: "5%",
          }}>
          <Text
            style={{
              ...styles.ManageTextStyle,
              fontSize: WindowSize.Width * 0.045,
            }}>
            {getMarkedCardAmount(getUserSelections)} Selected Users
          </Text>
          <Text
            style={{
              ...styles.ManageTextStyle,
              fontSize: WindowSize.Width * 0.045,
              marginLeft: "5%",
              color: "red",
            }}>
            Remove
          </Text>
        </View>
      )}
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
  ManageTextStyle: {
    color: "white",
    fontSize: WindowSize.Width * 0.04,
    //textAlign: "right",
    //marginRight: "7%",
    //marginTop: "5%",
    fontWeight: "500",
  },
});
