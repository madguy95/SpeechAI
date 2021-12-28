import React, { useContext, useEffect, useState } from "react";
import * as Cheerio from 'cheerio';
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
import { Audio } from "expo-av";
import { ReferenceDataContext } from "../share/ReferenceDataContext";
import { Api, ApiDefault } from "../model/api";
import { delay, objToQueryString } from "../util";

const sound = new Audio.Sound();
export function FetchData() {
  const { data } = useContext(ReferenceDataContext);
  const [apiInfo, setApiInfo] = useState<Api>(ApiDefault);
  useEffect(() => {
    setApiInfo(data);
  }, [data]);

  // useEffect(() => {
  //   sound.setOnPlaybackStatusUpdate((playbackStatus: any) => {
  //     if (playbackStatus.isPlaying) {
  //       setPlayStatus('isPlaying')
  //     } else {
  //       setPlayStatus('notPlaying')
  //     }
  //   }
  //   )
  // }, [])
  // const api = {
  //   url: "https://freetts.com/Home/PlayAudio",
  //   urlAudio: "https://freetts.com/audio",
  // };
  const [info, setInfo] = React.useState("https://truyenchu.vn");
  const [link, setLink] = React.useState("/tien-de-tro-ve/chuong-880-lai-mot-cai-tat");
  const [nextPath, setNextPath] = React.useState("");
  const [remoteData, setRemoteData] = React.useState("No data fetched yet!");
  // const [sound, setSound] = React.useState<any>();
  const [abortController, setAbort] = React.useState(new AbortController());
  const [queueId, setQueueId] = React.useState<any[]>([]);
  const [queueString, setQueueStr] = React.useState<any[]>([]);

  // luong text to speech
  const [flagIdRunning, setFlagId] = React.useState(false);

  // luong sound
  const [isPlay, setPlay] = React.useState(false);
  const [playStatus, setPlayStatus] = React.useState('STOP');

  const [canPlay, setCanPlay] = React.useState(false);
  // config api delay
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeLeftLife, setTimeLeftLife] = useState(2000);
  const timeDelayApi = 2000;

  async function resetState() {
    if (abortController != null && !abortController.signal.aborted) {
      abortController.abort()
      setAbort(new AbortController())
    }
    if (sound != null && sound._loaded) {
      await sound.stopAsync()
      await sound.unloadAsync()
    }
    setCanPlay(false)
    setPlay(false);
    setFlagId(false);
    setQueueStr([]);
    setQueueId([]);
  }

  async function load(linkCurrent?: string) {
    linkCurrent = linkCurrent != null ? linkCurrent : link;
    if (linkCurrent == link && queueString.length != 0) {
      return
    }
    // let abortClone = new AbortController();
    // if (abortController != null) {
    //   abortController.abort();
    // }
    // setAbort(abortClone);
    const response = await fetch(info + linkCurrent);
    const text = await response.text();
    //   console.log(text);
    const $ = Cheerio.load(text);
    setRemoteData($("#chapter-c").text());
    const nextLink = $("#next_chap").first().attr("href")?.toString();
    setNextPath(nextLink != null ? nextLink : '');
    // console.log($("#next_chap").first().attr("href"));
    let arrStr = new Array();
    truncate($("#chapter-c").text(), arrStr, 100);
    console.log(arrStr);
    // const run = async () => {
    //   await playSound("047e78b7-7aa8-4cfa-aab6-f93e591d6278.mp3");
    //   await playSound("f8cae8b7-d493-472c-9b6c-4aead5676b6a.mp3");
    // };
    // run();
    // arrayTrunc(arrStr, 2, 0, process, abortClone.signal);
    setQueueStr(arrStr);
  }

  useEffect(() => {
    if (
      !flagIdRunning &&
      queueId.length < 2 &&
      queueString.length > 0 &&
      abortController != null
    ) {
      setFlagId(true);
      const strClone = [...queueString];
      const str = strClone.shift();
      setQueueStr(strClone);
      getMp3File(str, abortController.signal).then((id) => {
        setFlagId(false);
        if (id != null) {
          console.log("ID sound %s by text: [ %s ]", id, str);
          setQueueId((queueIdPrev) => {
            const queueClone = [...queueIdPrev];
            queueClone.push(id);
            return queueClone;
          });
        }
      });
    }
  }, [queueId, queueString, abortController, flagIdRunning]);

  useEffect(() => {
    if (!isPlay && canPlay && queueId.length > 0 && abortController != null) {
      setPlay(true);
      const idClone = [...queueId];
      const id = idClone.shift();
      console.log("Go play sound %s", id);
      setQueueId(idClone);
      playSound(id, abortController.signal).then(() => {
        setPlay(false);
      });
    }
  }, [queueId, abortController, isPlay, canPlay]);

  // const processGetId = async (strArr: string[], signal: any) => {
  //   if (signal.aborted) return;
  //   console.log(strArr);
  //   for (let index = 0; index < strArr.length; index++) {
  //     queueId.push();
  //   }
  //   const promiseArr: Promise<any>[] = [];
  //   strArr.forEach(async (x) => {
  //     await push();
  //   });
  //   await Promise.all(promiseArr).then(async (values) => {
  //     let filtered: any[] = values.filter(function (e) {
  //       return e != null;
  //     });
  //     for (let index = 0; index < filtered.length; index++) {
  //       await playSound(filtered[index], signal);
  //     }
  //   });
  // };

  // const arrayTrunc = async (
  //   arr: any[],
  //   n: number,
  //   start: any,
  //   func: (arrStr: any, signal: any) => {},
  //   signal: any
  // ) => {
  //   if (signal.aborted) return;
  //   if (n >= arr.length) return await func(arr, signal);
  //   for (let index = 0; index < arr.length; index += n) {
  //     if (signal.aborted) return;
  //     if (index + n <= arr.length) {
  //       await func(arr.slice(index, index + n), signal);
  //     } else {
  //       await func(arr.slice(index, arr.length), signal);
  //     }
  //   }
  // };

  // const process = async (strArr: string[], signal: any) => {
  //   if (signal.aborted) return;
  //   console.log(strArr);
  //   const promiseArr: Promise<any>[] = [];
  //   strArr.forEach(async (x) => {
  //     return promiseArr.push(getMp3File(x, signal));
  //   });
  //   await Promise.all(promiseArr).then(async (values) => {
  //     let filtered: any[] = values.filter(function (e) {
  //       return e != null;
  //     });
  //     for (let index = 0; index < filtered.length; index++) {
  //       await playSound(filtered[index], signal);
  //     }
  //   });
  // };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((t) => t + 10);
    }, 10);
    return () => clearInterval(intervalId);
  }, [timeLeftLife]);

  const getMp3File = async (text: any, signal: any): Promise<any> => {
    try {
      const queryString = apiInfo.queryString
        ? objToQueryString(
          JSON.parse(
            apiInfo.queryString
              .replace(/(\r\n|\n|\r)/gm, "")
              .replace("${textsearch}", text)
          )
        )
        : "";
      // let ix = randomIntFromInterval(200, 1000);
      // console.log(ix);
      // await delay(ix);
      const bodyStr = apiInfo.body
        ? objToQueryString(
          JSON.parse(
            apiInfo.body
              .replace(/(\r\n|\n|\r)/gm, "")
              .replace("${textsearch}", text)
          )
        )
        : "";
      // console.log(queryString);
      let timeNeedWait =
        timeDelayApi - timeLeft <= 0 ? 0 : timeDelayApi - timeLeft;
      console.log("Waiting %s ms before call api", timeNeedWait);
      await delay(timeNeedWait);
      setTimeLeft(0);
      setTimeLeftLife(0);
      return fetch(`${apiInfo.url}?${queryString}`, {
        method: apiInfo.method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: bodyStr,
        signal: signal,
      })
        .then(async (response) => {
          const json = await response.json();
          // console.log(json);
          if (json.id !== undefined) {
            return json.id;
          }
          return;
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  };

  const playSound = async (id: string | Promise<any>, signal: any) => {
    if (signal.aborted) return;
    if (sound != null && sound._loaded) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    await sound.loadAsync({ uri: apiInfo.urlAudio + "/" + id });
    if (sound != undefined) {
      // setSound(soundNew);
      await sound.playAsync();
      return new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject();
        signal.addEventListener("abort", async () => {
          await sound.stopAsync();
          await sound.unloadAsync();
          reject();
        });
        sound.setOnPlaybackStatusUpdate((playbackStatus: any) => {
          if (playbackStatus.isPlaying) {
            setPlayStatus('isPlaying')
          } else {
            setPlayStatus('notPlaying')
          }
          if (playbackStatus.didJustFinish) {
            console.log("finished playing");
            resolve();
          }
        });
      });
    }
    // await new Promise(f => setTimeout(f, 1000));
  };

  const pauseOrPlay = async () => {
    setCanPlay((prev) => !prev)
    if (playStatus == 'isPlaying') {
      if (sound != null && sound._loaded) {
        await sound.pauseAsync()
      }
    } else {
      if (sound != null && sound._loaded) {
        await sound.playAsync()
      }
    }
  };

  function next() {
    setLink(nextPath);
    load(nextPath);
    resetState();
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
    }
    if (subString.includes(" ")) {
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
        // overflowY: "scroll",
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
              At least 6 characters are required.
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
              At least 6 characters are required.
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
              <Button onPress={() => pauseOrPlay()}>{canPlay ? "Pause" : "Play"}</Button>
            </Flex>
          </Stack>
        </FormControl>
      </Box>
    </ScrollView>
  );
}
