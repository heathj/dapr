import * as React from "react";
import { store } from "../index";
import * as actions from "../actions/actions";
import * as _ from "lodash";
const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
};
const randomEvent = () => {
    return {
        id: Math.random(),
        driverName: Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, "")
            .substr(0, 5),
        opcode: Math.random(),
        mode: Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, "")
            .substr(0, 5),
        size: Math.random(),
        start: Math.random(),
        data: [1, 2, 3],
        request: getRandomInt(0x100000000)
    };
};
const addRandomEvents = () => {
    const j = getRandomInt(100);
    let events = [];
    for (let i = 0; i < j; i++) {
        events.push(randomEvent());
    }
    store.dispatch(actions.addEvents(events));
};
const addRandomEvent = () => {
    store.dispatch(actions.addEvent(randomEvent()));
};
const selectRandomDriver = () => {
    const drivers = _.map(store.getState().events, i => i.driverName);
    const randomDriver = _.sample(drivers);
    console.log(drivers, randomDriver);
    store.dispatch(actions.selectDriver(randomDriver));
};
const selectRandomEvent = () => { };
export class TestModule extends React.Component {
    render() {
        return (React.createElement("div", null,
            React.createElement("button", { onClick: addRandomEvent }, "ADD RANDOM EVENT"),
            React.createElement("button", { onClick: addRandomEvents }, "ADD RANDOM EVENTS"),
            React.createElement("button", { onClick: selectRandomDriver }, "SELECT RANDOM DRIVER"),
            React.createElement("button", { onClick: selectRandomEvent }, "SELECT RANDOM EVENT")));
    }
}
//# sourceMappingURL=test-module.js.map