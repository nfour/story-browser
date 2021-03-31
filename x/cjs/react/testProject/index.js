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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const css_1 = require("@emotion/css");
const React = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const StoryBrowser_1 = require("../src/react/StoryBrowser");
const storyMap = __importStar(require("./nesting/folder/STORY_MAP"));
const xroute_1 = require("xroute");
const mobx_react_lite_1 = require("mobx-react-lite");
const Root = () => {
    const { stories } = StoryBrowser_1.useStoryBrowser({ modules: storyMap });
    const [router] = React.useState(() => new xroute_1.XRouter([
        xroute_1.XRoute('storyBrowser', '/:story?', {}),
        xroute_1.XRoute('story', '/iframe/:story', {}),
    ]));
    return (React.createElement("main", { className: css_1.css `
        font-family: Arial;
      ` },
        React.createElement(mobx_react_lite_1.Observer, null, () => {
            var _a;
            if (router.routes.storyBrowser.isActive) {
                return (React.createElement(StoryBrowser_1.StoryBrowser, { stories: stories, activeStoryId: (_a = router.routes.storyBrowser.params) === null || _a === void 0 ? void 0 : _a.story, onActiveStoryIdChanged: (story) => router.routes.storyBrowser.push({ story }), onIframeSrc: (story) => {
                        /** @example "#/story/my-story--id" */
                        return ('#' + router.routes.story.toPath({ story: story.storyId }));
                    }, layout: {
                        asFullscreenOverlay: true,
                    } }));
            }
            if (router.routes.story.isActive) {
                const storyId = router.routes.story.params.story;
                const story = stories.get(storyId);
                if (!story)
                    return (React.createElement(React.Fragment, null,
                        "Cant find story ",
                        React.createElement("pre", null, storyId),
                        "."));
                // Iframes come out with a red border!
                return (React.createElement("div", { className: css_1.css `
                  outline: 2px dashed #cc3131;
                  padding: 4em;
                ` },
                    React.createElement(StoryBrowser_1.RenderStory, { story: story, context: {} })));
            }
            return React.createElement(React.Fragment, null, "404");
        })));
};
react_dom_1.render(React.createElement(Root, null), document.getElementById('__root'));
(_a = import.meta.hot) === null || _a === void 0 ? void 0 : _a.accept();
