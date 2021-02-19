import { useRef } from 'react';
import {
  Dimensions,
  findNodeHandle,
  StyleProp,
  StyleSheet,
  UIManager,
  ViewStyle,
} from 'react-native';

import Error from '@huds0n/error';

import { onMount } from './hooks/lifecycle';

export namespace getNodeId {
  export type Node = number | React.RefObject<any>;
}

export function getNodeId(node: getNodeId.Node) {
  return typeof node === 'number' ? node : findNodeHandle(node.current) || -1;
}

export function useNodeId<T = any>(): [
  { current: number | undefined },
  React.RefObject<T>,
] {
  const ref = useRef<T>(null);
  const id = useRef<number | undefined>();

  onMount(
    () => {
      id.current = getNodeId(ref);
    },
    { layout: 'AFTER' },
  );

  return [id, ref];
}

export namespace getOrientation {
  export type Orientation = 'PORTRAIT' | 'LANDSCAPE';
}

export function getOrientation(): getOrientation.Orientation {
  return Dimensions.get('screen').height > Dimensions.get('screen').width
    ? 'PORTRAIT'
    : 'LANDSCAPE';
}

export namespace getOrientation {
  export type Node = getNodeId.Node;

  export type NodeMeasurements = {
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  };
}

export namespace measureNodeAsync {
  export type Node = getNodeId.Node;

  export type NodeMeasurements = getOrientation.NodeMeasurements;
}

export async function measureNodeAsync(node: getOrientation.Node) {
  return new Promise<getOrientation.NodeMeasurements>((resolve, reject) => {
    const nodeId = getNodeId(node);

    if (nodeId === null) {
      reject(
        new Error({
          name: 'Huds0n Error',
          code: 'MEASURE_NODE_INVALID',
          message: 'Invalid node passed into measureNodeAsync',
          info: { node },
          severity: 'HIGH',
        }),
      );
    } else {
      UIManager.measure(nodeId, (x, y, width, height, pageX, pageY) => {
        resolve({ x, y, width, height, pageX, pageY });
      });
    }
  });
}

export namespace measureRelativeNodeAsync {
  export type Node = getNodeId.Node;

  export type RelativeNodeMeasurement = {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export async function measureRelativeNodeAsync(
  node: measureRelativeNodeAsync.Node,
  relativeNode: measureRelativeNodeAsync.Node,
) {
  return new Promise<measureRelativeNodeAsync.RelativeNodeMeasurement>(
    (resolve, reject) => {
      const nodeId = getNodeId(node);

      const relativeNodeId = getNodeId(relativeNode);

      if (nodeId === null || relativeNodeId === null) {
        reject(
          new Error({
            name: 'Huds0n Error',
            code: 'MEASURE_NODE_INVALID',
            message: 'Invalid node passed into measureNodeAsync',
            info: { node, relativeNode },
            severity: 'HIGH',
          }),
        );
      } else {
        UIManager.measureLayout(
          nodeId,
          relativeNodeId,
          () =>
            reject(
              new Error({
                name: 'Huds0n Error',
                code: 'MEASURE_NODE_INVALID',
                message: 'Invalid node passed into measureNodeAsync',
                info: { node, relativeNode },
                severity: 'HIGH',
              }),
            ),
          (left, top, width, height) => {
            resolve({ left, top, width, height });
          },
        );
      }
    },
  );
}

export namespace separateInnerOuterStyles {
  export type InputStyle = StyleProp<ViewStyle>;
  export type InnerStyle = ViewStyle;
  export type OuterStyle = ViewStyle;
  export type Result = { innerStyle: InnerStyle; outerStyle: OuterStyle };
}

export function separateInnerOuterStyles(
  style: separateInnerOuterStyles.InputStyle = {},
): separateInnerOuterStyles.Result {
  const flattenedStyle = StyleSheet.flatten(style);

  const {
    alignContent,
    alignItems,
    direction,
    flexDirection,
    justifyContent,
    padding,
    paddingBottom,
    paddingEnd,
    paddingHorizontal,
    paddingLeft,
    paddingRight,
    paddingStart,
    paddingTop,
    paddingVertical,
    ...outerStyle
  } = flattenedStyle;

  return {
    outerStyle,
    innerStyle: {
      ...('alignContent' in flattenedStyle && { alignContent }),
      ...('alignItems' in flattenedStyle && { alignItems }),
      ...('direction' in flattenedStyle && { direction }),
      ...('flexDirection' in flattenedStyle && { flexDirection }),
      ...('justifyContent' in flattenedStyle && { justifyContent }),
      ...('padding' in flattenedStyle && { padding }),
      ...('paddingBottom' in flattenedStyle && { paddingBottom }),
      ...('paddingEnd' in flattenedStyle && { paddingEnd }),
      ...('paddingHorizontal' in flattenedStyle && { paddingHorizontal }),
      ...('paddingLeft' in flattenedStyle && { paddingLeft }),
      ...('paddingRight' in flattenedStyle && { paddingRight }),
      ...('paddingStart' in flattenedStyle && { paddingStart }),
      ...('paddingTop' in flattenedStyle && { paddingTop }),
      ...('paddingVertical' in flattenedStyle && { paddingVertical }),
    },
  };
}
