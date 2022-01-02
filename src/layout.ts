import React, { useRef } from 'react';
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
import * as Types from './types';

export namespace getNodeId {
  export type Node = Types.Node;
}

export function getNodeId(
  node: Types.Node,
  allowUndefined: true,
): number | string | null;
export function getNodeId(
  node: Types.Node,
  allowUndefined?: false,
): number | string;
export function getNodeId(
  node: Types.Node,
  allowUndefined?: boolean,
): number | string | null {
  if (typeof node === 'number' || typeof node === 'string') {
    return node;
  }

  const id = findNodeHandle(node);

  if (id !== null) return id;
  if (allowUndefined) return null;

  throw new Error({
    name: 'Huds0n Error',
    code: 'NODE_INVALID',
    message: 'Invalid node',
    info: { node },
    severity: 'HIGH',
  });
}

export namespace getIsSameNode {
  export type Node = Types.Node;
}

export function isSameNode(a: getIsSameNode.Node, b: getIsSameNode.Node) {
  return getNodeId(a) === getNodeId(b);
}

export function useNodeId<T extends Types.Component = Types.Component>(): [
  { current: number | string | undefined },
  React.RefObject<T>,
] {
  const ref = useRef<T>(null);
  const id = useRef<number | string | undefined>();

  onMount(
    () => {
      id.current = getNodeId(ref.current);
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

export namespace measureNodeAsync {
  export type Node = Types.Node;
  export type NodeMeasurements = Types.NodeMeasurements;
}

export async function measureNodeAsync(node: measureNodeAsync.Node) {
  return new Promise<measureNodeAsync.NodeMeasurements>((resolve) => {
    const nodeId = getNodeId(node);

    UIManager.measure(nodeId as number, (x, y, width, height, pageX, pageY) => {
      resolve({ x, y, width, height, pageX, pageY });
    });
  });
}

export namespace measureRelativeNodeAsync {
  export type Node = Types.Node;
  export type RelativeNodeMeasurement = Types.RelativeNodeMeasurement;
}

export async function measureRelativeNodeAsync(
  node: measureNodeAsync.Node,
  relativeNode: measureNodeAsync.Node,
) {
  return new Promise<measureRelativeNodeAsync.RelativeNodeMeasurement>(
    (resolve, reject) => {
      const nodeId = getNodeId(node);
      const relativeNodeId = getNodeId(relativeNode);

      UIManager.measureLayout(
        nodeId as number,
        relativeNodeId as number,
        () =>
          reject(
            new Error({
              name: 'Huds0n Error',
              code: 'MEASURE_RELATIVE_NODE_ERROR',
              message: 'Unable to measure relative nodes',
              info: { node, relativeNode },
              severity: 'HIGH',
            }),
          ),
        (left, top, width, height) => {
          resolve({ left, top, width, height });
        },
      );
    },
  );
}

export namespace getIsDescendant {
  export type Node = Types.Node;
}

export function getIsDescendant(
  node: getIsDescendant.Node,
  relativeNode: getIsDescendant.Node,
) {
  return new Promise<boolean>((resolve) => {
    const nodeId = getNodeId(node);
    const relativeNodeId = getNodeId(relativeNode);

    // @ts-ignore viewIsDescendantOf not typed
    UIManager.viewIsDescendantOf(
      nodeId,
      relativeNodeId,
      (isDescendant: boolean) => {
        resolve(isDescendant);
      },
    );
  });
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
    backgroundColor,
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
      ...('backgroundColor' in flattenedStyle && { backgroundColor }),
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
