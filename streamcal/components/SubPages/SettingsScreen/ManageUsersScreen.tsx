import { Animated, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";

import React from "react";
import {
  checkAdminKey,
  currentConnectionInfo,
  getAllUsers,
  Server_SetUsers,
} from "../../../backend/serverConnection";
import SettingsButton from "../../Designs/SettingsButton";
import { Animation_Main } from "../../Designs/NotifyBox";
import { WindowSize } from "../../constants/Layout";
import { selectionColor } from "../../constants/Colors";
import { FlashList } from "@shopify/flash-list";
import { IUserInfo } from "../../constants/interfaces";
import { RouteProp } from "@react-navigation/native";

interface IManageUsersScreen {
  navigation?: any; //NativeStackScreenProps<any,any>;
  setMessageText?: any;
  route?: RouteProp<any>;
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
      return;
    }
    navigation?.navigate("EditUserScreen", { item: item });
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
  onAddUser,
}: IEditingButtons) => {
  const [isAllSelected, setAllSected] = React.useState(true);

  function RightButtons() {
    setManaging(!isManaging);
    if (!isManaging) onManage && onManage();
    if (isManaging) onCancel && onCancel(setAllSected(true));
  }
  function LeftButtons() {
    if (!isManaging) onAddUser && onAddUser();
    if (isManaging) onSelectAll && onSelectAll(setAllSected(!isAllSelected));
    if (!isAllSelected) onUnSelectAll && onUnSelectAll(setAllSected(!isAllSelected));
  }

  return (
    <View style={{ flexDirection: "row", height: "5%", justifyContent: "space-between" }}>
      <TouchableOpacity style={{ width: "40%" }} onPress={LeftButtons} activeOpacity={0.6}>
        <Text style={{ ...styles.ManageTextStyle, marginLeft: "15%" }}>
          {!isManaging ? "ADD USER" : !isAllSelected ? "UNSELECT ALL" : "SELECT ALL"}
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
  console.log(data.length);
  data.map((e: any, index: any) => {
    data[index] = state;
  });
  setUserSelections(data);
}

function getSelectedUsersAmount(getUserSelections: any) {
  let count = 0;
  getUserSelections.map((e: any) => e && count++);
  return count;
}

function getSelectedAPIKEYS(getUserSelections: any, getUserData: Array<IUserInfo>) {
  let APIKEY: any = [];
  getUserSelections?.map((e: any, index: any) => {
    if (e) APIKEY.push(getUserData[index].APIKEY);
  });
  return APIKEY;
}

function removeAdminFromArray(UserData: Array<IUserInfo>) {
  UserData?.map((e, index) => {
    if (e?.APIKEY == currentConnectionInfo?.APIKEY)
      // && currentConnectionInfo.isAdmin
      UserData?.splice(index, 1);
  });
}

async function onPressRemove(
  setUserData: any,
  getUserData: any,
  setUserSelections: any,
  getUserSelections: any,
  setManaging: any
) {
  try {
    if (getSelectedUsersAmount(getUserSelections) <= 0) return;

    console.log("remove");
    await Server_SetUsers(getSelectedAPIKEYS(getUserSelections, getUserData), "delete");
    UnMarkedArray(getUserSelections, setUserSelections);

    let UserData = await getAllUsers(currentConnectionInfo.AdminKey);
    removeAdminFromArray(UserData);
    setUserData(UserData);
  } catch (error: any) {
    console.log(error.message);
  } finally {
    setManaging(false);
  }
}

interface IFlashlist {
  item?: IUserInfo;
  index?: any;
  target?: any;
  extraData?: any;
}
const ManageUsersScreen = ({ navigation, route }: IManageUsersScreen) => {
  const [getUserData, setUserData] = React.useState<Array<IUserInfo>>([]);
  const [isManaging, setManaging] = React.useState(false);
  const [getUserSelections, setUserSelections] = React.useState([]);

  //route.params?.setMessageText("");

  //console.log("first");

  // console.log("isAdmin:", currentConnectionInfo.isAdmin);
  // if (!currentConnectionInfo.isAdmin) {
  //   navigation?.goBack();
  // }
  React.useEffect(() => {
    (async () => {
      if (!currentConnectionInfo.isAdmin) {
        //route?.params?.setMessageText("You're not Admin");
        //Animation_Main();
        navigation?.goBack();
        return;
      }
      await getAllUsers(currentConnectionInfo.AdminKey)
        .then((UserData: Array<IUserInfo>) => {
          removeAdminFromArray(UserData);
          setUserData(UserData);

          let UserSelectionData: any = [];
          UserData?.map(() => UserSelectionData.push(false));
          setUserSelections(UserSelectionData);
        })
        .catch((error: any) => console.log("ManageUsersScreen UseEffect:", error.message));
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <EditingButtons
        isManaging={isManaging}
        setManaging={setManaging}
        onCancel={() => UnMarkedArray(getUserSelections, setUserSelections)}
        onSelectAll={() => UnMarkedArray(getUserSelections, setUserSelections, true)}
        onUnSelectAll={() => UnMarkedArray(getUserSelections, setUserSelections)}
        onAddUser={() => navigation.navigate("AddUserScreen")}></EditingButtons>
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
            {getSelectedUsersAmount(getUserSelections)} Selected Users
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={async () =>
              await onPressRemove(
                setUserData,
                getUserData,
                setUserSelections,
                getUserSelections,
                setManaging
              )
            }>
            <Text
              style={{
                ...styles.ManageTextStyle,
                fontSize: WindowSize.Width * 0.045,
                marginLeft: "5%",
                color: "red",
              }}>
              Remove
            </Text>
          </TouchableOpacity>
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
