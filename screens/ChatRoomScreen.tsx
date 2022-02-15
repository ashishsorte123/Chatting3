import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import React from "react";
import Message from "../components/Message";
import chatRoomData from "../assets/dummy-data/Chats";
import MessageInput from "../components/MessageInput";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function ChatRoomScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  console.warn("Displaying chat room: ", route.params?.id);

  navigation.setOptions({ title: "Elon Musk" });
  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={chatRoomData.messages}
        renderItem={({ item }) => <Message message={item} />}
        inverted
      />

      <MessageInput />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
