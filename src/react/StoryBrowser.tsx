import { useMemo, useEffect, ReactNode } from 'react'
import { sanitize, storyNameFromExport, toId } from '@componentdriven/csf'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { FilterableTree, FilterableTreeClasses } from './FilterableTree'
import { createTreeNodesFromStories } from './createTreeNodesFromStories'

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
    theme?: 'light' | 'dark'
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
  theme = 'dark',
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

  const treeNodes = useMemo(
    () => createTreeNodesFromStories({ stories: [...stories.values()] }),
    [stories],
  )

  const iframeSrc = !!activeStory?.useIframe && onStoryUri?.(activeStory)

  return (
    <$StoryBrowser
      colorScheme={theme}
      asFullscreenOverlay={!!layout?.asFullscreenOverlay}
      className={className}
    >
      <$StoryBrowserInner>
        <$FilterableTree
          nodes={treeNodes}
          selectedId={activeStoryId}
          onSelect={(node) => {
            onActiveStoryIdChanged?.(node?.id)
          }}
        />
        {iframeSrc ? (
          <$StoryRenderWrapper>
            <$StoryIFrame src={iframeSrc} />
          </$StoryRenderWrapper>
        ) : (
          <RenderStory story={activeStory} context={context} />
        )}
      </$StoryBrowserInner>
    </$StoryBrowser>
  )
}

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

const $FilterableTree = styled(FilterableTree)`
  line-height: 1.75em;
  box-shadow: inset -10px 0 10px var(--sb-sidebar-shadow),
    inset -1px 0 0 1px var(--sb-sidebar-shadow);
  overflow: auto;
  font-size: 0.8em;
  color: var(--sb-sidebar-fg);
  background: var(--sb-sidebar-bg);

  padding: 1em 1.5em 1em 0em;
  max-width: 250px;
  width: auto;

  &,
  * {
    box-sizing: border-box;
  }

  .${FilterableTreeClasses.NodeBranch} {
    > .${FilterableTreeClasses.NodeTitle} {
      font-size: 1.1em;
      font-weight: 600;
    }
  }

  && {
    .${FilterableTreeClasses.NodeLeaf} {
      transition: all 0.1s ease;

      > .${FilterableTreeClasses.NodeTitle} {
        font-size: 1em;
      }

      &.${FilterableTreeClasses.NodeLeafSelected}
        .${FilterableTreeClasses.NodeTitle} {
        background: var(--sb-sidebar-selected-bg);
        color: var(--sb-sidebar-selected-fg);
        border-radius: 3px;
        text-decoration: none;
      }
    }
  }
`

const $StoryRenderWrapper = styled.main`
  height: 100%;
  width: 100%;
  padding: 1em;
  flex-grow: 1;
  background: var(--sb-content-bg);
  color: var(--sb-content-fg);
`

const $StoryIFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
  color: black;
`

const $StoryBrowserInner = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`

const $StoryBrowser = styled.main<{
  asFullscreenOverlay: boolean
  colorScheme: 'light' | 'dark'
}>`
  width: 100%;
  height: 100%;
  ${({ colorScheme }) =>
    colorScheme === 'dark'
      ? css`
          --sb-sidebar-bg: #1f1f1f;
          --sb-sidebar-fg: #9b9b9b;
          --sb-sidebar-shadow: rgba(0, 0, 0, 0.15);
          --sb-sidebar-selected-bg: #ffffffdd;
          --sb-sidebar-selected-fg: black;
          --sb-content-bg: #1f1f1f;
          --sb-content-fg: #ddd;
        `
      : css`
          --sb-sidebar-bg: #f1f1f1;
          --sb-sidebar-fg: #252525;
          --sb-sidebar-shadow: rgba(0, 0, 0, 0.05);
          --sb-sidebar-selected-bg: #2b2b2bdd;
          --sb-sidebar-selected-fg: #ededed;
          --sb-content-bg: #ffffff;
          --sb-content-fg: #000000;
        `}

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
