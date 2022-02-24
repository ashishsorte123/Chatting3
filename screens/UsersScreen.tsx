import { DataStore } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import Users from "../assets/dummy-data/Users";
import UserItem from "../components/UserItem";
import { User } from "../src/models";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    DataStore.query(User).then(setUsers);
  }, []);
  return (
    <View style={styles.page}>
      <FlatList
        data={users}
        renderItem={({ item }) => <UserItem user={item} />}
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
