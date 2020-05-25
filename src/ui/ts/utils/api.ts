export const uninstall = async (pid: number): Promise<Response> =>
  await jsonFetch(`/session/uninstall`, {
    method: "POST",
    body: JSON.stringify({ pid: pid }),
  });

export const install = async (pid: number): Promise<Response> =>
  await jsonFetch(`/session/install`, {
    method: "POST",
    body: JSON.stringify({ pid, adb: false }),
  });

import { Process } from "../../../shared/types/procs";
export const fetchCurrentProcesses = async (): Promise<Process[]> => {
  const respJSON = await jsonFetch(`/procs`);
  const data: Process[] = await respJSON.json();
  return data;
};

export const daprTokenName = "dapr";
const auth = async (): Promise<string> => {
  const password = prompt("What's the password");
  const tokenJSON: Response = await jsonFetch("/auth", {
    method: "POST",
    body: JSON.stringify({ password: password }),
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
          [daprTokenName]: token,
        },
      },
      opts
    )
  );
};
