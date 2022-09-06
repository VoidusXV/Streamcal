import { View, StyleSheet, Image } from "react-native";
import { backgroundColor } from "../components/constants/Colors";
import FadingEdgesView from "../components/Designs/FadingEdgesView";
const Cover2 = require("../assets/covers/One_Piece.jpg");

export default function ListScreen() {
  return (
    <View style={styles.container}>
      <FadingEdgesView style={{ width: "100%", height: "90%" }} ParentBackgroundColor={"red"}>
        <Image
          source={Cover2}
          resizeMethod="scale"
          style={{
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        ></Image>
      </FadingEdgesView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: "center",
    //justifyContent: "center",
    backgroundColor: backgroundColor,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});