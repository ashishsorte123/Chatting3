import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { Message as MessageModal, User } from "../../src/models";
import { Auth, DataStore, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import AudioPlayer from "../AudioPlayer";
import { Ionicons } from "@expo/vector-icons";

const blue = "#3777f0";
const grey = "lightgrey";

const Message = (props) => {
  const [message, setMessage] = useState<MessageModal>(props.message);
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean | null>(false);
  const [soundURI, setSoundURI] = useState<any>(null);

  const { width } = useWindowDimensions();

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    const subscription = DataStore.observe(MessageModal, message.id).subscribe(
      (msg) => {
        if (msg.model === MessageModal && msg.opType === "UPDATE") {
          setMessage((message) => ({ ...message, ...msg.element }));
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setAsRead();
  }, [isMe, , message]);

  useEffect(() => {
    if (message.audio) {
      Storage.get(message.audio).then(setSoundURI);
    }
  }, [message]);

  useEffect(() => {
    const checkIfMe = async () => {
      if (!user) {
        return;
      }
      const authUser = await Auth.currentAuthenticatedUser();
      setIsMe(user.id === authUser.attributes.sub);
    };
    checkIfMe();
  }, [user]);

  const setAsRead = async () => {
    if (isMe === false && message.status !== "READ") {
      await DataStore.save(
        MessageModal.copyOf(message, (updated) => {
          updated.status = "READ";
        })
      );
    }
  };

  // const downloadSound = async () => {
  //   const uri = await Storage.get(message.audio);
  // };

  if (!user) {
    return <ActivityIndicator />;
  }

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.rightContainer : styles.leftContainer,
        { width: soundURI ? "75%" : "auto" },
      ]}
    >
      {message.image && (
        <View style={{ marginBottom: message.content ? 10 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{ width: width * 0.55, aspectRatio: 4 / 3 }}
            resizeMode="contain"
          />
        </View>
      )}

      {soundURI && <AudioPlayer soundURI={soundURI} />}

      {!!message.content && (
        <Text style={{ color: isMe ? "black" : "white" }}>
          {message.content}
        </Text>
      )}

      {isMe && !!message.status && message.status !== "SENT" && (
        <Ionicons
          name={message.status === "DELIVERED" ? "checkmark" : "checkmark-done"}
          size={16}
          color="grey"
          style={{ marginHorizontal: 5 }}
        />
      )}
    </View>
  );
};

export default Message;
