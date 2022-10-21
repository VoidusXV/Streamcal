import { IContentInfo, IMediaData } from "./interfaces";

interface I_gContent {
  data: Array<IContentInfo>;
  mediaData: Array<IMediaData>;
}
let gContent: I_gContent = { data: [], mediaData: [] };

export { gContent };
