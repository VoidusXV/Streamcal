import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { WindowSize } from "../../constants/Layout";
import { NormalTextInput } from "../../Designs/TextInput";
import { IServerInfo, IUserInfo } from "../../constants/interfaces";
import { currentConnectionInfo } from "../../../backend/serverConnection";

const DataEdit_Container = ({ dataText, readOnly, onChangeText, PlaceholderText }: any) => {
  return (
    <View style={styles.DataEdit_Container}>
      <NormalTextInput
        PlaceholderText={PlaceholderText}
        readonly={readOnly}
        onChangeText={onChangeText}
        defaultValue={dataText}
      ></NormalTextInput>
    </View>
  );
};

const AddUserScreen = () => {
  const [getEditedUser, setEditedUser] = React.useState<IServerInfo>({
    Server: currentConnectionInfo?.Server,
    Port: currentConnectionInfo?.Port,
  });
  console.log(getEditedUser);
  return (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", paddingBottom: WindowSize.Width * 0.1 }}
    >
      <DataEdit_Container
        PlaceholderText={"Description"}
        onChangeText={(e: any) => setEditedUser({ ...getEditedUser, Description: e })}
        dataText={getEditedUser?.Description}
      ></DataEdit_Container>
      <DataEdit_Container
        PlaceholderText={"Server"}
        dataText={getEditedUser?.Server}
        readOnly
      ></DataEdit_Container>
      <DataEdit_Container
        PlaceholderText={"Port"}
        dataText={getEditedUser?.Port}
        readOnly
      ></DataEdit_Container>
      <DataEdit_Container
        PlaceholderText={"APIKEY"}
        onChangeText={(e: any) => setEditedUser({ ...getEditedUser, APIKEY: e })}
        dataText={getEditedUser?.APIKEY}
      ></DataEdit_Container>
    </ScrollView>
  );
};

export default AddUserScreen;

const styles = StyleSheet.create({
  DataEdit_Container: { marginTop: "3%" },
});
