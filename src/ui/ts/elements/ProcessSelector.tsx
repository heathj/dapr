import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setProcs, deselectProc, selectProc } from "../reducers/procs";
import { RootState } from "../reducers/root-reducer";
import { fetchCurrentProcesses } from "../utils/api";
import { NoBulletList } from "./styled/ul";
import { ProcessColumn } from "./styled/div";
import { install, uninstall } from "../utils/api";
export const ProcessSelector = () => {
  const procs = useSelector((state: RootState) => state.procs.procs);
  const isInterceptorEnabled = useSelector(
    (state: RootState) => state.interceptor.enabled
  );
  const selectedProcIDs = useSelector(
    (state: RootState) => state.procs.selectedProcIDs
  );
  const dispatch = useDispatch();
  const fetchAndSetCurrentProcesses = async () => {
    const procs = await fetchCurrentProcesses();
    dispatch(setProcs(procs));
  };
  React.useEffect(() => {
    fetchAndSetCurrentProcesses();
    const int = setInterval(fetchAndSetCurrentProcesses, 5000);
    return () => clearInterval(int);
  }, []);

  React.useEffect(
    () => {
      selectedProcIDs.map(async p => {
        const resp = await install(p, isInterceptorEnabled);
        if (resp.status === 500) {
          deselect(p);
        }
      });
    },
    [selectedProcIDs]
  );

  const deselect = async (pid: number) => {
    await uninstall(pid);
    dispatch(deselectProc(pid));
  };
  const select = async (pid: number) => {
    dispatch(selectProc(pid));
  };

  return (
    <ProcessColumn>
      <h3>Selected Processes!</h3>
      <NoBulletList>
        {procs
          .filter(proc => selectedProcIDs.indexOf(proc.pid) !== -1)
          .sort((a, b) => a.pid - b.pid)
          .map(proc => (
            <li onClick={() => deselect(proc.pid)} key={proc.pid}>
              {proc.pid}:{proc.name}
            </li>
          ))}
      </NoBulletList>
      <h3>Available Processes</h3>
      <NoBulletList>
        {procs
          .filter(proc => selectedProcIDs.indexOf(proc.pid) === -1)
          .sort((a, b) => b.pid - a.pid)
          .map(proc => (
            <li key={proc.pid} onClick={() => select(proc.pid)}>
              {proc.pid}:{proc.name}
            </li>
          ))}
      </NoBulletList>
    </ProcessColumn>
  );
};
