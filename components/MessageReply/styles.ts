import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3777f0",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: "70%",
    alignItems: "flex-end",
  },

  leftContainer: {
    backgroundColor: "#3777f0",
    marginLeft: 10,
    marginRight: "auto",
  },

  rightContainer: {
    backgroundColor: "#d3d3d3",
    marginLeft: "auto",
    marginRight: 10,
    alignItems: "flex-end",
  },

  messageReply: {
    backgroundColor: "gray",
    padding: 5,
    borderRadius: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});

export default styles;
