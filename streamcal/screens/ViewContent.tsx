import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Octicons } from "@expo/vector-icons";

import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";
import { FlashList } from "@shopify/flash-list";
import MediaItemCard from "../components/Designs/MediaItemCard";
import FadingEdgesView from "../components/Designs/FadingEdgesView";

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
      <FadingEdgesView
        style={{ width: "100%", height: "100%" }}
        BottomGradient_Position={WindowSize.Width * 0.3}
        ParentBackgroundColor={backgroundColor}>
        <Image
          source={Cover2}
          resizeMethod="scale"
          style={{
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}></Image>
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
      </FadingEdgesView>
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

const data = [{ ID: 0, Title: "Testus_" }];

const ViewContent = ({ navigation }: any) => {
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
            <MediaItemCard
              ID_Path={item.ID + 1}
              Title={item.Title}
              navigation={navigation}
              CoverSrc={Cover2}></MediaItemCard>
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
    backgroundColor: backgroundColor,
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
});
