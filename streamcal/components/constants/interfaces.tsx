interface IUserInfo {
  APIKEY?: any;
  Enabled?: any;
  FirstLogin?: any;
  LastLogin?: any;
  History?: any;
  DeviceID?: any;
  Description?: any;
}

interface IServerInfo {
  Description?: any;
  APIKEY?: any;
  Server?: any;
  Port?: any;
  AdminKey?: any;
  isAdmin?: any;
}

interface IContentInfo {
  ID?: any;
  Description?: any;
  Title?: any;
  Availability?: any;
  Genre?: any;
  Started?: any;
  Ended?: any;
  Director?: any;
  Producer?: any;
}

interface ICurrentContentInfo {
  Cover?: any;
  Description?: any;
  Title?: any;
  ID?: any;
}

interface IEpisode {
  Description?: any;
  Duration?: any;
  EpisodeNum?: any;
  Path?: any;
  Thumbnail?: any;
  Title?: any;
}
interface ISeason {
  Episodes?: Array<IEpisode>;
  SeasonNum?: any;
}

interface ISeries {
  Seasons?: Array<ISeason>;
}
interface IMediaData {
  Movies?: any;
  Series?: ISeries;
}

interface IGeneratedImages {
  zoomImageIndex: any;
  zoomImageURI: any;
}

interface IMediaDataIdentifier {
  contentID: any;
  mediaData?: IMediaData;
}

interface IWatchTimeLocationData {
  SeasonNum?: any;
  EpisodeNum?: any;
  WatchedDuration?: any;
}

interface IWatchTime {
  ContentID?: any;
  Locations?: Array<IWatchTimeLocationData>;
}

export {
  IUserInfo,
  IServerInfo,
  IContentInfo,
  ICurrentContentInfo,
  IMediaData,
  IGeneratedImages,
  ISeries,
  IEpisode,
  IMediaDataIdentifier,
  IWatchTime,
  ISeason,
};
