import { sanitize, storyNameFromExport, toId } from '@componentdriven/csf';
import { css } from '@emotion/react';
import * as React from 'react';
import styled from '@emotion/styled';
import 'react-virtualized/styles.css';
import 'react-virtualized-tree/lib/main.css';
import ReactResizeDetector from 'react-resize-detector';
import { FilterableTree } from './FilterableTree';
import { groupBy } from 'lodash';
export const useStoryBrowser = ({ modules: modulesInput, useIframe = false, }) => {
    const modules = modulesInput instanceof Array ? modulesInput : Object.values(modulesInput);
    const allModuleKeys = modules
        .map((mod) => Object.keys(mod))
        .flat()
        .join();
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
export const StoryBrowser = ({ context = {}, onActiveStoryIdChanged, activeStoryId, className, layout, onStoryUri, ...input }) => {
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
    const [treeNodes, setTreeNodes] = React.useState(() => createTreeNodesFromStories({ stories: [...stories.values()] }));
    const iframeSrc = !!(activeStory === null || activeStory === void 0 ? void 0 : activeStory.useIframe) && (onStoryUri === null || onStoryUri === void 0 ? void 0 : onStoryUri(activeStory));
    return (React.createElement($StoryBrowser, { asFullscreenOverlay: !!(layout === null || layout === void 0 ? void 0 : layout.asFullscreenOverlay), className: className },
        React.createElement($StoryBrowserInner, null,
            React.createElement(ReactResizeDetector, { handleHeight: true, handleWidth: true }, ({ height, targetRef }) => (React.createElement($StoryList, null,
                React.createElement($FilterableTree, null,
                    React.createElement(FilterableTree, { nodes: treeNodes, onNodes: (n) => {
                            console.log({ n });
                            setTreeNodes(n);
                        }, onSelect: (action) => {
                            console.log(action);
                        } }))))),
            iframeSrc && React.createElement($StoryIFrame, { src: iframeSrc }),
            !iframeSrc && React.createElement(RenderStory, { story: activeStory, context: context }))));
};
const $FilterableTree = styled.div `
  && {
    &,
    .tree-filter-container {
      height: 100%;
    }
  }
`;
export const RenderStory = ({ story, context = {} }) => (React.createElement($StoryRenderWrapper, null, (() => {
    if (!story)
        return React.createElement(React.Fragment, null);
    return React.createElement(story.Story, { ...context });
})()));
function createTreeNodesFromStories({ stories, }) {
    /** For components without a kind */
    const unkindedKind = '*';
    const makeKindKey = (kinds) => kinds.join('.');
    const storyGroups = groupBy(stories, (s) => makeKindKey(s.kinds));
    const storyGroupKeys = [unkindedKind, ...Object.keys(storyGroups)];
    function createNodes(kindKey) {
        var _a;
        const childStories = (_a = storyGroups[kindKey]) !== null && _a !== void 0 ? _a : [];
        const childStoryGroupKeys = storyGroupKeys.filter((k) => k !== kindKey && k.startsWith(kindKey));
        const childrenNodes = childStories.map(({ name, storyId, kinds }) => {
            const key = makeKindKey(kinds);
            return {
                id: storyId,
                name: name,
                // children: createNodes(key),
            };
        });
        const childrenGroups = childStoryGroupKeys.map((k) => ({
            id: k,
            name: k,
            children: createNodes(k),
        }));
        return [...childrenGroups, ...childrenNodes];
    }
    return storyGroupKeys.map((k) => ({
        id: k,
        name: k,
        children: createNodes(k),
    }));
}
export const $StoryListItem = styled.a `
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
  cursor: pointer;
  color: inherit;
  text-decoration: none;

  &:hover {
    opacity: 0.9;
  }

  &.isActive {
    box-shadow: 0 2px 2px 1px #0004;
    border-left-color: #a1a1a1;
    z-index: 10;
    opacity: 1;
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
  position: relative;
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
