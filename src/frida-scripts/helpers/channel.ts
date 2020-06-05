import { Syscall } from "../../shared/types";

let i = 1;
export interface SyscallChannel {
  channel: number;
  syscall: Syscall;
}

export const createChannel = () => {
  return i++;
};

interface Channel {
  [chanNum: number]: Syscall;
}

const channels: Channel = {};
export const channel = async (
  args: InvocationArguments
): Promise<InvocationArguments> => {
  return args;
};

export const setChannel = (channel: number, data: Syscall) => {
  channels[channel] = data;
};

export const getSyscallByChannel = (channel: number): Syscall | null => {
  const resp = channels[channel];
  if (!resp) {
    return null;
  }

  return resp;
};

export const deleteChannel = (channel: number) => {
  delete channels[channel];
};
