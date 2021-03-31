"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test_story_2 = exports.test_story_1 = void 0;
const React = __importStar(require("react"));
exports.default = {
    title: "TestProject",
};
const test_story_1 = () => {
    return React.createElement(React.Fragment, null, "This is static text from an IFrame");
};
exports.test_story_1 = test_story_1;
exports.test_story_1.useIframe = true;
const test_story_2 = () => {
    return React.createElement(React.Fragment, null, "This is static text from an embedded component (No iframe).");
};
exports.test_story_2 = test_story_2;
