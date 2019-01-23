import React from "react";

const input = props => {
  const { label, value, changeHangler } = props;
  return (
    <div className="form-group">
      <label>{label}</label>
      <input value={value} onChange={changeHangler} />
    </div>
  );
};

export default input;
