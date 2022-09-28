import { Alert, StyleSheet, Text, Vibration, View } from "react-native";
import React from "react";
import { BarCodeScanner } from "expo-barcode-scanner";

const QRCode_Scanner = ({ navigation }: any) => {
  const [hasPermission, setHasPermission] = React.useState<any>(null);
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    console.log("data", data);
    const JsonData = JSON.parse(data);
    navigation.navigate("ServerConnectionScreen", JsonData);

    //navigation.goBack();
    Vibration.vibrate();
  };
  //   if (hasPermission === null) {
  //     return Alert.alert(" Requesting for camera permission");
  //   }
  //   if (hasPermission === false) {
  //     return Alert.alert(" Requesting for camera permission");
  //   }
  return (
    <View style={{ backgroundColor: "black" }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ height: "100%", width: "100%" }}></BarCodeScanner>
    </View>
  );
};

export default QRCode_Scanner;

const styles = StyleSheet.create({});
