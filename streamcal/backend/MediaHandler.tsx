import { IContentInfo, IEpisode } from "../components/constants/interfaces";

function getEpisodeByEpisdeNum(Episodes?: Array<IEpisode>, EpisodeNum?: any): IEpisode | undefined {
  if (!Episodes) return undefined;

  for (let index = 0; index < Episodes.length; index++) {
    if (Episodes?.[index]?.EpisodeNum == EpisodeNum) return Episodes?.[index];
  }
  return undefined;
}

function getContentInfoByContentID(
  ContentInfo?: Array<IContentInfo>,
  ContentID?: any
): IContentInfo | undefined {
  if (!ContentInfo) return undefined;

  for (let index = 0; index < ContentInfo.length; index++) {
    if (ContentInfo?.[index].ID == ContentID) return ContentInfo?.[index];
  }
  return undefined;
}

function getIndexByEpisodeNum(Episodes?: Array<IEpisode>, EpisodeNum?: any): any | undefined {
  if (!Episodes) return undefined;

  for (let index = 0; index < Episodes.length; index++) {
    if (Episodes[index].EpisodeNum == EpisodeNum) return index;
  }
  return undefined;
}

export { getEpisodeByEpisdeNum, getContentInfoByContentID, getIndexByEpisodeNum };
