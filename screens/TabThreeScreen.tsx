import { FormControl, Input, Stack, WarningOutlineIcon } from 'native-base';
import { Platform } from 'react-native';
import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { ApiRaw } from '../components/data/ApiRaw';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import React, { useContext, useEffect, useState } from "react";
import { useRef } from 'react';
import { truncate } from '../components/util';

const DEFAULT_PAGE = "https://www.google.com/";
export default function TabTwoScreen() {
  const [info, setInfo] = React.useState(DEFAULT_PAGE);
  const [selector, setSelector] = React.useState('#js-read__content');
  const gridIframe = useRef();
  const [iframeItem, setIframeItem] = React.useState<any>();
  const handleIframe = () => {
    if (gridIframe) {
      setIframeItem(gridIframe?.current);
    }
  }
  useEffect(() => {
    if (iframeItem) {
      let arrStr = new Array();
      var y = (iframeItem.contentWindow || iframeItem.contentDocument);
      // truncate(iframeItem.contentWindow.document.getElementById('#chapter-c'), arrStr, 200)
      console.log(arrStr)
    }
  }, [iframeItem])

  return (
    <View style={styles.container}>
      <FormControl isRequired>
        <Stack mx="4">
          <FormControl.Label>Trang web url</FormControl.Label>
          <Input
            type="text"
            value={info}
            onChangeText={(value) => setInfo(value)}
            placeholder="text"
          />
          <FormControl.HelperText>First link</FormControl.HelperText>
          <FormControl.ErrorMessage
            leftIcon={<WarningOutlineIcon size="xs" />}
          >
            End without '/'
          </FormControl.ErrorMessage>
        </Stack>
      </FormControl>
      {Platform.OS === "web" ? (
        <iframe id="iframe" ref={gridIframe} onLoad={handleIframe} src={info} height={'100%'} width={'100%'} />
      ) : (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: info }}
            style={{ marginTop: 22, flex: 1 }}
          />
        </View>
      )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
