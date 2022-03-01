import { Auth, DataStore } from "aws-amplify";
import React, { useEffect, useState } from "react";
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
import { ChatRoom, ChatRoomUser } from "../src/models";

export default function HomeScreen() {
  LogBox.ignoreAllLogs();

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      const userData = await Auth.currentAuthenticatedUser();
      const chatRooms = (await DataStore.query(ChatRoomUser))
        .filter(
          (chatRoomUser) => chatRoomUser.user.id === userData.attributes.sub
        )
        .map((chatRoomUser) => chatRoomUser.chatRoom);
      setChatRooms(chatRooms);
    };
    fetchChatRooms();
  }, []);

  const logout = async () => {
    // await DataStore.clear();
    Auth.signOut();
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={chatRooms}
        renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
        showsVerticalScrollIndicator={false}
      />

      
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
