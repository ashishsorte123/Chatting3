import { View, Text, useWindowDimensions, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, ChatRoomUser, User } from "../src/models";
import moment from "moment";

const ChatRoomHeader = ({ id, children }) => {
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<User | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const fetchedUsers = (await DataStore.query(ChatRoomUser))
      .filter((chatRoomUser) => chatRoomUser.chatRoom.id === id)
      .map((chatroomUser) => chatroomUser.user);
    setAllUsers(fetchedUsers);
    const authUser = await Auth.currentAuthenticatedUser();
    setUser(
      fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
    );
  };

  const fetchChatRoom = async () => {
    DataStore.query(ChatRoom, id).then(setChatRoom);
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchUsers();
    fetchChatRoom();
  }, []);

  const getLastOnlineText = () => {
    if (!user?.lastOnlineAt) {
      return null;
    }

    // if lastOnlineAt is less than 5 minutes ago, show him as online
    const lastOnlineDiffMS = moment().diff(moment(user.lastOnlineAt));
    if (lastOnlineDiffMS < 5 * 60 * 1000) {
      // less than 5 minutes
      return "Online";
    } else {
      return `Last seen online
${moment(user.lastOnlineAt).fromNow()}`;
    }
  };

  const getUsernames = () => {
    return allUsers.map((user) => user.name).join(", ");
  };

  const isGroup = allUsers.length > 2;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: width - 40,
        marginLeft: -30,
        padding: 5,
        alignItems: "center",
      }}
    >
      <Image
        source={{
          uri: chatRoom?.imageUri || user?.imageUri,
        }}
        style={{ width: 40, height: 40, borderRadius: 25, marginBottom: 10 }}
      />
      <View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            marginLeft: 15,
            marginBottom: 5,
          }}
        >
          {chatRoom?.name || user?.name}
        </Text>

        <Text style={{ fontSize: 12, marginLeft: 15 }}>
          {isGroup ? getUsernames() : getLastOnlineText()}
        </Text>
      </View>
      <Feather
        name="camera"
        size={24}
        color="black"
        style={{ marginHorizontal: 10, marginLeft: 50 }}
      />
      <Feather
        name="edit-2"
        size={24}
        color="black"
        style={{ marginHorizontal: 10 }}
      />
    </View>
  );
};

export default ChatRoomHeader;
