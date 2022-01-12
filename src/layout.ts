import React, { useRef } from "react";
import {
  Dimensions,
  findNodeHandle,
  StyleProp,
  StyleSheet,
  UIManager,
  ViewStyle,
} from "react-native";

import Error from "@huds0n/error";

import { onMount } from "./hooks/lifecycle";
import type { Types } from "./types";

export function getNodeId(
  node: Types.Node,
  allowUndefined: true
): number | string | null;
export function getNodeId(
  node: Types.Node,
  allowUndefined?: false
): number | string;
export function getNodeId(
  node: Types.Node,
  allowUndefined?: boolean
): number | string | null {
  if (typeof node === "number" || typeof node === "string") {
    return node;
  }

  const id = findNodeHandle(node);

  if (id !== null) return id;
  if (allowUndefined) return null;

  throw new Error({
    name: "Huds0n Error",
    code: "NODE_INVALID",
    message: "Invalid node",
    info: { node },
    severity: "HIGH",
  });
}

export function isSameNode(a: Types.Node, b: Types.Node) {
  return getNodeId(a) === getNodeId(b);
}

export function useNodeId<
  T extends Types.ReactComponent = Types.ReactComponent
>(): [{ current: number | string | undefined }, React.RefObject<T>] {
  const ref = useRef<T>(null);
  const id = useRef<number | string | undefined>();

  onMount(
    () => {
      id.current = getNodeId(ref.current);
    },
    { layout: "AFTER" }
  );

  return [id, ref];
}

export function getOrientation(): Types.Orientation {
  return Dimensions.get("screen").height > Dimensions.get("screen").width
    ? "PORTRAIT"
    : "LANDSCAPE";
}

export async function measureNodeAsync(node: Types.Node) {
  return new Promise<Types.NodeMeasurements>((resolve) => {
    const nodeId = getNodeId(node);

    UIManager.measure(nodeId as number, (x, y, width, height, pageX, pageY) => {
      resolve({ x, y, width, height, pageX, pageY });
    });
  });
}

export async function measureRelativeNodeAsync(
  node: Types.Node,
  relativeNode: Types.Node
) {
  return new Promise<Types.RelativeNodeMeasurement>((resolve, reject) => {
    const nodeId = getNodeId(node);
    const relativeNodeId = getNodeId(relativeNode);

    UIManager.measureLayout(
      nodeId as number,
      relativeNodeId as number,
      () =>
        reject(
          new Error({
            name: "Huds0n Error",
            code: "MEASURE_RELATIVE_NODE_ERROR",
            message: "Unable to measure relative nodes",
            info: { node, relativeNode },
            severity: "HIGH",
          })
        ),
      (left, top, width, height) => {
        resolve({ left, top, width, height });
      }
    );
  });
}

export function getIsDescendant(node: Types.Node, relativeNode: Types.Node) {
  return new Promise<boolean>((resolve) => {
    const nodeId = getNodeId(node);
    const relativeNodeId = getNodeId(relativeNode);

    // @ts-ignore viewIsDescendantOf not typed
    UIManager.viewIsDescendantOf(
      nodeId,
      relativeNodeId,
      (isDescendant: boolean) => {
        resolve(isDescendant);
      }
    );
  });
}

export function separateInnerOuterStyles(style: StyleProp<ViewStyle> = {}): {
  innerStyle: ViewStyle;
  outerStyle: ViewStyle;
} {
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
      ...("alignContent" in flattenedStyle && { alignContent }),
      ...("alignItems" in flattenedStyle && { alignItems }),
      ...("backgroundColor" in flattenedStyle && { backgroundColor }),
      ...("direction" in flattenedStyle && { direction }),
      ...("flexDirection" in flattenedStyle && { flexDirection }),
      ...("justifyContent" in flattenedStyle && { justifyContent }),
      ...("padding" in flattenedStyle && { padding }),
      ...("paddingBottom" in flattenedStyle && { paddingBottom }),
      ...("paddingEnd" in flattenedStyle && { paddingEnd }),
      ...("paddingHorizontal" in flattenedStyle && { paddingHorizontal }),
      ...("paddingLeft" in flattenedStyle && { paddingLeft }),
      ...("paddingRight" in flattenedStyle && { paddingRight }),
      ...("paddingStart" in flattenedStyle && { paddingStart }),
      ...("paddingTop" in flattenedStyle && { paddingTop }),
      ...("paddingVertical" in flattenedStyle && { paddingVertical }),
    },
  };
}
