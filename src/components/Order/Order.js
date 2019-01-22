import React from 'react'

const order = props => {
  const { instrumentId, bid, ask, time } = props.sub;
  return (
    <div className="trading">
      <ul>
        <li>
          <b>instrument:</b> {instrumentId}
        </li>
        <li>
          <b>bid:</b> {bid}, <b>ask:</b> {ask}
        </li>
        <li>
          <b>time:</b> {time}
        </li>
      </ul>
    </div>
  );
};

export default order;
