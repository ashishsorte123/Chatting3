import { Auth } from "aws-amplify";
import React from "react";
import {
  FlatList,
  Image,
  LogBox,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import chatRoomsData from "../assets/dummy-data/ChatRooms";
import ChatRoomItem from "../components/ChatRoomItem";

export default function HomeScreen() {
  LogBox.ignoreAllLogs();

  const logout = () => {
    Auth.signOut();
  };
  return (
    <View style={styles.page}>
      <FlatList
        data={chatRoomsData}
        renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={logout}
        style={{
          backgroundColor: "#3777f0",
          height: 50,
          margin: 10,
          borderRadius: 25,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
