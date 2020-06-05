import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setInterceptorFetch,
  fetchNextInterception,
  forwardInterception
} from "../utils/api";
import { RootState } from "../reducers/root-reducer";
import {
  toggleInterceptor,
  setNextSyscall,
  defaultSyscall
} from "../reducers/interceptor";
import { Syscall } from "../../../shared/types";

const parseReplacedBytes = (input: string) => {
  return input.split(" ").map(a => parseInt(a, 16));
};

export const Interceptor = () => {
  const [interval, setInt] = React.useState(0);
  const [replaced, setReplaced] = React.useState("");
  const selectedProcIDs = useSelector(
    (state: RootState) => state.procs.selectedProcIDs
  );
  const interceptorEnabled = useSelector(
    (state: RootState) => state.interceptor.enabled
  );

  React.useEffect(
    () => {
      setInterceptorFetch(interceptorEnabled);
    },
    [interceptorEnabled]
  );

  const syscall = useSelector((state: RootState) => state.interceptor.syscall);
  const dispatch = useDispatch();

  const getAndSetNextInterceptedSyscall = () => {
    const int = setTimeout(async () => {
      setInt(int);
      const syscall = await fetchNextInterception();
      if (Object.keys(syscall).length === 0) {
        getAndSetNextInterceptedSyscall();
        return;
      }

      setInt(0);
      dispatch(setNextSyscall(syscall));
    }, 1000);
  };

  const toggleInterceptorOnChange = async () => {
    dispatch(toggleInterceptor());
  };

  const forwardAndGetNextInterception = () => {
    const replacedSyscall: Syscall = Object.assign({}, syscall, {
      data: parseReplacedBytes(replaced)
    });
    forwardInterception(replacedSyscall);

    setReplaced("");
    dispatch(setNextSyscall(defaultSyscall));
    getAndSetNextInterceptedSyscall();
  };

  // if the interceptor is turned on and we are connected to at least 1 process
  // and there isn't an interval already running, start the interval.
  React.useEffect(
    () => {
      if (
        interceptorEnabled &&
        selectedProcIDs.length > 0 &&
        interval === 0 &&
        syscall.type === "DEFAULT"
      ) {
        getAndSetNextInterceptedSyscall();
      }
    },
    [interceptorEnabled, selectedProcIDs, interval, syscall]
  );

  // If the interval is running, but we turned off all the watching processes or
  // we disabled the interceptor, clear the interval.
  if (interval !== 0 && (selectedProcIDs.length === 0 || !interceptorEnabled)) {
    clearTimeout(interval);
    setInt(0);
  }

  // if the interceptor has been disabled, but there is a syscall trapped,
  // send it back and reset
  if (!interceptorEnabled && syscall.type !== "DEFAULT") {
    forwardInterception(syscall);
    dispatch(setNextSyscall(defaultSyscall));
  }

  return (
    <form
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        if (parseReplacedBytes(replaced).filter(a => isNaN(a)).length > 0) {
          alert("not all values were numbers");
          return;
        }
        forwardAndGetNextInterception();
      }}
    >
      <label>Interceptor enabled</label>
      <input
        type="checkbox"
        name="interceptorEnabled"
        checked={interceptorEnabled}
        onChange={() => toggleInterceptorOnChange()}
      />
      <br />
      <br />
      <label>Intercepted Bytes</label>
      <br />
      <span>{syscall.data.join(" ")}</span>

      <br />
      <br />
      <label>
        Replace bytes (insert bytes spaced with one space and radix 16)
      </label>
      <br />
      <textarea
        name="replaced"
        value={replaced}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setReplaced(e.target.value);
        }}
      />
      <br />
      <br />
      <label>FD: {syscall.fd}</label>
      <br />
      <br />
      <label>Request: {syscall.request}</label>
      <br />
      <br />
      <label>Syscall: {syscall.syscall}</label>
      <br />
      <br />
      <input type="submit" />
    </form>
  );
};
