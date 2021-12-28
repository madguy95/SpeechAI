
export declare type Api = {
    id: number,
    url: string,
    urlAudio: string,
    queryString: string,
    body: string,
    method: string
}

export const ApiDefault: Api = {
    id: 0,
    url: "https://freetts.com/Home/PlayAudio",
    urlAudio: "https://freetts.com/audio",
    queryString: JSON.stringify({
      Language: "vi-VN",
      Voice: "vi-VN-Standard-A",
      TextMessage: "${textsearch}",
      type: 0,
    }),
    body: "",
    method: "POST",
}