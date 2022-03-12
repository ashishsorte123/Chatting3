import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  SimpleLineIcons,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import { Auth, Storage } from "aws-amplify";
import { ChatRoomUser, Message } from "../../src/models";
import { ChatRoom } from "../../src/models";
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import { Audio } from "expo-av";
import AudioPlayer from "../AudioPlayer";
import MessageComponent from "../Message";
import styles from "./styles";
import { box } from "tweetnacl";
import {
  encrypt,
  getMySecretKey,
  stringToUint8Array,
} from "../../utils/crypto";
import { DataStore } from "@aws-amplify/datastore";

const MessageInput = ({ chatRoom, messageReplyTo, removeMessageReplyTo }) => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundURI, setSoundURI] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const libraryResponse =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
        await Audio.requestPermissionsAsync();
        if (
          libraryResponse.status !== "granted" ||
          photoResponse.status !== "granted"
        ) {
          alert("Sorry , we need camera roll permissions to make this work !");
        }
      }
    })();
  }, []);

  const sendMessageToUser = async (user, fromUserId) => {
    // send message
    const ourSecretKey = await getMySecretKey();
    if (!ourSecretKey) {
      return;
    }

    if (!user.publicKey) {
      Alert.alert(
        "The user haven't set his keypair yet",
        "Until the user generates the keypair, you cannot securely send him/her messages"
      );
      return;
    }

    console.log("private key", ourSecretKey);

    const sharedKey = box.before(
      stringToUint8Array(user.publicKey),
      ourSecretKey
    );

    const encryptedMessage = encrypt(sharedKey, { message });
    console.log("encrypted message", encryptedMessage);

    const newMessage = await DataStore.save(
      new Message({
        content: encryptedMessage, //<- this messages should be encrypted
        userID: fromUserId,
        forUserId: user.id,
        chatroomID: chatRoom.id,
        replyToMessageID: messageReplyTo?.id,
      })
    );

    // updateLastMessage(newMessage);
  };

  const sendMessage = async () => {
    // get all the users of this chatroom

    const authUser = await Auth.currentAuthenticatedUser();

    const users = (await DataStore.query(ChatRoomUser))
      .filter((cru) => cru.chatRoom.id === chatRoom.id)
      .map((cru) => cru.user);

    console.log("users", users);

    //  for each user, encrypt the `content` with his public key and save it as a new message
    await Promise.all(
      users.map((user) => sendMessageToUser(user, authUser.attributes.sub))
    );

    resetFields();
  };

  const updateLastMessage = async (newMessage) => {
    DataStore.save(
      ChatRoom.copyOf(chatRoom, (updatedChatRoom) => {
        updatedChatRoom.LastMessage = newMessage;
      })
    );
  };

  const onPlusClicked = () => {
    console.warn("On plus clicked");
  };

  const onPress = () => {
    if (image) {
      sendImage();
    } else if (soundURI) {
      sendAudio();
    } else if (message) {
      sendMessage();
    } else {
      onPlusClicked();
    }
  };

  const resetFields = () => {
    setMessage("");
    setIsEmojiPickerOpen(false);
    setImage(null);
    setProgress(0);
    setSoundURI(null);
    removeMessageReplyTo();
  };

  // Image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const progressCallback = (progress) => {
    // console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
    setProgress(progress.loaded / progress.total);
  };

  const sendImage = async () => {
    if (!image) {
      return;
    }
    const blob = await getBlob(image);
    const { key } = await Storage.put(`${uuid.v4()}.jpeg`, blob, {
      progressCallback,
    });

    // send message
    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        image: key,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
        replyToMessageID: messageReplyTo?.id,
      })
    );

    updateLastMessage(newMessage);
    resetFields();
  };

  const getBlob = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording...");

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording...");
    if (!recording) {
      return;
    }
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log("Recording stopped and stored at ", uri);

    if (!uri) {
      return;
    }

    setSoundURI(uri);
  }

  const sendAudio = async () => {
    if (!soundURI) {
      return;
    }

    const uriParts = soundURI.split(".");
    const extension = uriParts[uriParts.length - 1];
    const blob = await getBlob(soundURI);
    const { key } = await Storage.put(`${uuid.v4()}.${extension}`, blob, {
      progressCallback,
    });

    // send message
    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        audio: key,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
        status: "SENT",
        replyToMessageID: messageReplyTo?.id,
      })
    );

    updateLastMessage(newMessage);
    resetFields();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { height: isEmojiPickerOpen ? "50%" : "auto" }]}
    >
      {messageReplyTo && (
        <View
          style={{
            backgroundColor: "#f2f2f2",
            padding: 5,
            flexDirection: "row",
            alignSelf: "stretch",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text>Reply to:</Text>
            <MessageComponent message={messageReplyTo} />
          </View>

          <Pressable onPress={() => removeMessageReplyTo()}>
            <AntDesign
              name="close"
              size={24}
              color="black"
              style={{ margin: 5 }}
            />
          </Pressable>
        </View>
      )}

      {image && (
        <View style={styles.sendImageContainer}>
          <Image
            source={{ uri: image }}
            style={{ width: 100, height: 100, borderRadius: 20 }}
          />

          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignSelf: "flex-end",
            }}
          >
            <View
              style={{
                height: 10,
                backgroundColor: "#3777f0",
                width: `${progress * 100}%`,
                borderRadius: 10,
              }}
            />
          </View>

          <Pressable onPress={() => setImage(null)}>
            <AntDesign
              name="close"
              size={24}
              color="black"
              style={{ margin: 10 }}
            />
          </Pressable>
        </View>
      )}

      {soundURI && <AudioPlayer soundURI={soundURI} />}

      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Pressable
            onPress={() =>
              setIsEmojiPickerOpen((currentValue) => !currentValue)
            }
          >
            <SimpleLineIcons
              name="emotsmile"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </Pressable>

          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Message..."
          />
          <Pressable onPress={pickImage}>
            <Feather
              name="image"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </Pressable>

          <Pressable onPress={takePhoto}>
            <Feather
              name="camera"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </Pressable>

          <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
            <MaterialCommunityIcons
              name={recording ? "microphone" : "microphone-outline"}
              size={24}
              color={recording ? "red" : "#595959"}
              style={styles.icon}
            />
          </Pressable>
        </View>

        <Pressable onPress={onPress} style={styles.buttonContainer}>
          {message || image || soundURI ? (
            <Ionicons name="send" size={18} color="white" />
          ) : (
            <AntDesign name="plus" size={24} color="white" />
          )}
        </Pressable>
      </View>

      {isEmojiPickerOpen && (
        <EmojiSelector
          onEmojiSelected={(emoji) =>
            setMessage((currentMessage) => currentMessage + emoji)
          }
          columns={9}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default MessageInput;
