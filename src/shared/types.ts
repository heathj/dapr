export interface IoctlEvent {
  syscall: SyscallType;
  fd: number;
  driverName: string;
  mode: Mode;
  size: number;
  opcode: number;
  request: string;
  retval: number;
  start: number;
  end: number;
}

export interface OpenEvent {
  syscall: SyscallType;
  driverName: string;
  mode: Mode;
  retval: number;
  start: number;
  end: number;
}

export interface Process {
  pid: number;
  name: string;
  cmd: string;
  ppid: number;
  uid: number;
  cpu: number;
  memory: number;
}

export interface SocketEvent {
  syscall: SyscallType;
  domain: number;
  type: number;
  protocol: number;
  retval: number;
  start: number;
  end: number;
}

export enum SyscallType {
  OPEN,
  CLOSE,
  SOCKET,
  IOCTL
}

export interface Syscall {
  type: string;
  syscall: SyscallType;
  fd: number;
  request: number;
  data: number[];
}

export interface CloseEvent {
  syscall: SyscallType;
  fd: number;
  retval: number;
  start: number;
  end: number;
}

export enum Mode {
  READ,
  WRITE,
  READ_WRITE,
  UNSURE
}

export interface User {
  name: string;
  expired: number;
}
