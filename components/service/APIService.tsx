import { delay, objToQueryString } from "../util";
import { Api } from "../model/api";

export async function callApiGetMp3 (text: string, signal: any, apiInfo: Api): Promise<any> {
    try {
      const queryString = apiInfo.queryString
        ? objToQueryString(
          JSON.parse(
            apiInfo.queryString
              .replace(/(\r\n|\n|\r)/gm, "")
              .replace("${textsearch}", text
               //.replaceAll(",","")
              .replaceAll("\"",""))
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


  export async function loadHtml(linkCurrent?: string): Promise<string> {
    if (!linkCurrent) {
      return '';
    }
    const response = await fetch(linkCurrent);
    const text = await response.text();
    return text;
  }