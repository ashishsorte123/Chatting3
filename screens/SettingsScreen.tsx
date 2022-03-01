import { View, Text, Pressable } from "react-native";
import React from "react";
import { Auth, DataStore } from "aws-amplify";
import { generateKeyPair } from "../utils/crypto";

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
    // save public key to UserModal in DataStore
  };

  return (
    <View>
      <Text>Settings</Text>

      <Pressable
        onPress={updateKeyPair}
        style={{
          backgroundColor: "#3777f0",
          height: 50,
          margin: 10,
          borderRadius: 25,
          alignItems: "center",
          justifyContent: "center",
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
        }}
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default SettingsScreen;
