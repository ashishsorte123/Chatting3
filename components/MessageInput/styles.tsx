import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  root: {
    padding: 10,
  },

  row: {
    flexDirection: "row",
  },

  inputContainer: {
    backgroundColor: "#f2f2f2",
    flex: 1,
    marginRight: 10,
    borderRadius: 25,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dedede",
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },

  input: {
    flex: 1,
    marginHorizontal: 5,
  },

  icon: {
    marginHorizontal: 5,
  },

  buttonContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#3777f0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 35,
  },

  sendImageContainer: {
    flexDirection: "row",
    marginVertical: 20,
    alignSelf: "stretch",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#595959",
    borderRadius: 20,
  },

  sendAudioContainer: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
    justifyContent: "space-between",
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
  },

  audioProgressBG: {
    height: 3,
    flex: 1,
    backgroundColor: "lightgrey",
    borderRadius: 5,
    margin: 10,
  },

  audioProgressFG: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#3777f0",
    position: "absolute",
    top: -3,
  },
});

export default styles;
