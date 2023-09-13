import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  const url = "https://bible.com";
  return (
    <View style={styles.container}>
      <Text>Welcome to the Baible</Text>
      <StatusBar style="auto" />

      {Platform.OS === "web"
        ? <iframe style={styles.webview} src={url}></iframe>
        : (
          <WebView
            style={styles.webview}
            source={{ uri: url }}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  webview: {
    flex: 1,
    border: "none",
    display: "flex",
  },
});
