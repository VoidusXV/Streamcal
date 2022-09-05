import { StyleSheet, Text, View, Image, ScrollView, MaskedViewComponent } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Octicons } from "@expo/vector-icons";

import { backgroundColor, selectionColor } from "../constants/Colors";
import { WindowSize } from "../constants/Layout";
import Seperator from "../Designs/Seperator";
import { FlashList } from "@shopify/flash-list";

const Cover2 = require("../assets/covers/One_Piece.jpg");

const ImageContainer = ({ ContentTitle }: any) => {
  const [getTextHeight, setTextHeight] = React.useState<any>(0);
  return (
    <View
      style={{
        width: "100%",
        height: WindowSize.Height * 0.7,
        position: "absolute",
      }}>
      <LinearGradient
        start={{ x: 0, y: 0.1 }}
        end={{ x: 0, y: 1 }}
        colors={["rgb(16, 23, 36)", "rgba(16, 23, 36, 0)"]}
        style={{ height: "5%", width: "100%", position: "absolute", zIndex: 1 }}></LinearGradient>
      <Image
        source={Cover2}
        resizeMethod="scale"
        style={{ width: "100%", height: "100%", marginTop: "0%", zIndex: 0 }}
        resizeMode="cover"></Image>
      <Text
        onLayout={(e) => setTextHeight(e.nativeEvent.layout.height)}
        style={{
          color: "white",
          fontWeight: "500",
          position: "absolute",
          fontSize: WindowSize.Width * 0.07,
          zIndex: 3,
          marginTop: WindowSize.Width * 0.85 - (getTextHeight - WindowSize.Width * 0.1), //"85%",
          marginLeft: "5%",
          maxWidth: "90%",
        }}>
        {ContentTitle}
      </Text>
      <LinearGradient
        colors={["rgb(16, 23, 36)", "rgba(16, 23, 36, 0)"]}
        start={{ x: 1, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          height: "25%",
          width: "100%",
          position: "absolute",
          zIndex: 1,
          marginTop: "70%",
        }}></LinearGradient>
    </View>
  );
};

const ContentInfo = () => (
  <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
    <Text style={styles.InfoText}>&#9679; Serie</Text>
    <Text style={styles.InfoText}>&#9679; 2 Staffel</Text>
    <Text style={styles.InfoText}>&#9679; 10 Folgen</Text>
  </View>
);

const SelectionBox = () => (
  <>
    <View style={styles.SelectionBox}>
      <Text
        style={{
          fontSize: WindowSize.Width * 0.05,
          color: "white",
          textAlign: "center",
          letterSpacing: 2,
        }}>
        FOLGEN
      </Text>
    </View>
  </>
);
const Season_SelectionBox = ({ TitleText }: any) => {
  return (
    <View style={styles.Season_SelectionBox}>
      <View style={{ width: "20%", ...styles.ContainerMiddle }}>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={WindowSize.Width * 0.09}
          color="white"></MaterialIcons>
      </View>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            color: "white",
            fontSize: WindowSize.Width * 0.06,
          }}>
          {TitleText}
        </Text>
      </View>
    </View>
  );
};

const ContentItem = ({ ID, Title }: any) => {
  return (
    <View style={styles.ContentItem_Container}>
      <View style={{ backgroundColor: "green", width: "45%", ...styles.ContainerMiddle }}>
        <Image source={Cover2} resizeMode="cover" style={{ width: "100%", height: "100%" }}></Image>
        <Octicons
          name="play"
          size={WindowSize.Width * 0.15}
          color="white"
          style={{ position: "absolute" }}></Octicons>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={2}
          style={{
            marginLeft: "5%",
            marginTop: "3%",
            maxWidth: "90%",
            color: "white",
            fontSize: WindowSize.Width * 0.04,
          }}>
          <Text style={{ fontWeight: "bold" }}>{ID}. </Text>
          <Text>{Title}</Text>
        </Text>

        <View
          style={{
            height: "30%",
            // justifyContent: "space-around",
            alignItems: "center",
            flexDirection: "row",
            marginTop: "auto",
          }}>
          <Text
            style={{
              color: "white",
              fontSize: WindowSize.Width * 0.04,
              marginLeft: "5%",
            }}>
            24 Min
          </Text>
          <Octicons
            name="download"
            size={WindowSize.Width * 0.07}
            style={{ marginLeft: "auto", marginRight: "7%" }}
            color="white"></Octicons>
        </View>
      </View>
    </View>
  );
};

const data = [
  { ID: 0, Title: "Testus_" },
  { ID: 1, Title: "Testus_" },
  { ID: 2, Title: "Testus_" },
  { ID: 3, Title: "Testus_" },
  { ID: 4, Title: "Testus_" },
  { ID: 5, Title: "Testus_" },
  { ID: 6, Title: "Testus_" },
  { ID: 7, Title: "Testus_" },
  { ID: 8, Title: "Testus_" },
  { ID: 9, Title: "Testus_" },
  { ID: 10, Title: "Testus_" },
];

const ViewContent = () => {
  return (
    <ScrollView style={styles.container}>
      <ImageContainer ContentTitle="One Piece"></ImageContainer>
      <View style={styles.ContentContainer}>
        <ContentInfo></ContentInfo>
        <SelectionBox></SelectionBox>
        <Season_SelectionBox TitleText="Staffel 1"></Season_SelectionBox>

        <FlashList
          data={data}
          keyExtractor={(item: any) => item.ID}
          estimatedItemSize={20}
          contentContainerStyle={{ paddingBottom: WindowSize.Width * 0.1 }}
          renderItem={({ item }) => (
            <ContentItem ID={item.ID + 1} Title={item.Title}></ContentItem>
          )}></FlashList>
      </View>
    </ScrollView>
  );
};

export default ViewContent;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    //backgroundColor: "blue",
  },
  ContainerMiddle: { justifyContent: "center", alignItems: "center" },
  InfoText: {
    color: "#e0ebff",
    fontSize: WindowSize.Width * 0.05,
    marginRight: "3%",
    marginTop: "5%",
  },
  ContentContainer: {
    width: "100%",
    minHeight: WindowSize.Width * 0.97,
    //height: WindowSize.Height * 0.8,
    marginTop: WindowSize.Width * 1.05,
    backgroundColor: backgroundColor,
    //flexDirection: "row",
  },
  SelectionBox: {
    width: "100%",
    height: WindowSize.Width * 0.13,
    backgroundColor: "#22314d",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "white",
  },
  Season_SelectionBox: {
    width: "100%",
    height: WindowSize.Width * 0.13,
    //borderRadius: 5,
    backgroundColor: "#22314d",
    marginTop: "4%",
    alignSelf: "center",
    flexDirection: "row",
  },
  ContentItem_Container: {
    width: "100%",
    height: WindowSize.Height * 0.14,
    marginTop: "4%",
    backgroundColor: "#22314d",
    alignSelf: "center",
    flexDirection: "row",
  },
});
