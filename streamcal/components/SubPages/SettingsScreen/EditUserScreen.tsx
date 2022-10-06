import { StyleSheet, Text, View, Switch } from "react-native";
import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { IUserInfo } from "../../constants/interfaces";
import { NormalTextInput } from "../../Designs/TextInput";
import { WindowSize } from "../../constants/Layout";
import SettingsButton from "../../Designs/SettingsButton";
import { selectionColor } from "../../constants/Colors";
import { Server_SetUsers } from "../../../backend/serverConnection";

const DataEdit_Container = ({ Key, dataText, readOnly, onChangeText }: any) => {
  return (
    <View style={styles.DataEdit_Container}>
      <Text style={{ color: "white", fontSize: WindowSize.Width * 0.05, marginBottom: "3%" }}>
        {Key}:
      </Text>
      <NormalTextInput
        readonly={readOnly}
        onChangeText={onChangeText}
        defaultValue={dataText}></NormalTextInput>
    </View>
  );
};

const SwitchContainer = ({ onValueChange, value }: any) => {
  return (
    <View
      style={{
        flexDirection: "row",
        width: "100%",
        marginTop: "5%",
        marginBottom: "2%",
        alignItems: "center",
      }}>
      <Text style={{ color: "white", fontSize: WindowSize.Width * 0.05, marginLeft: "5%" }}>
        Access:
      </Text>
      <Switch
        onValueChange={onValueChange}
        value={value}
        style={{ marginLeft: "auto", marginRight: "5%", borderColor: "white" }}
        // trackColor={{ false: selectionColor }}
      ></Switch>
    </View>
  );
};
interface IEditUserScreen {
  navigation?: NativeStackNavigationProp<any>;
  route?: RouteProp<any>;
}
const EditUserScreen = ({ navigation, route }: IEditUserScreen) => {
  const currentUser: IUserInfo = route?.params?.item;
  //const [getAccess, setAccess] = React.useState(currentUser.Enabled);
  const [getEditedUser, setEditedUser] = React.useState<IUserInfo>(currentUser);

  React.useEffect(() => {
    navigation?.setOptions({ headerTitle: currentUser.Description });
  }, []);

  return (
    <View style={{ alignItems: "center" }}>
      <DataEdit_Container
        Key={"Description"}
        onChangeText={(e: any) => setEditedUser({ ...getEditedUser, Description: e })}
        dataText={getEditedUser.Description}></DataEdit_Container>
      <DataEdit_Container
        Key={"APIKEY"}
        onChangeText={(e: any) => setEditedUser({ ...getEditedUser, APIKEY: e })}
        dataText={getEditedUser.APIKEY}></DataEdit_Container>
      <SwitchContainer
        value={getEditedUser.Enabled}
        onValueChange={(e: any) =>
          setEditedUser({ ...getEditedUser, Enabled: e })
        }></SwitchContainer>
      <DataEdit_Container
        readOnly
        Key={"Registration Date"}
        dataText={currentUser.FirstLogin}></DataEdit_Container>
      <DataEdit_Container
        readOnly
        Key={"Last Login Date"}
        dataText={currentUser.LastLogin}></DataEdit_Container>
      <SettingsButton
        onPress={async () => await Server_SetUsers([currentUser.APIKEY], "change", getEditedUser)}
        //onPress={() => console.log(getEditedUser)}
        style={{ marginTop: "5%", justifyContent: "center" }}
        ButtonText={"Apply Changes"}></SettingsButton>
    </View>
  );
};

export default EditUserScreen;

const styles = StyleSheet.create({
  DataEdit_Container: { marginTop: "3%" },
});
