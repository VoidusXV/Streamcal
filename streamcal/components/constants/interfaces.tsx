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

export { IUserInfo, IServerInfo };
