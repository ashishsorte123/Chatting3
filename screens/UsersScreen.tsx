import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Auth, DataStore } from "aws-amplify";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NewGroupButton from "../components/NewGroupButton";
import UserItem from "../components/UserItem";
import { ChatRoomUser } from "../src/models";
import { ChatRoom } from "../src/models";
import { User } from "../src/models";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const navigation = useNavigation();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    DataStore.query(User).then(setUsers);
  }, []);

  const addUserToChatRoom = async (user, chatRoom) => {
    DataStore.save(
      new ChatRoomUser({
        user,
        chatRoom,
      })
    );
  };

  const createChatRoom = async (users) => {
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);

    // create a chat room
    const newChatRoomData = { newMessages: 0, admin: dbUser };

    if (users.length > 1) {
      newChatRoomData.name = "New Group";
      newChatRoomData.imageUri =
        "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/group.jpeg";
    }

    const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));

    // connect authenticated user with the chat room

    if (dbUser) {
      await addUserToChatRoom(dbUser, newChatRoom);
    }

    // connect clicked user with the chat room
    await Promise.all(
      users.map((user) => addUserToChatRoom(user, newChatRoom))
    );

    navigation.navigate("ChatRoom", { id: newChatRoom.id });
  };

  const isUserSelected = (user) => {
    return selectedUsers.some((selectedUser) => selectedUser.id === user.id);
  };

  const onUserPress = async (user) => {
    if (isNewGroup) {
      if (isUserSelected(user)) {
        // remove it from selected
        setSelectedUsers(
          selectedUsers.filter((selectedUser) => selectedUser.id !== user.id)
        );
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      await createChatRoom([user]);
    }
  };

  const saveGroup = async () => {
    await createChatRoom(selectedUsers);
  };

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onPress={() => onUserPress(item)}
            isSelected={isNewGroup ? isUserSelected(item) : undefined}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <NewGroupButton onPress={() => setIsNewGroup(!isNewGroup)} />
        )}
      />

      {isNewGroup && (
        <Pressable style={styles.button} onPress={saveGroup}>
          <Text style={styles.buttonText}>
            Save Group({selectedUsers.length})
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },

  button: {
    backgroundColor: "#3777f0",
    marginHorizontal: 10,
    marginBottom: 20,
    padding: 10,
    alignItems: "center",
    borderRadius: 30,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
