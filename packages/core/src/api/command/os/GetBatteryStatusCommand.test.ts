import { Command } from "@api/command/Command";
import {
  InvalidBatteryStatusTypeError,
  InvalidStatusWordError,
} from "@api/command/Errors";
import { ApduResponse } from "@api/device-session/ApduResponse";

import {
  BatteryStatusType,
  ChargingMode,
  GetBatteryStatusCommand,
  GetBatteryStatusResponse,
} from "./GetBatteryStatusCommand";

const GET_BATTERY_STATUS_APDU_PERCENTAGE = Uint8Array.from([
  0xe0, 0x10, 0x00, 0x00, 0x00,
]);
const GET_BATTERY_STATUS_APDU_VOLTAGE = Uint8Array.from([
  0xe0, 0x10, 0x00, 0x01, 0x00,
]);
const GET_BATTERY_STATUS_APDU_TEMPERATURE = Uint8Array.from([
  0xe0, 0x10, 0x00, 0x02, 0x00,
]);
const GET_BATTERY_STATUS_APDU_CURRENT = Uint8Array.from([
  0xe0, 0x10, 0x00, 0x03, 0x00,
]);
const GET_BATTERY_STATUS_APDU_FLAGS = Uint8Array.from([
  0xe0, 0x10, 0x00, 0x04, 0x00,
]);

const PERCENTAGE_RESPONSE_HEX = Uint8Array.from([0x37, 0x90, 0x00]);
const VOLTAGE_RESPONSE_HEX = Uint8Array.from([0x0f, 0xff, 0x90, 0x00]);
const TEMPERATURE_RESPONSE_HEX = Uint8Array.from([0x10, 0x90, 0x00]);
const FLAGS_RESPONSE_HEX = Uint8Array.from([
  0x00, 0x00, 0x00, 0x0f, 0x90, 0x00,
]);
const FAILED_RESPONSE_HEX = Uint8Array.from([0x67, 0x00]);

describe("GetBatteryStatus", () => {
  let command: Command<GetBatteryStatusResponse, BatteryStatusType>;

  beforeEach(() => {
    command = new GetBatteryStatusCommand();
  });

  describe("getApdu", () => {
    it("should return the GetBatteryStatus APUD", () => {
      expect(
        command.getApdu(BatteryStatusType.BATTERY_PERCENTAGE).getRawApdu(),
      ).toStrictEqual(GET_BATTERY_STATUS_APDU_PERCENTAGE);
      expect(
        command.getApdu(BatteryStatusType.BATTERY_VOLTAGE).getRawApdu(),
      ).toStrictEqual(GET_BATTERY_STATUS_APDU_VOLTAGE);
      expect(
        command.getApdu(BatteryStatusType.BATTERY_TEMPERATURE).getRawApdu(),
      ).toStrictEqual(GET_BATTERY_STATUS_APDU_TEMPERATURE);
      expect(
        command.getApdu(BatteryStatusType.BATTERY_CURRENT).getRawApdu(),
      ).toStrictEqual(GET_BATTERY_STATUS_APDU_CURRENT);
      expect(
        command.getApdu(BatteryStatusType.BATTERY_FLAGS).getRawApdu(),
      ).toStrictEqual(GET_BATTERY_STATUS_APDU_FLAGS);
    });
  });
  describe("parseResponse", () => {
    it("should parse the response when querying percentage", () => {
      const PERCENTAGE_RESPONSE = new ApduResponse({
        statusCode: PERCENTAGE_RESPONSE_HEX.slice(-2),
        data: PERCENTAGE_RESPONSE_HEX.slice(0, -2),
      });
      command.getApdu(BatteryStatusType.BATTERY_PERCENTAGE);
      const parsed = command.parseResponse(PERCENTAGE_RESPONSE);
      expect(parsed).toStrictEqual(55);
    });
    it("should parse the response when querying voltage", () => {
      const VOLTAGE_RESPONSE = new ApduResponse({
        statusCode: VOLTAGE_RESPONSE_HEX.slice(-2),
        data: VOLTAGE_RESPONSE_HEX.slice(0, -2),
      });
      command.getApdu(BatteryStatusType.BATTERY_VOLTAGE);
      const parsed = command.parseResponse(VOLTAGE_RESPONSE);
      expect(parsed).toStrictEqual(4095);
    });
    it("should parse the response when querying temperature", () => {
      const TEMPERATURE_RESPONSE = new ApduResponse({
        statusCode: TEMPERATURE_RESPONSE_HEX.slice(-2),
        data: TEMPERATURE_RESPONSE_HEX.slice(0, -2),
      });
      command.getApdu(BatteryStatusType.BATTERY_TEMPERATURE);
      const parsed = command.parseResponse(TEMPERATURE_RESPONSE);
      expect(parsed).toStrictEqual(16);
    });
    it("should parse the response when querying flags", () => {
      const FLAGS_RESPONSE = new ApduResponse({
        statusCode: FLAGS_RESPONSE_HEX.slice(-2),
        data: FLAGS_RESPONSE_HEX.slice(0, -2),
      });
      command.getApdu(BatteryStatusType.BATTERY_FLAGS);
      const parsed = command.parseResponse(FLAGS_RESPONSE);
      expect(parsed).toStrictEqual({
        charging: ChargingMode.USB,
        issueCharging: false,
        issueTemperature: false,
        issueBattery: false,
      });
    });
    it("should not parse the response when getApdu not called", () => {
      const PERCENTAGE_RESPONSE = new ApduResponse({
        statusCode: PERCENTAGE_RESPONSE_HEX.slice(-2),
        data: PERCENTAGE_RESPONSE_HEX.slice(0, -2),
      });
      expect(() => command.parseResponse(PERCENTAGE_RESPONSE)).toThrow(
        InvalidBatteryStatusTypeError,
      );
    });
    it("should throw an error if the response returned unsupported format", () => {
      const FAILED_RESPONSE = new ApduResponse({
        statusCode: FAILED_RESPONSE_HEX.slice(-2),
        data: FAILED_RESPONSE_HEX.slice(0, -2),
      });
      command.getApdu(BatteryStatusType.BATTERY_PERCENTAGE);
      expect(() => command.parseResponse(FAILED_RESPONSE)).toThrow(
        InvalidStatusWordError,
      );
    });
  });
});
