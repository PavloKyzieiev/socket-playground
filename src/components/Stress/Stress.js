import React from "react";

const stress = props => {
  const { start, inputChange, enabled, perSecond, seconds } = props;
  return (
    <div className="stress">
      {!enabled && <button onClick={start}>Stress</button>}
      <input
        onChange={e => inputChange(e, "perSecond")}
        value={perSecond}
        type="number"
      />{" "}
      per. sec.
      <input
        onChange={e => inputChange(e, "seconds")}
        value={seconds}
        type="number"
      />{" "}
      repeat sec
    </div>
  );
};

export default stress;
