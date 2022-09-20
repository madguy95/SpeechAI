/**
 * @flow
 */

import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { Asset } from "expo-asset";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS, ResizeMode, Video } from "expo-av";
import * as Font from "expo-font";
import Slider from "@react-native-community/slider";

import { MaterialIcons } from "@expo/vector-icons";
import ListItemPlay from "../components/data/ListItemPlay";

class Icon {
  module: any;
  width: number;
  height: number;
  constructor(module: any, width: number, height: number) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

// class PlaylistItem {
//   name: string;
//   uri: string;
//   isVideo: boolean;
//   constructor(id: number, name: string, uri: string, isVideo: boolean) {
//     this.name = name;
//     this.uri = uri;
//     this.isVideo = isVideo;
//   }
// }

const PLAYLIST = [
  new PlaylistItem(0, "Comfort Fit - “Sorry”", "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3", false),
  // new PlaylistItem(
  //   "Big Buck Bunny",
  //   "http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
  //   true
  // ),
  new PlaylistItem(1, "Mildred Bailey – “All Of Me”", "https://ia800304.us.archive.org/34/items/PaulWhitemanwithMildredBailey/PaulWhitemanwithMildredBailey-AllofMe.mp3", false),
  // new PlaylistItem(
  //   "Popeye - I don't scare",
  //   "https://ia800501.us.archive.org/11/items/popeye_i_dont_scare/popeye_i_dont_scare_512kb.mp4",
  //   true
  // ),
  new PlaylistItem(2, "Podington Bear - “Rubber Robot”", "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Podington_Bear_-_Rubber_Robot.mp3", false),
];

const ICON_THROUGH_EARPIECE = "speaker-phone";
const ICON_THROUGH_SPEAKER = "speaker";

const ICON_PLAY_BUTTON = new Icon(require("../assets/images/play_button.png"), 34, 51);
const ICON_PAUSE_BUTTON = new Icon(require("../assets/images/pause_button.png"), 34, 51);
const ICON_STOP_BUTTON = new Icon(require("../assets/images/stop_button.png"), 22, 22);
const ICON_FORWARD_BUTTON = new Icon(require("../assets/images/forward_button.png"), 33, 25);
const ICON_BACK_BUTTON = new Icon(require("../assets/images/back_button.png"), 33, 25);

const ICON_LOOP_ALL_BUTTON = new Icon(require("../assets/images/loop_all_button.png"), 77, 35);
const ICON_LOOP_ONE_BUTTON = new Icon(require("../assets/images/loop_one_button.png"), 77, 35);

const ICON_MUTED_BUTTON = new Icon(require("../assets/images/muted_button.png"), 67, 58);
const ICON_UNMUTED_BUTTON = new Icon(require("../assets/images/unmuted_button.png"), 67, 58);

const ICON_TRACK_1 = new Icon(require("../assets/images/track_1.png"), 166, 5);
const ICON_THUMB_1 = new Icon(require("../assets/images/thumb_1.png"), 18, 19);
const ICON_THUMB_2 = new Icon(require("../assets/images/thumb_2.png"), 15, 19);

const LOOPING_TYPE_ALL = 0;
const LOOPING_TYPE_ONE = 1;
const LOOPING_TYPE_ICONS = { 0: ICON_LOOP_ALL_BUTTON, 1: ICON_LOOP_ONE_BUTTON };

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
console.log(DEVICE_WIDTH, DEVICE_HEIGHT);
const BACKGROUND_COLOR = "#FFF8ED";
const DISABLED_OPACITY = 0.5;
const FONT_SIZE = 14;
const LOADING_STRING = "... loading ...";
const BUFFERING_STRING = "...buffering...";
const RATE_SCALE = 3.0;
const VIDEO_CONTAINER_HEIGHT = (DEVICE_HEIGHT * 2.0) / 5.0 - FONT_SIZE * 2;
import { ReferenceDataContext } from "../components/share/ReferenceDataContext";
import { truncate } from "../components/util";
import { DataBatch } from "../components/data/DataBatch";
import { Sound } from "expo-av/build/Audio";
import { PlaylistItem } from "../components/model/api";

type MyProps = {};
type MyState = {
  showVideo: boolean;
  playbackInstanceName: string;
  loopingType: number;
  muted: boolean;
  playbackInstancePosition: number | null;
  playbackInstanceDuration: number | null;
  shouldPlay: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  isLoading: boolean;
  fontLoaded: boolean;
  shouldCorrectPitch: boolean;
  volume: 1.0;
  rate: 1.0;
  videoWidth: number;
  videoHeight: number;
  poster: boolean;
  useNativeControls: boolean;
  fullscreen: boolean;
  throughEarpiece: boolean;
  playList: PlaylistItem[];
  content: [];
};
export default class AppPlay extends React.Component<MyProps, MyState> {
  static contextType = ReferenceDataContext;
  index: number;
  isSeeking: boolean;
  shouldPlayAtEndOfSeek: boolean;
  playbackInstance: Sound | any;
  _video: any;

  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.index = 0;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.playbackInstance = null;
    this.state = {
      showVideo: false,
      playbackInstanceName: LOADING_STRING,
      loopingType: LOOPING_TYPE_ALL,
      muted: false,
      playbackInstancePosition: null,
      playbackInstanceDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isBuffering: false,
      isLoading: true,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
      videoWidth: DEVICE_WIDTH,
      videoHeight: VIDEO_CONTAINER_HEIGHT,
      poster: false,
      useNativeControls: false,
      fullscreen: false,
      throughEarpiece: false,
      playList: PLAYLIST,
      content: [],
    };
  }

  componentDidMount() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });
    (async () => {
      await Font.loadAsync({
        ...MaterialIcons.font,
        "cutive-mono-regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
      });
      this.setState({ fontLoaded: true });
    })();
    this._loadNewPlaybackInstance(false);
    // console.log(this.context?.data?.content ? 'DIDMOUNT' : '');
  }

  componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void {
    // console.log(this.context?.data?.content ? 'DidUpdate' : '');
    if (this.context.data.content && JSON.stringify(this.context.data.content) != JSON.stringify(this.state.content)) {
      const arrPlay = new Array();
      // arrPlay.push(...PLAYLIST);
      this.context.data.content.forEach((item: string, index: number) => {
        arrPlay.push(
          new PlaylistItem(
            index,
            item,
            "", //https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3",
            false
          )
        );
      });
      // if (JSON.stringify(arrPlay) != JSON.stringify(this.state.playList)) {
      this.setState({ playList: arrPlay, content: this.context.data.content });
      // reset lai trang thai player khi load text moi
      this._onStopPressed();
      this._loadNewPlaybackInstance(false);
      // }
    }
  }

  async setPlayList(playListArr: any) {
    this.setState({ playList: playListArr });
    if (this.playbackInstance == null) {
      const source = { uri: this.state.playList[this.index].uri };
      const initialStatus = {
        shouldPlay: this.state.shouldPlay,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
        volume: this.state.volume,
        isMuted: this.state.muted,
        isLooping: this.state.loopingType === LOOPING_TYPE_ONE,
        // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
        // androidImplementation: 'MediaPlayer',
      };

      if (this.state.playList[this.index].isVideo) {
        await this._video.loadAsync(source, initialStatus);
        // this._video.onPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
        this.playbackInstance = this._video;
        const status = await this._video.getStatusAsync();
      } else {
        const { sound, status } = await Audio.Sound.createAsync(source, initialStatus, this._onPlaybackStatusUpdate);
        this.playbackInstance = sound;
      }

      this._updateScreenForLoading(false);
    }
  }

  async _loadNewPlaybackInstance(playing: boolean) {
    if (this.playbackInstance != null) {
      await this.playbackInstance.unloadAsync();
      // this.playbackInstance.setOnPlaybackStatusUpdate(null);
      this.playbackInstance = null;
    }
    // neu uri chua dc load thi chua play
    if (this.state.playList[this.index].uri && this.state.playList[this.index].uri != "") {
      const source = { uri: this.state.playList[this.index].uri };
      const initialStatus = {
        shouldPlay: playing,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
        volume: this.state.volume,
        isMuted: this.state.muted,
        isLooping: this.state.loopingType === LOOPING_TYPE_ONE,
        // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
        // androidImplementation: 'MediaPlayer',
      };

      if (this.state.playList[this.index].isVideo) {
        await this._video.loadAsync(source, initialStatus);
        // this._video.onPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
        this.playbackInstance = this._video;
        const status = await this._video.getStatusAsync();
      } else {
        const { sound, status } = await Audio.Sound.createAsync(source, initialStatus, this._onPlaybackStatusUpdate);
        this.playbackInstance = sound;
      }

      this._updateScreenForLoading(false);
    } else {
      this.setState({ isLoading: true });
    }
  }

  _mountVideo = (component: any) => {
    this._video = component;
    this._loadNewPlaybackInstance(false);
  };

  _updateScreenForLoading(isLoading: boolean) {
    if (isLoading) {
      this.setState({
        showVideo: false,
        isPlaying: false,
        playbackInstanceName: LOADING_STRING,
        playbackInstanceDuration: null,
        playbackInstancePosition: null,
        isLoading: true,
      });
    } else {
      this.setState({
        playbackInstanceName: this.state.playList[this.index].name,
        showVideo: this.state.playList[this.index].isVideo,
        isLoading: false,
      });
    }
  }

  _onPlaybackStatusUpdate = (status: {
    isLoaded: any;
    positionMillis: any;
    durationMillis: any;
    shouldPlay: any;
    isPlaying: any;
    isBuffering: any;
    rate: any;
    isMuted: any;
    volume: any;
    isLooping: any;
    shouldCorrectPitch: any;
    didJustFinish: any;
    error: any;
  } | any) => {
    if (status.isLoaded) {
      this.setState({
        playbackInstancePosition: status.positionMillis,
        playbackInstanceDuration: status.durationMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        loopingType: status.isLooping ? LOOPING_TYPE_ONE : LOOPING_TYPE_ALL,
        shouldCorrectPitch: status.shouldCorrectPitch,
      });
      if (status.didJustFinish && !status.isLooping) {
        this._advanceIndex(true);
        this._updatePlaybackInstanceForIndex(true);
      }
    } else {
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _onLoadStart = () => {
    console.log(`ON LOAD START`);
  };

  _onLoad = (status: any) => {
    console.log(`ON LOAD : ${JSON.stringify(status)}`);
  };

  _onError = (error: any) => {
    console.log(`ON ERROR : ${error}`);
  };

  _onReadyForDisplay = (event: { naturalSize: { height: number; width: number } }) => {
    const widestHeight = (DEVICE_WIDTH * event.naturalSize.height) / event.naturalSize.width;
    if (widestHeight > VIDEO_CONTAINER_HEIGHT) {
      this.setState({
        videoWidth: (VIDEO_CONTAINER_HEIGHT * event.naturalSize.width) / event.naturalSize.height,
        videoHeight: VIDEO_CONTAINER_HEIGHT,
      });
    } else {
      this.setState({
        videoWidth: DEVICE_WIDTH,
        videoHeight: (DEVICE_WIDTH * event.naturalSize.height) / event.naturalSize.width,
      });
    }
  };

  _onFullscreenUpdate = (event: { fullscreenUpdate: any }) => {
    console.log(`FULLSCREEN UPDATE : ${JSON.stringify(event.fullscreenUpdate)}`);
  };

  _advanceIndex(forward: boolean) {
    this.index = (this.index + (forward ? 1 : this.state.playList.length - 1)) % this.state.playList.length;
  }

  async _updatePlaybackInstanceForIndex(playing: boolean) {
    this._updateScreenForLoading(true);

    this.setState({
      videoWidth: DEVICE_WIDTH,
      videoHeight: VIDEO_CONTAINER_HEIGHT,
    });

    this._loadNewPlaybackInstance(playing);
  }

  _onPlayPausePressed = () => {
    if (this.playbackInstance != null) {
      if (this.state.isPlaying) {
        this.playbackInstance.pauseAsync();
      } else {
        this.playbackInstance.playAsync();
      }
    }
  };

  _onStopPressed = () => {
    if (this.playbackInstance != null) {
      this.playbackInstance.stopAsync();
    }
  };

  _onForwardPressed = () => {
    if (this.playbackInstance != null) {
      this._advanceIndex(true);
      this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
    }
  };

  _onBackPressed = () => {
    if (this.playbackInstance != null) {
      this._advanceIndex(false);
      this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
    }
  };

  _onMutePressed = () => {
    if (this.playbackInstance != null) {
      this.playbackInstance.setIsMutedAsync(!this.state.muted);
    }
  };

  _onLoopPressed = () => {
    if (this.playbackInstance != null) {
      this.playbackInstance.setIsLoopingAsync(this.state.loopingType !== LOOPING_TYPE_ONE);
    }
  };

  _onVolumeSliderValueChange = (value: any) => {
    if (this.playbackInstance != null) {
      this.playbackInstance.setVolumeAsync(value);
    }
  };

  _trySetRate = async (rate: number, shouldCorrectPitch: boolean) => {
    if (this.playbackInstance != null) {
      try {
        await this.playbackInstance.setRateAsync(rate, shouldCorrectPitch);
      } catch (error) {
        // Rate changing could not be performed, possibly because the client's Android API is too old.
      }
    }
  };

  _onRateSliderSlidingComplete = async (value: number) => {
    this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
  };

  _onPitchCorrectionPressed = async (value: any) => {
    this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
  };

  _onSeekSliderValueChange = (value: any) => {
    if (this.playbackInstance != null && !this.isSeeking) {
      this.isSeeking = true;
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.playbackInstance.pauseAsync();
    }
  };

  _onSeekSliderSlidingComplete = async (value: number) => {
    if (this.playbackInstance != null) {
      this.isSeeking = false;
      const seekPosition = value * (this.state.playbackInstanceDuration ||  0);
      if (this.shouldPlayAtEndOfSeek) {
        this.playbackInstance.playFromPositionAsync(seekPosition);
      } else {
        this.playbackInstance.setPositionAsync(seekPosition);
      }
    }
  };

  _getSeekSliderPosition() {
    if (this.playbackInstance != null && this.state.playbackInstancePosition != null && this.state.playbackInstanceDuration != null) {
      return this.state.playbackInstancePosition / this.state.playbackInstanceDuration;
    }
    return 0;
  }

  _getMMSSFromMillis(millis: number) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = (number: number) => {
      const string = number.toString();
      if (number < 10) {
        return "0" + string;
      }
      return string;
    };
    return padWithZero(minutes) + ":" + padWithZero(seconds);
  }

  _getTimestamp() {
    if (this.playbackInstance != null && this.state.playbackInstancePosition != null && this.state.playbackInstanceDuration != null) {
      return `${this._getMMSSFromMillis(this.state.playbackInstancePosition)} / ${this._getMMSSFromMillis(this.state.playbackInstanceDuration)}`;
    }
    return "";
  }

  _onPosterPressed = () => {
    this.setState({ poster: !this.state.poster });
  };

  _onUseNativeControlsPressed = () => {
    this.setState({ useNativeControls: !this.state.useNativeControls });
  };

  _onFullscreenPressed = () => {
    try {
      this._video.presentFullscreenPlayer();
    } catch (error) {
      console.log(error);
    }
  };

  _onSpeakerPressed = () => {
    this.setState(
      (state) => {
        return { throughEarpiece: !state.throughEarpiece };
      },
      () =>
        Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: this.state.throughEarpiece,
        })
    );
  };

  _onChangeSelect = (id: any) => {
    if (this.playbackInstance != null) {
      this.index = id;
      this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
    }
  };

  render() {
    // console.log(this.context?.data?.content ? 'render' : '');
    return !this.state.fontLoaded ? (
      <View style={styles.emptyContainer} />
    ) : (
      <View style={styles.container}>
        <View />
        <View style={styles.nameContainer}>
          <Text style={[styles.text, { fontFamily: "cutive-mono-regular" }]}>{this.state.playbackInstanceName}</Text>
        </View>
        <View style={styles.space} />
        <View style={styles.videoContainer}>
          <View
            style={{
              width: this.state.videoWidth,
              height: this.state.videoHeight,
            }}
          >
            {/* <Video
            ref={this._mountVideo}
            style={[
              styles.video,
              {
                opacity: this.state.showVideo ? 1.0 : 0.0,
                width: this.state.videoWidth,
                height: this.state.videoHeight
              }
            ]}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={this._onPlaybackStatusUpdate}
            onLoadStart={this._onLoadStart}
            onLoad={this._onLoad}
            onError={this._onError}
            onFullscreenUpdate={this._onFullscreenUpdate}
            onReadyForDisplay={this._onReadyForDisplay}
            useNativeControls={this.state.useNativeControls}
          /> */}
            <ListItemPlay data={this.state.playList} onChange={this._onChangeSelect} idSelected={this.index}></ListItemPlay>
            <DataBatch content="" idSelected={this.index} playList={this.state.playList} setPlayList={this.setPlayList.bind(this)}></DataBatch>
          </View>
        </View>
        <View
          style={[
            styles.playbackContainer,
            {
              opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
            },
          ]}
        >
          <Slider
            style={styles.playbackSlider}
            trackImage={ICON_TRACK_1.module}
            thumbImage={ICON_THUMB_1.module}
            value={this._getSeekSliderPosition()}
            onValueChange={this._onSeekSliderValueChange}
            onSlidingComplete={this._onSeekSliderSlidingComplete}
            disabled={this.state.isLoading}
          />
          <View style={styles.timestampRow}>
            <Text style={[styles.text, styles.buffering, { fontFamily: "cutive-mono-regular" }]}>{this.state.isBuffering ? BUFFERING_STRING : ""}</Text>
            <Text style={[styles.text, styles.timestamp, { fontFamily: "cutive-mono-regular" }]}>{this._getTimestamp()}</Text>
          </View>
        </View>
        <View
          style={[
            styles.buttonsContainerBase,
            styles.buttonsContainerTopRow,
            {
              opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
            },
          ]}
        >
          <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onBackPressed} disabled={this.state.isLoading}>
            <Image style={styles.button} source={ICON_BACK_BUTTON.module} />
          </TouchableHighlight>
          <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onPlayPausePressed} disabled={this.state.isLoading}>
            <Image style={styles.button} source={this.state.isPlaying ? ICON_PAUSE_BUTTON.module : ICON_PLAY_BUTTON.module} />
          </TouchableHighlight>
          <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onStopPressed} disabled={this.state.isLoading}>
            <Image style={styles.button} source={ICON_STOP_BUTTON.module} />
          </TouchableHighlight>
          <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onForwardPressed} disabled={this.state.isLoading}>
            <Image style={styles.button} source={ICON_FORWARD_BUTTON.module} />
          </TouchableHighlight>
        </View>
        <View style={[styles.buttonsContainerBase, styles.buttonsContainerMiddleRow]}>
          <View style={styles.volumeContainer}>
            <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onMutePressed}>
              <Image style={styles.button} source={this.state.muted ? ICON_MUTED_BUTTON.module : ICON_UNMUTED_BUTTON.module} />
            </TouchableHighlight>
            <Slider style={styles.volumeSlider} trackImage={ICON_TRACK_1.module} thumbImage={ICON_THUMB_2.module} value={1} onValueChange={this._onVolumeSliderValueChange} />
          </View>
          <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onLoopPressed}>
            <Image style={styles.button} source={LOOPING_TYPE_ICONS[this.state.loopingType as keyof typeof LOOPING_TYPE_ICONS].module} />
          </TouchableHighlight>
        </View>
        <View style={[styles.buttonsContainerBase, styles.buttonsContainerBottomRow]}>
          <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={() => this._trySetRate(1.0, this.state.shouldCorrectPitch)}>
            <View style={styles.button}>
              <Text style={[styles.text, { fontFamily: "cutive-mono-regular" }]}>Rate:</Text>
            </View>
          </TouchableHighlight>
          <Slider
            style={styles.rateSlider}
            trackImage={ICON_TRACK_1.module}
            thumbImage={ICON_THUMB_1.module}
            value={this.state.rate / RATE_SCALE}
            onSlidingComplete={this._onRateSliderSlidingComplete}
          />
          <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onPitchCorrectionPressed}>
            <View style={styles.button}>
              <Text style={[styles.text, { fontFamily: "cutive-mono-regular" }]}>PC: {this.state.shouldCorrectPitch ? "yes" : "no"}</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this._onSpeakerPressed} underlayColor={BACKGROUND_COLOR}>
            <MaterialIcons name={this.state.throughEarpiece ? ICON_THROUGH_EARPIECE : ICON_THROUGH_SPEAKER} size={32} color="black" />
          </TouchableHighlight>
        </View>
        <View />
        {this.state.showVideo ? (
          <View>
            <View style={[styles.buttonsContainerBase, styles.buttonsContainerTextRow]}>
              <View />
              <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onPosterPressed}>
                <View style={styles.button}>
                  <Text style={[styles.text, { fontFamily: "cutive-mono-regular" }]}>Poster: {this.state.poster ? "yes" : "no"}</Text>
                </View>
              </TouchableHighlight>
              <View />
              <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onFullscreenPressed}>
                <View style={styles.button}>
                  <Text style={[styles.text, { fontFamily: "cutive-mono-regular" }]}>Fullscreen</Text>
                </View>
              </TouchableHighlight>
              <View />
            </View>
            <View style={styles.space} />
            <View style={[styles.buttonsContainerBase, styles.buttonsContainerTextRow]}>
              <View />
              <TouchableHighlight underlayColor={BACKGROUND_COLOR} style={styles.wrapper} onPress={this._onUseNativeControlsPressed}>
                <View style={styles.button}>
                  <Text style={[styles.text, { fontFamily: "cutive-mono-regular" }]}>Native Controls: {this.state.useNativeControls ? "yes" : "no"}</Text>
                </View>
              </TouchableHighlight>
              <View />
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
  },
  wrapper: {
    // height: '100px',
    // width: '100px'
  },
  nameContainer: {
    height: FONT_SIZE,
  },
  space: {
    height: FONT_SIZE,
  },
  videoContainer: {
    height: VIDEO_CONTAINER_HEIGHT,
  },
  video: {
    maxWidth: DEVICE_WIDTH,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: ICON_THUMB_1.height * 2.0,
    maxHeight: ICON_THUMB_1.height * 2.0,
  },
  playbackSlider: {
    alignSelf: "stretch",
  },
  timestampRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    minHeight: FONT_SIZE,
  },
  text: {
    fontSize: FONT_SIZE,
    minHeight: FONT_SIZE,
  },
  buffering: {
    textAlign: "left",
    paddingLeft: 20,
  },
  timestamp: {
    textAlign: "right",
    paddingRight: 20,
  },
  button: {
    minHeight: ICON_THUMB_1.height * 2.0,
    minWidth: ICON_THUMB_1.width * 2.0,
    backgroundColor: BACKGROUND_COLOR,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonsContainerTopRow: {
    maxHeight: ICON_PLAY_BUTTON.height,
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
  buttonsContainerMiddleRow: {
    maxHeight: ICON_MUTED_BUTTON.height,
    alignSelf: "stretch",
    paddingRight: 20,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
  volumeSlider: {
    width: DEVICE_WIDTH / 2.0 - ICON_MUTED_BUTTON.width,
  },
  buttonsContainerBottomRow: {
    maxHeight: ICON_THUMB_1.height,
    alignSelf: "stretch",
    paddingRight: 20,
    paddingLeft: 20,
  },
  rateSlider: {
    width: DEVICE_WIDTH / 2.0,
  },
  buttonsContainerTextRow: {
    maxHeight: FONT_SIZE,
    alignItems: "center",
    paddingRight: 20,
    paddingLeft: 20,
    minWidth: DEVICE_WIDTH,
    maxWidth: DEVICE_WIDTH,
  },
});
