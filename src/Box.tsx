import React, { FunctionComponent } from "react";
import { useIsVisible } from "./useIsVisible";

type BoxProps = {
  id: number;
  className: string;
};

const Box: FunctionComponent<BoxProps> = ({ id, className }) => {
  const [ref, isVisible] = useIsVisible([-300, 0], true);
  return (
    <div
      ref={ref as unknown as React.MutableRefObject<HTMLDivElement>}
      className={className}
    >
      <h1>
        {id} is {isVisible ? "visible" : "invisible"}!
      </h1>
    </div>
  );
};

export default Box;
