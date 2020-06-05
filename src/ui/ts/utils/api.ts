import { Process, Syscall } from "../../../shared/types";
import { SyscallChannel } from "../../../frida-scripts/helpers/channel";

export const uninstall = async (pid: number): Promise<Response> =>
  await jsonFetch(`/session/uninstall`, {
    method: "POST",
    body: JSON.stringify({ pid: pid })
  });

export const install = async (
  pid: number,
  isInterceptorEnabled: boolean = false
): Promise<Response> =>
  await jsonFetch(`/session/install`, {
    method: "POST",
    body: JSON.stringify({ pid, adb: false, isInterceptorEnabled })
  });

export const setInterceptorFetch = async (enabled: boolean): Promise<void> => {
  await jsonFetch("/interceptor/set", {
    method: "PUT",
    body: JSON.stringify({ enabled })
  });
};

export const fetchNextInterception = async (): Promise<Syscall> => {
  const respJSON = await jsonFetch("/interceptor/next");
  const data: Syscall = await respJSON.json();
  return data;
};

export const forwardInterception = async (syscall: Syscall) => {
  await jsonFetch("/interceptor/forward", {
    method: "PUT",
    body: JSON.stringify({ syscall })
  });
};

export const fetchCurrentProcesses = async (): Promise<Process[]> => {
  const respJSON = await jsonFetch(`/procs`);
  const data: Process[] = await respJSON.json();
  return data;
};

export const fetchEvents = async (): Promise<Syscall[]> => {
  const respJSON = await jsonFetch("/events");
  const data: Syscall[] = await respJSON.json();
  return data;
};

export const daprTokenName = "dapr";
const auth = async (): Promise<string> => {
  const password = prompt("What's the password");
  const tokenJSON: Response = await jsonFetch("/auth", {
    method: "POST",
    body: JSON.stringify({ password: password })
  });
  if (tokenJSON.status === 403) {
    return "";
  }
  const { token }: { token: string } = await tokenJSON.json();
  return token;
};

const getAuthToken = (): string => localStorage.getItem(daprTokenName) || "";
const jsonFetch = async (url: RequestInfo, opts?: RequestInit) => {
  return await fetch(
    url,
    Object.assign({ headers: { "Content-Type": "application/json" } }, opts)
  );
};
const authedFetch = async (
  url: RequestInfo,
  opts?: RequestInit
): Promise<Response> => {
  let token: string;
  while (!(token = getAuthToken())) {
    token = await auth();
    if (!token) {
      continue;
    }
    localStorage.setItem(daprTokenName, token);
    break;
  }
  return await jsonFetch(
    url,
    Object.assign(
      {},
      {
        headers: {
          [daprTokenName]: token
        }
      },
      opts
    )
  );
};
