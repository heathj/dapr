import * as React from "react";
import { map } from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { Syscall } from "../../../shared/types/syscalls";
import { RootState } from "../reducers/root-reducer";
import { setEvents } from "../reducers/events";
import { fetchEvents } from "../utils/api";
const columns: (keyof Syscall)[] = ["type", "syscall", "fd", "request"];
const tableColumns = map(columns, c => <th key={c}>{c}</th>);

export const EventsTable = () => {
  const events = useSelector((state: RootState) => state.events.events);
  const dispatch = useDispatch();
  const rows = map(events, (e, i) => (
    <tr key={i}>{map(columns, c => <td key={c}>{e[c]}</td>)}</tr>
  ));

  const fetchAndSetEvents = async () => {
    const events = await fetchEvents();
    dispatch(setEvents(events));
  };

  React.useEffect(() => {
    fetchAndSetEvents();
    setInterval(fetchAndSetEvents, 5000);
  });

  return (
    <table>
      <thead>
        <tr>{tableColumns}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};
