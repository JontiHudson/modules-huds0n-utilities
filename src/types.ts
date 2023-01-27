import type {
  LayoutChangeEvent as LayoutChangeEventRN,
  LayoutRectangle as LayoutRectangleRN,
} from 'react-native';

export declare namespace Types {
  export type ReactComponent =
    | React.Component<any, any, any>
    | React.ComponentClass<any, any>;
  export type Node = number | string | ReactComponent | null;
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

  export type LayoutChangeEvent = LayoutChangeEventRN;
  export type OnInitializeLayout = (
    layoutChangeEvent: LayoutChangeEvent,
  ) => void;
  export type OnLayout = (layoutChangeEvent: LayoutChangeEvent) => void;
  export type LayoutRectangle = LayoutRectangleRN & { isInitialized: boolean };

  export type Orientation = 'PORTRAIT' | 'LANDSCAPE';
  export type OnOrientationChange = (orientation: Orientation) => void;

  export type LayoutTiming = 'BEFORE' | 'AFTER' | 'END';
}
