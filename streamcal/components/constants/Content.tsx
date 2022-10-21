import { IContentInfo, IMediaDataIdentifier } from "./interfaces";

interface I_gContent {
  data: Array<IContentInfo>;
  mediaData: Array<IMediaDataIdentifier>;
}
let gContent: I_gContent = { data: [], mediaData: [] };

export { gContent };
