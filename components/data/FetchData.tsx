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

const MAX_TRANSFER_TEXT_IN_TIME = 3
const MAX_LOAD_FILE_IN_TIME = 3
const API_DELAY_TIME = 2000 // ms

export function FetchData() {
  const { data } = useContext(ReferenceDataContext);
  const [apiInfo, setApiInfo] = useState<Api>(ApiDefault);

  const [info, setInfo] = React.useState("https://truyenchu.vn");
  const [link, setLink] = React.useState("/tien-de-tro-ve/chuong-880-lai-mot-cai-tat");
  const [nextPath, setNextPath] = React.useState("");
  const [remoteData, setRemoteData] = React.useState("No data fetched yet!");
  // const [sound, setSound] = React.useState<any>();
  const [abortController, setAbort] = React.useState(new AbortController());
  const [queueId, setQueueId] = React.useState<any[]>([]);
  const [queueString, setQueueStr] = React.useState<any[]>([]);

  // luong text to speech
  const [flagId, setFlagId] = React.useState(false); // boolean processing text in queue text

  // luong sound
  const [flagQueue, setFlagQueue] = React.useState(false); // boolean processing sound in queue id
  const [isPlay, setPlay] = React.useState(false);
  const [canPlay, setCanPlay] = React.useState(false); // play or pause
  const [playStatus, setPlayStatus] = React.useState<any>({}); // status of current sound

  // config api delay
  const [timeLeft, setTimeLeft] = useState(0); // time ran
  const [timeLeftLife, setTimeLeftLife] = useState(API_DELAY_TIME); // timer running
  const timeDelayApi = API_DELAY_TIME;

  //sound
  const [sound, setSound] = React.useState<any>(); // current sound active
  const [soundQueue, setSoundQueue] = React.useState<any[]>([]); // list sound in queue

  // to disable button
  const [isLoading, setIsLoad] = useState(false);

  useEffect(() => {
    setApiInfo(data);
  }, [data]);

  function resetState() {
    if (abortController != null && !abortController.signal.aborted) {
      abortController.abort()
    }
    setAbort(new AbortController())
    setCanPlay(false)
    setPlay(false);
    setFlagId(false);
    setFlagQueue(false);
    setQueueStr([]);
    setQueueId([]);
    setSound({});
  }

  useEffect(() => {
    if (
      !flagId &&
      queueId.length < MAX_TRANSFER_TEXT_IN_TIME &&
      queueString.length > 0 &&
      abortController != null
    ) {
      setFlagId(true);
      const strClone = [...queueString];
      const str = strClone.shift();
      setQueueStr(strClone);
      // new Promise<void>((resolve) => {
      //   // setTimeout(() => {
      //   setFlagId(false);
      //   setQueueId((queueIdPrev) => {
      //     const queueClone = [...queueIdPrev];
      //     queueClone.push('7478376f-fa74-4a57-89f9-620654cee2d5.mp3');
      //     return queueClone;
      //   });
      //   resolve()
      //   // }, 500)
      // })
      getMp3File(str, abortController.signal).then((id) => {
        if (id != null) {
          console.log("ID sound %s by text: [ %s ]", id, str);
          setQueueId((queueIdPrev) => {
            const queueClone = [...queueIdPrev];
            queueClone.push(id);
            return queueClone;
          });
        }
        setFlagId(false);
      });
    }
  }, [queueId, queueString, abortController, flagId]);

  useEffect(() => {
    if (!flagQueue && canPlay && queueId.length > 0 && soundQueue.length < MAX_LOAD_FILE_IN_TIME && abortController != null) {
      setFlagQueue(true)
      const idClone = [...queueId];
      const id = idClone.shift();
      console.log("Go play sound %s", id);
      setQueueId(idClone);
      playSound(id, abortController.signal)
    }
  }, [queueId, abortController, canPlay, soundQueue]);

  useEffect(() => {
    if (!isPlay && soundQueue?.length > 0 && canPlay) {
      setPlay(true);
      const queueClone = [...soundQueue]
      let soundCur = queueClone.shift()
      setSoundQueue(queueClone)
      setSound(soundCur)
      playS(soundCur)
    }
  }, [isPlay, soundQueue, canPlay, abortController, flagQueue])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((t) => t + 10);
    }, 10);
    return () => clearInterval(intervalId);
  }, [timeLeftLife]);

  const unLoadSound = async (soundCancel: any) => {
    if (soundCancel != null) {
      await soundCancel.stopAsync();
      await soundCancel.unloadAsync();
    }
  }

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
      const bodyStr = apiInfo.body
        ? objToQueryString(
          JSON.parse(
            apiInfo.body
              .replace(/(\r\n|\n|\r)/gm, "")
              .replace("${textsearch}", text)
          )
        )
        : "";
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
          console.log(json)
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

  const playS = async (soundCurrent: any) => {
    console.log("Go play sound %s");
    await soundCurrent.playAsync();
    new Promise<void>((resolve, reject) => {
      if (abortController.signal.aborted) return reject();
      abortController.signal.addEventListener("abort", async () => {
        if (reject) reject('abort')
        unLoadSound(soundCurrent)
        setPlay(false);
      });
      soundCurrent.setOnPlaybackStatusUpdate((playbackStatus: any) => {
        setPlayStatus(playbackStatus)
        if (playbackStatus.didJustFinish) {
          console.log("finished playing");
          setPlay(false);
          resolve();
        }
      });
    });
  }

  async function load(linkCurrent?: string) {
    linkCurrent = linkCurrent != null ? linkCurrent : link;
    if (linkCurrent == link && queueString.length != 0) {
      return
    }
    setIsLoad(true)
    const response = await fetch(info + linkCurrent);
    const text = await response.text();
    const $ = Cheerio.load(text);
    setRemoteData($("#chapter-c").text());
    const nextLink = $("#next_chap").first().attr("href")?.toString();
    setNextPath(nextLink != null ? nextLink : '');
    let arrStr = new Array();
    truncate($("#chapter-c").text(), arrStr, 20);
    console.log(arrStr);
    setQueueStr(arrStr);
    setIsLoad(false)
  }

  const playSound = async (id: string | Promise<any>, signal: any) => {
    if (signal.aborted) return;
    let { sound: soundClone } = await Audio.Sound.createAsync({ uri: apiInfo.urlAudio + "/" + id });
    setSoundQueue((queue) => {
      const clone = [...queue]
      clone.push(soundClone)
      return clone
    })
    setFlagQueue(false)
  };

  const pauseOrPlaySync = () => {
    setIsLoad((prev) => !prev)
    pauseOrPlay()
  }

  const pauseOrPlay = async () => {
    if (sound != null && sound._loaded) {
      if (playStatus.isPlaying) {
        const status = await sound.pauseAsync()
        setPlayStatus(status)
      }
      else {
        const status = await sound.playAsync()
        setPlayStatus(status)
      }
    }
    setCanPlay((prev) => !prev)
    setIsLoad((prev) => !prev)
  };

  function next() {
    resetState();
    setLink(nextPath);
    load(nextPath);
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
              <Button isDisabled={isLoading || canPlay} onPress={() => load()}>Load</Button>
              <Button isDisabled={isLoading || canPlay} onPress={() => next()}>Next</Button>
              <Button isDisabled={isLoading} onPress={() => pauseOrPlaySync()}>{canPlay ? "Pause" : "Play"}</Button>
            </Flex>
          </Stack>
        </FormControl>
      </Box>
    </ScrollView>
  );
}
