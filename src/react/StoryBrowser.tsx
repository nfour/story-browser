import React, { useMemo, useEffect, useState, ReactNode } from 'react'
import { sanitize, storyNameFromExport, toId } from '@componentdriven/csf'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import ReactResizeDetector from 'react-resize-detector'
import { FilterableTree } from './FilterableTree'
import { groupBy } from 'lodash'

export const useStoryBrowser = ({
  modules: modulesInput,
  useIframe = false,
}: {
  /** Story modules eg. [import('./myStory.stories.tsx'), someModule, ...] */
  modules: StoryModule[] | Record<string, StoryModule>
  useIframe?: boolean
}) => {
  const modules =
    modulesInput instanceof Array ? modulesInput : Object.values(modulesInput)

  const allModuleKeys = modules
    .map((mod) => Object.keys(mod))
    .flat()
    .join()

  const stories: StoryComponentMap = useMemo(
    () =>
      new Map(
        modules
          .map(({ default: meta = {}, ...exportMembers }) => {
            const components: [string, StoryComponent][] = []
            const kinds = meta.title?.split('/').map(sanitize) ?? []

            for (const [key, val] of Object.entries(exportMembers)) {
              if (typeof val === 'function') {
                const Story = val as StoryFn
                const id = toId(kinds.join('-'), key)
                const isIframed = Story.useIframe ?? meta.useIframe ?? useIframe

                components.push([
                  id,
                  {
                    kinds,
                    Story,
                    storyId: id,
                    name: storyNameFromExport(key),
                    useIframe: isIframed,
                  },
                ])
              }
            }

            return components
          })
          .flat(),
      ),
    [allModuleKeys],
  )

  return { stories, modules }
}

interface ModuleInputs {
  modules: StoryModule[]
}
interface StoriesInputs {
  stories: StoryComponentMap
}

type ExclusiveInputs = ModuleInputs | StoriesInputs

export const StoryBrowser: FC<
  {
    activeStoryId?: string
    /** Use this to return a `src` url for an <iframe src={src} /> */
    onStoryUri?(story: StoryComponent): string
    onActiveStoryIdChanged?(id: undefined | string): void
    layout?: {
      /**
       * Adds css to make the component take all available space.
       * @default true
       */
      asFullscreenOverlay?: boolean
    }
    className?: string
    context?: {}
  } & ExclusiveInputs
> = ({
  context = {},
  onActiveStoryIdChanged,
  activeStoryId,
  className,
  layout,
  onStoryUri,
  ...input
}) => {
  const stories =
    'modules' in input
      ? useStoryBrowser({ modules: input.modules }).stories // eslint-disable-line
      : input.stories

  const activeStory = stories.get(activeStoryId!)
  const storyKeys = [...stories.keys()]

  useEffect(() => {
    if (activeStory) return

    const firstKey = storyKeys[0]

    if (!firstKey) return

    onActiveStoryIdChanged?.(firstKey)
  }, [activeStoryId, storyKeys.join('')])

  const [treeNodes, setTreeNodes] = useState<Node[]>(() =>
    createTreeNodesFromStories({ stories: [...stories.values()] }),
  )
  const iframeSrc = !!activeStory?.useIframe && onStoryUri?.(activeStory)

  return (
    <$StoryBrowser
      asFullscreenOverlay={!!layout?.asFullscreenOverlay}
      className={className}
    >
      <$StoryBrowserInner>
        <ReactResizeDetector handleHeight handleWidth>
          {({ height, targetRef }) => (
            <$StoryList>
              <$FilterableTree>
                <FilterableTree
                  nodes={[]}
                  onNodes={(n) => {
                    console.log({ n })
                    setTreeNodes(n)
                  }}
                  onSelect={(action) => {
                    console.log(action)
                  }}
                />
              </$FilterableTree>
            </$StoryList>
          )}
        </ReactResizeDetector>
        {iframeSrc && <$StoryIFrame src={iframeSrc} />}
        {!iframeSrc && <RenderStory story={activeStory} context={context} />}
      </$StoryBrowserInner>
    </$StoryBrowser>
  )
}

const $FilterableTree = styled.div`
  && {
    &,
    .tree-filter-container {
      height: 100%;
    }
  }
`

export const RenderStory: FC<{
  story?: StoryComponent
  context?: {}
}> = ({ story, context = {} }) => (
  <$StoryRenderWrapper>
    {(() => {
      if (!story) return <></>

      return <story.Story {...context} />
    })()}
  </$StoryRenderWrapper>
)

function createTreeNodesFromStories({
  stories,
}: {
  stories: StoryComponent[]
}): any[] {
  /** For components without a kind */
  const unkindedKind = '*'
  const makeKindKey = (kinds: string[]) => kinds.join('.')
  const storyGroups = groupBy(stories, (s) => makeKindKey(s.kinds))
  const storyGroupKeys = [unkindedKind, ...Object.keys(storyGroups)]

  function createNodes(kindKey: string): any[] {
    const childStories = storyGroups[kindKey] ?? []
    const childStoryGroupKeys = storyGroupKeys.filter(
      (k) => k !== kindKey && k.startsWith(kindKey),
    )

    const childrenNodes = childStories.map(({ name, storyId, kinds }) => {
      const key = makeKindKey(kinds)

      return {
        id: storyId,
        name: name,
        // children: createNodes(key),
      }
    })

    const childrenGroups = childStoryGroupKeys.map((k) => ({
      id: k,
      name: k,
      children: createNodes(k),
    }))

    return [...childrenGroups, ...childrenNodes]
  }

  return storyGroupKeys.map((k) => ({
    id: k,
    name: k,
    children: createNodes(k),
  }))
}

export const $StoryListItem = styled.a`
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
`

export const $StoryRenderWrapper = styled.main`
  height: 100%;
  width: 100%;

  flex-grow: 1;
`

export const $StoryIFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
`

export const $StoryList = styled.section`
  color: #fffc;
  height: 100%;
  font-size: 0.75em;
  position: relative;
`

export const $StoryBrowserInner = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`

export const $StoryBrowser = styled.main<{ asFullscreenOverlay: boolean }>`
  width: 100%;
  height: 100%;

  background: #222;

  ${({ asFullscreenOverlay }) =>
    asFullscreenOverlay
      ? css`
          position: fixed;
          top: 0;
          left: 0;
        `
      : ''}
`

export interface StoryModule {
  default: {
    title?: string
    component?: StoryFn
    useIframe?: boolean
  }
  [k: string]: StoryFn | unknown
}

export type StoryFn = {
  (context: any): JSX.Element
  useIframe?: boolean
}
export interface StoryComponent {
  storyId: string
  kinds: string[]
  name: string
  Story: StoryFn
  useIframe: boolean
}

export type StoryComponentMap = Map<StoryComponent['storyId'], StoryComponent>

/** Function JSX component */
export type FC<P extends {} = {}> = (p: P) => JSX.Element

/** Function JSX component, with children */
export type FCC<P = {}> = (p: P & { children: ReactNode }) => JSX.Element
