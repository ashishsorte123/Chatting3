import { View, Text, Pressable, Alert } from "react-native";
import React from "react";
import { Auth, DataStore } from "aws-amplify";
import { generateKeyPair } from "../utils/crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User as UserModal } from "../src/models";

export const PRIVATE_KEY = "PRIVATE_KEY";

const SettingsScreen = () => {
  const logout = async () => {
    // await DataStore.clear();
    Auth.signOut();
  };

  const updateKeyPair = async () => {
    //   generate private/public key
    const { publicKey, secretKey } = generateKeyPair();
    console.log(publicKey, secretKey);

    // save private key to Async Storage
    await AsyncStorage.setItem(PRIVATE_KEY, secretKey.toString());
    console.log("secret key was saved");

    // save public key to UserModal in DataStore
    const userData = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(UserModal, userData.attributes.sub);

    if (!dbUser) {
      Alert.alert("User not found");
      return;
    }

    await DataStore.save(
      UserModal.copyOf(dbUser, (updated) => {
        updated.publicKey = publicKey.toString();
      })
    );
    console.log(dbUser);

    Alert.alert("Successfully updated the keypair.");
  };

  return (
    <View>
      {/* <Text>Settings</Text> */}

      <Pressable
        onPress={updateKeyPair}
        style={{
          backgroundColor: "#3777f0",
          height: 50,
          margin: 10,
          borderRadius: 25,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 200,
        }}
      >
        <Text style={{ color: "white" }}>Update keypair</Text>
      </Pressable>

      <Pressable
        onPress={logout}
        style={{
          backgroundColor: "#3777f0",
          height: 50,
          margin: 10,
          borderRadius: 25,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 50,
        }}
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default SettingsScreen;
