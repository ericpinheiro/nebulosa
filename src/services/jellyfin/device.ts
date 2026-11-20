import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';

import { kv } from '../storage/kv';

const DEVICE_ID_KEY = 'device.id';

/** Id estável do aparelho, gerado na primeira abertura e mantido em MMKV. */
export function getDeviceId(): string {
  const existing = kv.getString(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = Crypto.randomUUID();
  kv.set(DEVICE_ID_KEY, id);
  return id;
}

export function getDeviceName(): string {
  return Device.deviceName ?? Device.modelName ?? 'Aparelho';
}

export function getAppVersion(): string {
  return Application.nativeApplicationVersion ?? '0.1.0';
}
