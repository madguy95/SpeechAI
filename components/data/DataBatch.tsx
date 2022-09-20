import React, { useContext, useEffect, useState } from "react";
import { ReferenceDataContext } from "../share/ReferenceDataContext";
import { Api, ApiDefault, PlaylistItem } from "../model/api";
import { delay } from "../util";
import { callApiGetMp3 } from "../service/APIService";

const MAX_LOAD_FILE_IN_TIME = 3;
const API_DELAY_TIME = 2000; // ms

export function DataBatch(props: { content: string; idSelected: number; playList: PlaylistItem[]; setPlayList: any }) {
  const { data } = useContext(ReferenceDataContext);
  const [apiInfo, setApiInfo] = useState<Api>(ApiDefault);

  // config api delay
  const [timeLeft, setTimeLeft] = useState(0); // time ran
  const [timeLeftLife, setTimeLeftLife] = useState(API_DELAY_TIME); // timer running
  const timeDelayApi = API_DELAY_TIME;

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setApiInfo(data);
  }, [data]);

//   useEffect(() => {
//     console.log("change");
//   }, [props.idSelected, props.playList]);

  useEffect(() => {
    if (!Number.isNaN(props.idSelected) && !isLoading) {
      loadMp3();
    }
  }, [props.idSelected, props.playList, apiInfo, isLoading]);

  async function loadMp3() {
    let needLoadMore = false;
    let indexCurrent = 0;
    let arrPromise = new Array();
    let arrIndex = new Array();
    props.playList.forEach((item, index) => {
      if (item.id == props.idSelected) {
        needLoadMore = true;
      }
      // load truoc cac ban ghi tiep theo
      if (needLoadMore && indexCurrent < MAX_LOAD_FILE_IN_TIME - 1) {
        indexCurrent++;
        if (item.uri == null || item.uri == undefined || item.uri == "") {
          // setLoading(true);
          arrPromise.push(getMp3File(item.name, null, indexCurrent * 1000));
          arrIndex.push(index);
        }
      }
    });
    if (arrPromise.length > 0) {
      setLoading(true);
      Promise.all(arrPromise).then((values) => {
        values.forEach((id, index) => {
          if (id) {
            props.playList[arrIndex[index]].uri = apiInfo.urlAudio + "/" + id;
          }
        });
        props.setPlayList(props.playList);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((t) => t + 10);
    }, 10);
    return () => clearInterval(intervalId);
  }, [timeLeftLife]);

  const getMp3File = async (text: any, signal: any, timeNeedWait: any): Promise<any> => {
    // let timeNeedWait =
    //     timeDelayApi - timeLeft <= 0 ? 0 : timeDelayApi - timeLeft;
    // console.log("Waiting %s ms before call api", timeNeedWait);
    // await delay(timeNeedWait);
    // setTimeLeft(0);
    // setTimeLeftLife(0);
    // return new Promise((resolveInner) => {
    //     setTimeout(() => resolveInner('fake id'), 1000);
    //   });
    return new Promise((resolveInner) => {
      delay(timeNeedWait).then(() => resolveInner(callApiGetMp3(text, signal, apiInfo)));
    });
  };

  return <></>;
}
