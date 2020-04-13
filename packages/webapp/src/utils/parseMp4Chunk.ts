import MP4Box from "mp4box";

export interface IMP4Track {
  codec: string;
}

export interface IMP4Info {
  tracks: IMP4Track[];
}

export const parseMp4Chunk: (data: any) => Promise<IMP4Info> = data => {
  return new Promise((resolve, reject) => {
    const buffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength
    );

    buffer.fileStart = 0;

    const mp4boxfile = MP4Box.createFile();

    mp4boxfile.onError = (error: Error) => reject(error);

    mp4boxfile.onReady = (mediaInfo: IMP4Info) => resolve(mediaInfo);

    mp4boxfile.appendBuffer(buffer);

    mp4boxfile.flush();
  });
};