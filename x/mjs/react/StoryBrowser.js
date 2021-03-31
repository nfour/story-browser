import { sanitize, storyNameFromExport, toId } from '@componentdriven/csf';
import { cx } from '@emotion/css';
import { css } from '@emotion/react';
import * as React from 'react';
import styled from '@emotion/styled';
export const useStoryBrowser = ({ modules: modulesInput, useIframe = false, }) => {
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
        const kinds = (_b = (_a = meta.title) === null || _a === void 0 ? void 0 : _a.split('/').map(sanitize)) !== null && _b !== void 0 ? _b : [];
        for (const [key, val] of Object.entries(exportMembers)) {
            if (typeof val === 'function') {
                const Story = val;
                const id = toId(kinds.join('-'), key);
                const isIframed = (_d = (_c = Story.useIframe) !== null && _c !== void 0 ? _c : meta.useIframe) !== null && _d !== void 0 ? _d : useIframe;
                components.push([
                    id,
                    {
                        kinds,
                        Story,
                        storyId: id,
                        name: storyNameFromExport(key),
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
export const StoryBrowser = ({ context = {}, onActiveStoryIdChanged, activeStoryId, className, layout, onIframeSrc, ...input }) => {
    const stories = 'modules' in input
        ? useStoryBrowser({ modules: input.modules }).stories // eslint-disable-line
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
    return (React.createElement($StoryBrowser, { asFullscreenOverlay: !!(layout === null || layout === void 0 ? void 0 : layout.asFullscreenOverlay), className: className },
        React.createElement($StoryBrowserInner, null,
            React.createElement($StoryList, null, [...stories.entries()].map(([key, { name, kinds }]) => (React.createElement($StoryListItem, { className: cx({ isActive: activeStoryId === key }), key: `${key}${name}`, onClick: () => {
                    onActiveStoryIdChanged === null || onActiveStoryIdChanged === void 0 ? void 0 : onActiveStoryIdChanged(key);
                } },
                React.createElement("small", null, kinds.map(storyNameFromExport).join(' • ')),
                React.createElement("span", null, name))))),
            (() => {
                if (!activeStory)
                    return React.createElement(React.Fragment, null, "No story selected.");
                if (onIframeSrc && activeStory.useIframe) {
                    return React.createElement($StoryIFrame, { src: onIframeSrc(activeStory) });
                }
                return React.createElement(RenderStory, { story: activeStory, context: context });
            })())));
};
export const RenderStory = ({ story: { Story, storyId, name }, context = {} }) => (React.createElement($StoryRenderWrapper, null,
    React.createElement(Story, Object.assign({}, context))));
export const $StoryListItem = styled.div `
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
export const $StoryRenderWrapper = styled.main `
  height: 100%;
  width: 100%;

  flex-grow: 1;
`;
export const $StoryIFrame = styled.iframe `
  width: 100%;
  height: 100%;
  border: 0;
`;
export const $StoryList = styled.section `
  color: #fffc;
  height: 100%;
  font-size: 0.75em;
`;
export const $StoryBrowserInner = styled.div `
  display: flex;
  height: 100%;
  width: 100%;
`;
export const $StoryBrowser = styled.main `
  width: 100%;
  height: 100%;

  background: #222;

  ${({ asFullscreenOverlay }) => asFullscreenOverlay
    ? css `
          position: fixed;
          top: 0;
          left: 0;
        `
    : ''}
`;