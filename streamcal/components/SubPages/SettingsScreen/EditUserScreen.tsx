import {
  StyleSheet,
  Text,
  View,
  Switch,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { IUserInfo } from "../../constants/interfaces";
import { NormalTextInput } from "../../Designs/TextInput";
import { WindowSize } from "../../constants/Layout";
import SettingsButton from "../../Designs/SettingsButton";
import { backgroundColor, selectionColor } from "../../constants/Colors";
import { currentConnectionInfo, Server_SetUsers } from "../../../backend/serverConnection";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

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

const QRCode_ModalContainer = ({ onClose, APIKEY }: any) => {
  const QRCode_Ref = React.useRef<any>(null);

  const ScanObject = {
    APIKEY: APIKEY,
    Server: currentConnectionInfo.Server,
    Port: currentConnectionInfo.Port,
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.QRCode_ModalContainer}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: backgroundColor,
            width: WindowSize.Width * 0.95,
            height: "60%",
            borderRadius: WindowSize.Width * 0.02,
            alignItems: "center",
          }}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
            }}>
            <Text
              style={{
                //position: "absolute",
                color: "white",
                fontSize: WindowSize.Width * 0.06,
                marginLeft: "45%",
                marginTop: "3%",
                marginBottom: "5%",
              }}>
              yeet
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "white",
              height: "70%",
              width: "80%",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: WindowSize.Width * 0.02,
            }}>
            <QRCode
              getRef={(e) => (QRCode_Ref.current = e)}
              size={WindowSize.Width * 0.7}
              value={JSON.stringify(ScanObject)}></QRCode>
          </View>
          <MaterialCommunityIcons
            onPress={() => {
              QRCode_Ref.current?.toDataURL(async (e: any) => await Clipboard.setImageAsync(e));
              console.log("Testwtst");
            }}
            name="content-copy"
            size={WindowSize.Width * 0.08}
            color="white"
            style={{ marginLeft: "70%", marginTop: "5%" }}></MaterialCommunityIcons>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

interface IEditUserScreen {
  navigation?: NativeStackNavigationProp<any>;
  route?: RouteProp<any>;
}
const EditUserScreen = ({ navigation, route }: IEditUserScreen) => {
  const currentUser: IUserInfo = route?.params?.item;
  const [getEditedUser, setEditedUser] = React.useState<IUserInfo>(currentUser);
  const [getQR_Modal, setQR_Modal] = React.useState<boolean>(false);

  React.useEffect(() => {
    navigation?.setOptions({ headerTitle: currentUser.Description });
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", paddingBottom: WindowSize.Width * 0.1 }}>
      <DataEdit_Container
        Key={"User Description"}
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
        Key={"DeviceID"}
        dataText={currentUser.DeviceID}></DataEdit_Container>
      <DataEdit_Container
        readOnly
        Key={"Registration Date"}
        dataText={currentUser.FirstLogin}></DataEdit_Container>
      <DataEdit_Container
        readOnly
        Key={"Last Login Date"}
        dataText={currentUser.LastLogin}></DataEdit_Container>
      <SettingsButton
        onPress={() => setQR_Modal(true)}
        IconFamily={MaterialCommunityIcons}
        IconName={"qrcode-scan"}
        style={{
          marginTop: "5%",
          marginBottom: "5%",
          justifyContent: "center",
          paddingRight: "12%",
        }}
        ButtonText={"Show QR-Code"}></SettingsButton>
      <SettingsButton
        onPress={async () => {
          await Server_SetUsers([currentUser.APIKEY], "change", getEditedUser);
          navigation?.navigate("Settings_DefaultScreen");
        }}
        //onPress={() => console.log(getEditedUser)}
        style={{ marginTop: "5%", justifyContent: "center" }}
        ButtonText={"Apply Changes"}></SettingsButton>

      <Modal
        transparent
        animationType="slide"
        visible={getQR_Modal}
        onRequestClose={() => setQR_Modal(false)}>
        <QRCode_ModalContainer
          onClose={() => setQR_Modal(false)}
          APIKEY={getEditedUser.APIKEY}></QRCode_ModalContainer>
      </Modal>
    </ScrollView>
  );
};

export default EditUserScreen;

const styles = StyleSheet.create({
  DataEdit_Container: { marginTop: "3%" },
  QRCode_ModalContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
