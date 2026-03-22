"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHAPE_TYPES = exports.TOOL_TYPES = exports.STICKY_COLORS = exports.THROTTLE = exports.DEFAULTS = exports.LIMITS = exports.PRESENCE_COLORS = void 0;
exports.PRESENCE_COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#3b82f6",
    "#6366f1",
    "#a855f7",
    "#ec4899",
    "#f43f5e",
    "#0ea5e9",
    "#84cc16",
];
exports.LIMITS = {
    MAX_ELEMENTS: 5000,
    MAX_USERS_PER_ROOM: 20,
    MAX_ROOMS_PER_USER: 50,
};
exports.DEFAULTS = {
    STROKE_WIDTH: 2,
    ROUGHNESS: 1,
    OPACITY: 1,
    FONT_SIZE: 16,
};
exports.THROTTLE = {
    CURSOR_MS: 50,
    VIEWPORT_MS: 200,
    PERSISTENCE_MS: 2000,
};
exports.STICKY_COLORS = {
    yellow: "#fef08a",
    pink: "#fecdd3",
    blue: "#bfdbfe",
    green: "#bbf7d0",
    purple: "#e9d5ff",
};
exports.TOOL_TYPES = [
    "select",
    "pen",
    "highlighter",
    "eraser",
    "shape",
    "sticky",
    "comment",
    "hand",
];
exports.SHAPE_TYPES = [
    "rectangle",
    "ellipse",
    "diamond",
    "arrow",
    "line",
];
