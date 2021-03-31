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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$StoryBrowser = exports.$StoryBrowserInner = exports.$StoryList = exports.$StoryIFrame = exports.$StoryRenderWrapper = exports.$StoryListItem = exports.RenderStory = exports.StoryBrowser = exports.useStoryBrowser = void 0;
const csf_1 = require("@componentdriven/csf");
const css_1 = require("@emotion/css");
const react_1 = require("@emotion/react");
const React = __importStar(require("react"));
const styled_1 = __importDefault(require("@emotion/styled"));
const useStoryBrowser = ({ modules: modulesInput, useIframe = false, }) => {
    const [modules, setModules] = React.useState([]);
    const allModuleKeys = modules
        .map((mod) => Object.keys(mod))
        .flat()
        .join();
    React.useEffect(() => {
        Promise.all(modulesInput instanceof Array
            ? modulesInput
            : Object.values(modulesInput)).then((m) => setModules(m));
    }, [modulesInput]);
    const stories = React.useMemo(() => new Map(modules
        .map(({ default: meta = {}, ...exportMembers }) => {
        var _a, _b, _c, _d;
        const components = [];
        const kinds = (_b = (_a = meta.title) === null || _a === void 0 ? void 0 : _a.split('/').map(csf_1.sanitize)) !== null && _b !== void 0 ? _b : [];
        for (const [key, val] of Object.entries(exportMembers)) {
            if (typeof val === 'function') {
                const Story = val;
                const id = csf_1.toId(kinds.join('-'), key);
                const isIframed = (_d = (_c = Story.useIframe) !== null && _c !== void 0 ? _c : meta.useIframe) !== null && _d !== void 0 ? _d : useIframe;
                components.push([
                    id,
                    {
                        kinds,
                        Story,
                        storyId: id,
                        name: csf_1.storyNameFromExport(key),
                        useIframe: isIframed,
                    },
                ]);
            }
        }
        return components;
    })
        .flat()), [allModuleKeys]);
    return { stories, modules };
};
exports.useStoryBrowser = useStoryBrowser;
const StoryBrowser = ({ context = {}, onActiveStoryIdChanged, activeStoryId, className, layout, onIframeSrc, ...input }) => {
    const stories = 'modules' in input
        ? exports.useStoryBrowser({ modules: input.modules }).stories // eslint-disable-line
        : input.stories;
    const activeStory = stories.get(activeStoryId);
    const storyKeys = [...stories.keys()];
    React.useEffect(() => {
        if (activeStory)
            return;
        const firstKey = storyKeys[0];
        if (!firstKey)
            return;
        onActiveStoryIdChanged === null || onActiveStoryIdChanged === void 0 ? void 0 : onActiveStoryIdChanged(firstKey);
    }, [activeStoryId, storyKeys.join('')]);
    return (React.createElement(exports.$StoryBrowser, { asFullscreenOverlay: !!(layout === null || layout === void 0 ? void 0 : layout.asFullscreenOverlay), className: className },
        React.createElement(exports.$StoryBrowserInner, null,
            React.createElement(exports.$StoryList, null, [...stories.entries()].map(([key, { name, kinds }]) => (React.createElement(exports.$StoryListItem, { className: css_1.cx({ isActive: activeStoryId === key }), key: `${key}${name}`, onClick: () => {
                    onActiveStoryIdChanged === null || onActiveStoryIdChanged === void 0 ? void 0 : onActiveStoryIdChanged(key);
                } },
                React.createElement("small", null, kinds.map(csf_1.storyNameFromExport).join(' • ')),
                React.createElement("span", null, name))))),
            (() => {
                if (!activeStory)
                    return React.createElement(React.Fragment, null, "No story selected.");
                if (onIframeSrc && activeStory.useIframe) {
                    return React.createElement(exports.$StoryIFrame, { src: onIframeSrc(activeStory) });
                }
                return React.createElement(exports.RenderStory, { story: activeStory, context: context });
            })())));
};
exports.StoryBrowser = StoryBrowser;
const RenderStory = ({ story: { Story, storyId, name }, context = {} }) => (React.createElement(exports.$StoryRenderWrapper, null,
    React.createElement(Story, Object.assign({}, context))));
exports.RenderStory = RenderStory;
exports.$StoryListItem = styled_1.default.div `
  padding: 0.8em 1em;
  background: #aaa1;
  transition: all 0.1s ease;
  opacity: 0.5;
  border-left: 4px solid transparent;
  box-shadow: 0 1px 1px 0 #0008;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  flex-wrap: nowrap;

  &:hover {
    opacity: 0.9;
    cursor: pointer;
  }

  &.isActive {
    box-shadow: 0 2px 2px 1px #0004;
    border-left-color: #a1a1a1;
    z-index: 10;
    opacity: 1;

    &:hover {
      cursor: default;
    }
  }

  span {
    padding-left: 2em;
    align-self: flex-end;
    font-weight: 600;
  }

  small {
    opacity: 0.8;
    font-size: 0.85em;
    align-self: flex-start;
    margin-bottom: 5px;
    margin-top: -2.5px;
  }
`;
exports.$StoryRenderWrapper = styled_1.default.main `
  height: 100%;
  width: 100%;

  flex-grow: 1;
`;
exports.$StoryIFrame = styled_1.default.iframe `
  width: 100%;
  height: 100%;
  border: 0;
`;
exports.$StoryList = styled_1.default.section `
  color: #fffc;
  height: 100%;
  font-size: 0.75em;
`;
exports.$StoryBrowserInner = styled_1.default.div `
  display: flex;
  height: 100%;
  width: 100%;
`;
exports.$StoryBrowser = styled_1.default.main `
  width: 100%;
  height: 100%;

  background: #222;

  ${({ asFullscreenOverlay }) => asFullscreenOverlay
    ? react_1.css `
          position: fixed;
          top: 0;
          left: 0;
        `
    : ''}
`;
