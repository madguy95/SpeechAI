import React, { useContext, useEffect, useState } from "react";
import Cheerio from "cheerio-without-node-native";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  ScrollView,
  Stack,
  TextArea,
  WarningOutlineIcon,
} from "native-base";
import { View } from "../Themed";
import { Audio } from "expo-av";
import { ReferenceDataContext } from "../share/ReferenceDataContext";
// import Sound from "react-native-sound";

export function FetchData() {
  const { data } = useContext(ReferenceDataContext);
  const [apiInfo, setApiInfo] = useState({});
  useEffect(() => {
    setApiInfo(data);
  }, [data]);
  const api = {
    url: "https://freetts.com/Home/PlayAudio",
    urlAudio: "https://freetts.com/audio",
  };
  const [info, setInfo] = React.useState("https://truyenchu.vn");
  const [link, setLink] = React.useState(
    "/tien-de-tro-ve/chuong-880-lai-mot-cai-tat"
  );
  const [nextPath, setNextPath] = React.useState(
    "/tien-de-tro-ve/chuong-880-lai-mot-cai-tat"
  );
  const [remoteData, setRemoteData] = React.useState("No data fetched yet!");
  const [sound, setSound] = React.useState();

  async function load() {
    const response = await fetch(info + link);
    const text = await response.text();
    //   console.log(text);
    const $ = Cheerio.load(text);
    setRemoteData($("#chapter-c").text());
    setNextPath($("#next_chap").first().attr("href"));
    console.log($("#next_chap").first().attr("href"));
    let arrStr = new Array();
    truncate($("#chapter-c").text(), arrStr, 70);
    console.log(arrStr);
    let id = getMp3File(arrStr[0]);
    // id.then(x => {
    //   if (x != '') {
    //     playSound(x);
    //   }
    // })
    const run = async () => {
      await playSound("047e78b7-7aa8-4cfa-aab6-f93e591d6278.mp3");
      await playSound("f8cae8b7-d493-472c-9b6c-4aead5676b6a.mp3");
    };
    run();
    // arrStr.forEach(x => {
    //   // playTrack(getMp3File(x));
    //   let id = getMp3File(x)
    //   playSound(id);
    //   return false
    // });
  }

  function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(
        encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
      );
    }
    return keyValuePairs.join("&");
  }

  const getMp3File = async (text: any) => {
    try {
      // const queryString = objToQueryString({
      //   input_text: text,
      //   voice: 'hn_female_ngochuyen_fast_news_48k-thg',
      //   bit_rate: 128000
      // });
      const queryString = apiInfo.queryString
        ? objToQueryString(
            JSON.parse(
              apiInfo.queryString
                .replace(/(\r\n|\n|\r)/gm, "")
                .replace("${textsearch}", "")
            )
          )
        : "";
      const bodyStr = apiInfo.body
        ? objToQueryString(
            JSON.parse(
              apiInfo.body
                .replace(/(\r\n|\n|\r)/gm, "")
                .replace("${textsearch}", "")
            )
          )
        : "";
      console.log(queryString);
      // const response = await fetch(`${apiInfo.url}?${queryString}`, {
      //   method: apiInfo.method,
      //   headers: {
      //     Accept: "application/json",
      //     "Content-Type": "application/json",
      //   },
      //   body: bodyStr,
      // });
      // const json = await response.json();
      // console.log(json);
      // if (json.id !== undefined) {
      //   return json.id;
      // }
      return "";
    } catch (error) {
      console.error(error);
    }
  };

  // const playTrack = (id: string | Promise<any>) => {
  //   const track = new Sound('https://freetts.com/Home/PlayAudio/'+id, null, (e: any) => {
  //     if (e) {
  //       console.log('error loading track:', e)
  //     } else {
  //       track.play()
  //     }
  //   })
  // }

  const playSound = async (id: string | Promise<any>) => {
    const { sound } = await Audio.Sound.createAsync({
      uri: apiInfo.urlAudio + "/" + id,
    });
    setSound(sound);
    await sound.playAsync();
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
          console.log("finished playing");
          resolve();
        }
      });
    });
    // await new Promise(f => setTimeout(f, 1000));
  };

  async function next() {
    setLink(nextPath);
    load();
  }

  function truncate(str: string, arrStr: any[], n: number): any {
    str = str.trim();
    if (str.length <= n) {
      arrStr.push(str);
      return;
    }
    let subString = str.substring(0, n - 1); // the original check
    let indexDot = 0;
    let indexSpace = 0;
    if (subString.includes(".")) {
      indexDot = subString.lastIndexOf(".");
    } else if (subString.includes(" ")) {
      indexSpace = subString.lastIndexOf(" ");
    }
    let indexLast = indexDot < indexSpace ? indexSpace : indexDot;
    if (indexLast > 0) {
      subString = subString.substring(0, indexLast);
    }
    arrStr.push(
      subString
        .trim()
        .replace(/^\./, "")
        .replace(/\.\s*$/, "")
    );
    return truncate(str.substring(subString.length, str.length - 1), arrStr, n);
  }

  return (
    <ScrollView
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        overflowY: "scroll",
      }}
      nestedScrollEnabled={true}
    >
      <Box bg="light.300">
        <FormControl isRequired>
          <Stack mx="4">
            <FormControl.Label>Trang web url</FormControl.Label>
            <Input
              type="text"
              value={info}
              onChangeText={(value) => setInfo(value)}
              placeholder="text"
            />
            <FormControl.HelperText>End without '/'</FormControl.HelperText>
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon size="xs" />}
            >
              End without '/'
            </FormControl.ErrorMessage>
          </Stack>
        </FormControl>
        <FormControl isRequired>
          <Stack mx="4">
            <FormControl.Label>Path truyện start</FormControl.Label>
            <Input
              type="text"
              value={link}
              onChangeText={(value) => setLink(value)}
              placeholder="text"
            />
            <FormControl.HelperText>Start with '/'</FormControl.HelperText>
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon size="xs" />}
            >
              Atleast 6 characters are required.
            </FormControl.ErrorMessage>
          </Stack>
        </FormControl>
        <FormControl isRequired isReadOnly>
          <Stack mx="4">
            <FormControl.Label>Path truyện next</FormControl.Label>
            <Input type="text" value={nextPath} placeholder="password" />
            <FormControl.HelperText>Start with '/'</FormControl.HelperText>
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon size="xs" />}
            >
              Atleast 6 characters are required.
            </FormControl.ErrorMessage>
          </Stack>
        </FormControl>
        <FormControl isRequired isReadOnly>
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
        <FormControl isRequired isReadOnly>
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
              <Button onPress={() => next()}>Next</Button>
            </Flex>
          </Stack>
        </FormControl>
      </Box>
    </ScrollView>
  );
}
