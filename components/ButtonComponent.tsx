import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";

export default function ButtonComponent(props) {
  const { text, bordered, onPress } = props;
  const styleButton = {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 10,
    marginHorizontal: 10,
    paddingVertical: 15,
    borderWidth: bordered ? 1 : 0,
    borderColor: bordered ? Colors.light.primary : "#fff",
    padding: 10,
    backgroundColor: bordered ? "#fff" : Colors.light.primary,
    borderRadius: 50,
  };

  const styleText = {
    color: bordered ? Colors.light.primary : "#fff",
    fontWeight: "bold",
    fontSize: 18,
  };

  return (
    <TouchableOpacity onPress={onPress} style={styleButton}>
      <Text style={styleText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
