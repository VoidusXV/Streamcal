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

interface ICurrentContentInfo {
  Cover?: any;
  Description?: any;
  Title?: any;
  ID?: any;
}

interface IMediaData {
  Movies?: any;
  Series?: {
    Seasons?: [
      {
        Episodes?: [
          {
            Description?: any;
            Duration?: any;
            Episode?: any;
            Path?: any;
            Thumbnail?: any;
            Title?: any;
          }
        ];
        SeasonNum?: any;
      }
    ];
  };
}

interface IGeneratedImages {
  zoomImageIndex: any;
  zoomImageURI: any;
}
export { IUserInfo, IServerInfo, ICurrentContentInfo, IMediaData, IGeneratedImages };
