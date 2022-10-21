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
  Availability?: any;
  Description?: any;
  Genre?: any;
  ID?: any;
  Title?: any;
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
interface ISeasons {
  Episodes?: Array<IEpisode>;
  SeasonNum?: any;
}

interface ISeries {
  Seasons?: Array<ISeasons>;
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
};
