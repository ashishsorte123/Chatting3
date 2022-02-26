import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { User } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";

const blue = "#3777f0";
const grey = "lightgrey";

const Message = ({ message }) => {
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean>(false);

  const { width } = useWindowDimensions();

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

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

  if (!user) {
    return <ActivityIndicator />;
  }

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.rightContainer : styles.leftContainer,
      ]}
    >
      {message.image && (
        <View style={{ marginBottom: message.content ? 10 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{ width: width * 0.6, aspectRatio: 4 / 3 }}
            resizeMode="contain"
          />
        </View>
      )}
      {!!message.content && (
        <Text style={{ color: isMe ? "black" : "white" }}>
          {message.content}
        </Text>
      )}
    </View>
  );
};

export default Message;
