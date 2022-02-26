import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Message from "../components/Message";
import chatRoomData from "../assets/dummy-data/Chats";
import MessageInput from "../components/MessageInput";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Message as MessageModal } from "../src/models";
import { DataStore, SortDirection } from "aws-amplify";
import { ChatRoom } from "../src/models";

export default function ChatRoomScreen() {
  const [messages, setMessages] = useState<MessageModal[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    fetchChatRoom();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [chatRoom]);

  useEffect(() => {
    const subscription = DataStore.observe(MessageModal).subscribe((msg) => {
      // console.log(msg.model, msg.opType, msg.element);
      if (msg.model === MessageModal && msg.opType === "INSERT") {
        setMessages((existingMessage) => [msg.element, ...existingMessage]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchChatRoom = async () => {
    if (!route.params?.id) {
      console.warn("No chatroom id provided");
      return;
    }
    const chatRoom = await DataStore.query(ChatRoom, route.params.id);
    if (!chatRoom) {
      console.error("Couldn't find a chat room with this id");
    } else {
      setChatRoom(chatRoom);
    }
    console.log(chatRoom);
  };

  const fetchMessages = async () => {
    if (!chatRoom) {
      return;
    }
    const fetchedMessages = await DataStore.query(
      MessageModal,
      (message) => message.chatroomID("eq", chatRoom?.id),
      {
        sort: (message) => message.createdAt(SortDirection.DESCENDING),
      }
    );
    console.log(fetchedMessages);
    setMessages(fetchedMessages);
  };
  console.warn("Displaying chat room: ", route.params?.id);

  if (!chatRoom) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Message message={item} />}
        inverted
      />

      <MessageInput chatRoom={chatRoom} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
