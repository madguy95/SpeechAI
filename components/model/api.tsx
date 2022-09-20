
export declare type Api = {
    id: number,
    url: string,
    urlAudio: string,
    queryString: string,
    body: string,
    method: string,
    content: any[]
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

export class PlaylistItem {
  id: string;
  uri: string;
  name: any;
  thumbnailUrl: string | undefined;
  title: any;
  isVideo: boolean;
  constructor(id: any , name: any, uri: string, isVideo: any) {
    this.id = id;
    this.name = name;
    this.uri = uri;
    this.isVideo = isVideo;
  }
}
