import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";

const ReferenceDataContext = React.createContext({
    data: {}, 
    setData: (data: any) => {}
});

function ReferenceDataContextProvider(props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }) {
  const [data, setData] = React.useState({
    id: 0,
    url: "https://freetts.com/Home/PlayAudio",
    urlAudio: "https://freetts.com/audio",
    queryString: JSON.stringify({
      Language: "vi-VN",
      Voice: "vi-VN-Standard-A",
      TextMessage: '${textsearch}',
      type: 0,
    }),
    body: "",
    method: "POST",
  });

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const idStr = await AsyncStorage.getItem("active");
      if (idStr != undefined && !isNaN(idStr)) {
        let id = Number(idStr);
        const jsonValue = await AsyncStorage.getItem("configs");
        let jsonObj = jsonValue != null ? JSON.parse(jsonValue) : {};
        setData(jsonObj[id]);
      }
    } catch (e) {
      // saving error
    }
  };

  return (
    <ReferenceDataContext.Provider value={{ data, setData }}>
      {props.children}
    </ReferenceDataContext.Provider>
  );
}

export { ReferenceDataContext, ReferenceDataContextProvider };
