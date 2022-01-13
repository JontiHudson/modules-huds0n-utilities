"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOrientation = exports.useLayout = void 0;
const react_native_1 = require("react-native");
const layout_1 = require("../layout");
const lifecycle_1 = require("./lifecycle");
const memoize_1 = require("./memoize");
function isSignificantChange(a, b = 0, percentage) {
    if (!percentage)
        return true;
    const diff = a - b;
    if (diff === 0)
        return false;
    return ((diff > 0 ? diff : -diff) / b) * 100 > percentage;
}
function useLayout({ onInitialize, onLayout, significantChangePercent = 0.1, } = {}) {
    const [layout, setLayout] = (0, lifecycle_1.useState)({
        x: 0,
        y: 0,
        height: 0,
        width: 0,
        isInitialized: false,
    });
    const handleLayout = (0, memoize_1.useCallback)((layoutChangeEvent) => {
        const { nativeEvent: { layout: newLayout }, } = layoutChangeEvent;
        if (isSignificantChange(newLayout.width, layout?.width, significantChangePercent) ||
            isSignificantChange(newLayout.height, layout?.height, significantChangePercent) ||
            isSignificantChange(newLayout.x, layout?.x, significantChangePercent) ||
            isSignificantChange(newLayout.y, layout?.y, significantChangePercent)) {
            if (!layout.isInitialized) {
                onInitialize?.(layoutChangeEvent);
            }
            setLayout({ ...newLayout, isInitialized: true });
            onLayout?.(layoutChangeEvent);
        }
    }, [layout, onInitialize, onLayout]);
    return [layout, handleLayout];
}
exports.useLayout = useLayout;
function useOrientation(options) {
    const [orientation, setOrientation] = (0, lifecycle_1.useState)(layout_1.getOrientation);
    (0, lifecycle_1.useEffect)(() => {
        const handleOrientationChange = () => {
            const newOrientation = (0, layout_1.getOrientation)();
            setOrientation(newOrientation);
            options?.onChange?.(newOrientation);
        };
        react_native_1.Dimensions.addEventListener("change", handleOrientationChange);
        return () => react_native_1.Dimensions.removeEventListener("change", handleOrientationChange);
    }, [options?.onChange]);
    return orientation;
}
exports.useOrientation = useOrientation;
