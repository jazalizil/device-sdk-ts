import { FrameHeader } from "@internal/device-session/model/FrameHeader";

type FrameConstructorArgs = {
  header: FrameHeader;
  data: Uint8Array;
};

export class Frame {
  protected _header: FrameHeader;
  protected _data: Uint8Array;
  constructor({ header, data }: FrameConstructorArgs) {
    this._header = header;
    this._data = data;
  }
  toString(): string {
    return JSON.stringify(
      {
        header: this._header.toString(),
        data: this._data.toString(),
      },
      null,
      2,
    );
  }
  getRawData(): Uint8Array {
    const headerRaw = this._header.getRawData();
    const raw = new Uint8Array(headerRaw.length + this._data.length);

    raw.set(headerRaw, 0);
    raw.set(this._data, headerRaw.length);
    return raw;
  }
}
