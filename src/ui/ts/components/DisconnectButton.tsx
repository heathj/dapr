import * as React from "react";
import { uninstall } from "../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { clearEvents } from "../actions/actions";
import { first, split } from "lodash";

const DisconnectButton = () => {
  const onDisconnect = async (__: any): Promise<void> => {
    const proc = useSelector((state) => state.currentlyAttachedProcess);
    const dispatch = useDispatch();
    if (proc) {
      const procNum = first(split(proc, " - "));
      if (!procNum) {
        return;
      }
      await uninstall(first);
      dispatch(clearEvents());
    }
  };
  return <button onClick={onDisconnect}>Disconnect</button>;
};
