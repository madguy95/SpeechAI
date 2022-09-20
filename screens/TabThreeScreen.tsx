import {
  Button,
  Flex,
  FormControl,
  Input,
  Stack,
  TextArea,
} from "native-base";
import { Platform } from "react-native";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { Text, View } from "../components/Themed";
import React, { useContext, useEffect, useState } from "react";
import { useRef } from "react";
import { getContentInHtml, truncate } from "../components/util";
import { loadHtml } from "../components/service/APIService";
import { AudioTrack } from "../components/data/AudioTrack";
import { ReferenceDataContext } from "../components/share/ReferenceDataContext";

// const DEFAULT_PAGE = "https://reactjs.org/";
const DEFAULT_PAGE = "https://truyenfull.vn/than-dao-dan-ton-606028/chuong-1/";
// const CSS_SELECTOR = "#js-read__content";
const CSS_SELECTOR = "#chapter-c";
const MAX_LENGTH_CHARACTER_TRUNC = 200;
export default function TabTwoScreen() {
  const {data, setData} = useContext(ReferenceDataContext)

  const [inputURL, setInputURl] = React.useState(DEFAULT_PAGE);
  const [info, setInfo] = React.useState(DEFAULT_PAGE);

  const [remoteData, setRemoteData] = React.useState();
  const [selector, setSelector] = React.useState(CSS_SELECTOR);

  const gridIframe = useRef<HTMLIFrameElement>(null);
  const [iframeItem, setIframeItem] = React.useState<any>();
  // const [html, setHtml] = React.useState<any>("<p>Here I am</p>");

  const handleIframe = () => {
    // const url = gridIframe.current.contentWindow.location.href;
    // if (gridIframe) {
    //   setIframeItem(gridIframe?.current);
    //   var y = (gridIframe?.current.contentWindow || gridIframe?.current.contentDocument);
    //   console.log(y.location.href)
    // }
  };

  useEffect(() => {
    if (iframeItem) {
      let arrStr = new Array();
      var y = iframeItem.contentWindow || iframeItem.contentDocument;
      console.log(y);
      // truncate(iframeItem.contentWindow.document.getElementById('#chapter-c'), arrStr, 200)
    }
  }, [iframeItem]);

  async function load() {
    if (inputURL && selector) {
      loadHtml(inputURL).then((html) => {
        const content = getContentInHtml(html, selector);
        setRemoteData(content);
        const arrStr = new Array();
        truncate(content, arrStr, MAX_LENGTH_CHARACTER_TRUNC);
        setData({...data, content: arrStr})
      });
    }
  }

  return (
    <View style={styles.container}>
      <FormControl isRequired>
        <Stack mx="4">
          <FormControl.Label>Trang web url</FormControl.Label>
          <Input
            type="text"
            value={inputURL}
            onChangeText={(inputURL) => setInputURl(inputURL)}
            onSubmitEditing={(event) => {
              setInfo(inputURL);
              // setHtml(loadHtml(inputURL));
            }}
            placeholder="text"
          />
        </Stack>
        <Stack mx="4">
          <FormControl.Label>Query selector</FormControl.Label>
          <Input
            type="text"
            value={selector}
            onChangeText={(value) => setSelector(value)}
            placeholder="text"
          />
        </Stack>
        <Stack mx="4">
            <Flex
              direction="row"
              mb="2.5"
              mt="1.5"
              _text={{
                color: "coolGray.800",
              }}
            >
              <Button onPress={() => load()}>Load</Button>
              {/* <AudioTrack content={remoteData} /> */}
            </Flex>
          </Stack>
        <Stack mx="4">
          <TextArea
            h={40}
            placeholder="Text Area Placeholder"
            w={{
              base: "100%",
            }}
            value={remoteData}
          />
        </Stack>
      </FormControl>
      {Platform.OS === "web" ? (
        <iframe
          id="iframe"
          ref={gridIframe}
          onLoad={handleIframe}
          src={info}
          height={"100%"}
          width={"100%"}
        />
      ) : (
        <View style={styles.container}>
          <WebView
            source={{ uri: info }}
            style={{ marginTop: 22, flex: 1 }}
            allowsFullscreenVideo={false}
            onNavigationStateChange={({ url, canGoBack }) => {
              // console.log("url>>>>>>>>", url);
              setInputURl(url);
            }}
            // scrollEnabled={false}
            useWebKit={true}
            originWhitelist={["*"]}
            allowsInlineMediaPlayback={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
