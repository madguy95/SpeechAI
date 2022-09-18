import React, { useContext, useEffect, useState } from "react";
import * as Cheerio from "cheerio";
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
import { delay, objToQueryString, truncate } from "../util";
import { callApiGetMp3, loadHtml } from "../service/APIService";

const MAX_LENGTH_CHARACTER_TRUNC = 200;
const MAX_TRANSFER_TEXT_IN_TIME = 3;
const MAX_LOAD_FILE_IN_TIME = 3;
const API_DELAY_TIME = 2000; // ms

export function AudioTrack(props) {
  const { data } = useContext(ReferenceDataContext);
  const [apiInfo, setApiInfo] = useState<Api>(ApiDefault);

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
    if(props.content) {
      const arrStr = new Array();
      truncate(props.content, arrStr, MAX_LENGTH_CHARACTER_TRUNC);
      console.log(arrStr);
      setQueueStr(arrStr);
    }
  }, [props.content]);

  useEffect(() => {
    setApiInfo(data);
  }, [data]);

  function resetState() {
    if (abortController != null && !abortController.signal.aborted) {
      abortController.abort();
    }
    setAbort(new AbortController());
    setCanPlay(false);
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
    if (
      !flagQueue &&
      canPlay &&
      queueId.length > 0 &&
      soundQueue.length < MAX_LOAD_FILE_IN_TIME &&
      abortController != null
    ) {
      setFlagQueue(true);
      const idClone = [...queueId];
      const id = idClone.shift();
      console.log("Go play sound %s", id);
      setQueueId(idClone);
      playSound(id, abortController.signal);
    }
  }, [queueId, abortController, canPlay, soundQueue]);

  useEffect(() => {
    if (!isPlay && soundQueue?.length > 0 && canPlay) {
      setPlay(true);
      const queueClone = [...soundQueue];
      let soundCur = queueClone.shift();
      setSoundQueue(queueClone);
      setSound(soundCur);
      playS(soundCur);
    }
  }, [isPlay, soundQueue, canPlay, abortController, flagQueue]);

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
  };

  const getMp3File = async (text: any, signal: any): Promise<any> => {
    let timeNeedWait =
      timeDelayApi - timeLeft <= 0 ? 0 : timeDelayApi - timeLeft;
    console.log("Waiting %s ms before call api", timeNeedWait);
    await delay(timeNeedWait);
    setTimeLeft(0);
    setTimeLeftLife(0);
    return callApiGetMp3(text, signal, apiInfo);
  };

  const playS = async (soundCurrent: any) => {
    console.log("Go play sound %s");
    await soundCurrent.playAsync();
    new Promise<void>((resolve, reject) => {
      if (abortController.signal.aborted) return reject();
      abortController.signal.addEventListener("abort", async () => {
        if (reject) reject("abort");
        unLoadSound(soundCurrent);
        setPlay(false);
      });
      soundCurrent.setOnPlaybackStatusUpdate((playbackStatus: any) => {
        setPlayStatus(playbackStatus);
        if (playbackStatus.didJustFinish) {
          console.log("finished playing");
          setPlay(false);
          resolve();
        }
      });
    }).catch(() => console.log('rejected'));
  };

  const playSound = async (id: string | Promise<any>, signal: any) => {
    if (signal.aborted) return;
    let { sound: soundClone } = await Audio.Sound.createAsync({
      uri: apiInfo.urlAudio + "/" + id,
    });
    setSoundQueue((queue) => {
      const clone = [...queue];
      clone.push(soundClone);
      return clone;
    });
    setFlagQueue(false);
  };

  const pauseOrPlaySync = () => {
    setIsLoad((prev) => !prev);
    pauseOrPlay();
  };

  const pauseOrPlay = async () => {
    if (sound != null && sound._loaded) {
      if (playStatus.isPlaying) {
        const status = await sound.pauseAsync();
        setPlayStatus(status);
      } else {
        const status = await sound.playAsync();
        setPlayStatus(status);
      }
    }
    setCanPlay((prev) => !prev);
    setIsLoad((prev) => !prev);
  };

  function reset() {
    resetState();
    // setLink(nextPath);
    // load(nextPath);
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
              <Button isDisabled={isLoading || canPlay} onPress={() => reset()}>
                Reset
              </Button>
              <Button isDisabled={isLoading} onPress={() => pauseOrPlaySync()}>
                {canPlay ? "Pause" : "Play"}
              </Button>
            </Flex>
          </Stack>
        </FormControl>
      </Box>
    </ScrollView>
  );
}
