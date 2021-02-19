export type Node = number | React.MutableRefObject<any>;

export type NodeMeasurements = {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
};

export type RelativeNodeMeasurement = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};
