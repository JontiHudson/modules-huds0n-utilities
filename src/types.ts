export type Component =
  | React.Component<any, any, any>
  | React.ComponentClass<any, any>;

export type Node = number | string | Component | null;

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
