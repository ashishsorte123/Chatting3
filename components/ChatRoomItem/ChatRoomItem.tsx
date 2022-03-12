import { View, Text, Image, Pressable, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { Message, User } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoomUser } from "../../src/models";
import moment from "moment";

export default function ChatRoomItem({ chatRoom }) {
  const [user, setUser] = useState<User | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoom.id === chatRoom.id)
        .map((chatroomUser) => chatroomUser.user);

      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
      );
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!chatRoom.chatRoomLastMessageId) {
      return;
    }
    DataStore.query(Message, chatRoom.chatRoomLastMessageId).then(
      setLastMessage
    );
  }, []);

  const onPress = () => {
    navigation.navigate("ChatRoom", { id: chatRoom.id });
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  const time = moment(lastMessage?.createdAt).from(moment());

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        source={{
          uri: chatRoom.imageUri || user?.imageUri,
        }}
        style={styles.image}
      />

      {!!chatRoom.newMessages && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
        </View>
      )}

      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{chatRoom.name || user?.name}</Text>
          <Text style={styles.text}>{time}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {lastMessage?.content}
        </Text>
      </View>
    </Pressable>
  );
}
