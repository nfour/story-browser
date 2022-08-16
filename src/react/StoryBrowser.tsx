import { useMemo, useEffect, ReactNode, useState } from 'react'
import { sanitize, storyNameFromExport, toId } from '@componentdriven/csf'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { FilterableTree } from './FilterableTree'
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
    /** Initial theme state. Can be changed in sidebar UI. */
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
  theme: inputTheme = 'dark',
  ...input
}) => {
  const [theme, setTheme] = useState(inputTheme)
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
        <$Sidebar>
          <$FilterableTree
            nodes={treeNodes}
            selectedId={activeStoryId}
            onSelect={(node) => {
              onActiveStoryIdChanged?.(node?.id)
            }}
          />
          <$SidebarBottom>
            <button
              title="Toggle dark/light theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <>&#x25D2;</> : <>&#x25D3;</>}
            </button>
          </$SidebarBottom>
        </$Sidebar>
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

type $StoryBrowserProps = {
  asFullscreenOverlay: boolean
  colorScheme: 'light' | 'dark'
}
const $StoryBrowser = styled.main<$StoryBrowserProps>`
  width: 100%;
  height: 100%;

  ${({ colorScheme }) =>
    colorScheme === 'dark'
      ? css`
          --sb-sidebar-guideline: #2d2d2d;
          --sb-sidebar-bg: #1f1f1f;
          --sb-sidebar-fg: #898989;
          --sb-sidebar-shadow: rgba(0, 0, 0, 0.1);
          --sb-sidebar-selected-bg: #ffffffdd;
          --sb-sidebar-selected-fg: black;
          --sb-content-bg: #1f1f1f;
          --sb-content-fg: #ddd;
        `
      : css`
          --sb-sidebar-guideline: #e7e7e7;
          --sb-sidebar-bg: #f1f1f1;
          --sb-sidebar-fg: #4b4b4b;
          --sb-sidebar-shadow: rgba(0, 0, 0, 0.05);
          --sb-sidebar-selected-bg: #2b2b2bdd;
          --sb-sidebar-selected-fg: #ededed;
          --sb-content-bg: #ffffff;
          --sb-content-fg: #000000;
        `}

  ${({ asFullscreenOverlay }) =>
    asFullscreenOverlay
      ? css`
          position: fixed;
          top: 0;
          left: 0;
        `
      : ''}
`

const $Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  justify-content: space-between;
  box-shadow: inset -8px 0 8px var(--sb-sidebar-shadow),
    inset -1px 0 0 1px var(--sb-sidebar-shadow);
  background: var(--sb-sidebar-bg);
  color: var(--sb-sidebar-fg);
`

const $FilterableTree = styled(FilterableTree)`
  line-height: 1.8em;
  overflow: auto;
  font-size: 0.8em;
  padding: 1em 1.5em 1em 1.25em;
  max-width: 250px;
  width: auto;

  &,
  * {
    box-sizing: border-box;
  }

  && {
    .${FilterableTree.Classes.NodeTitle} {
      font-size: 1.1em;
      font-weight: 600;
    }
    .${FilterableTree.Classes.NodeBranch} {
      > .${FilterableTree.Classes.NodeTitle} {
        display: flex;
        align-items: center;
        opacity: 0.9;

        &:before {
          transition: all 0.5s ease;
          content: '\\25E4';
          margin-left: -2.5ex;
          margin-right: 0.5ex;
          font-size: 75%;
          opacity: 0.6;
        }
      }

      &.${FilterableTree.Classes.NodeBranchOpen} {
        > .${FilterableTree.Classes.NodeTitle} {
          opacity: 0.6;
          &:before {
            content: '\\25E3';
            opacity: 0.3;
          }
        }
      }
    }

    .${FilterableTree.Classes.NodeChildren} {
      border-left: 1px solid var(--sb-sidebar-guideline);
    }
    .${FilterableTree.Classes.NodeLeaf} {
      transition: all 0.1s ease;

      > .${FilterableTree.Classes.NodeTitle} {
        font-size: 1em;
      }

      &.${FilterableTree.Classes.NodeLeafSelected}
        .${FilterableTree.Classes.NodeTitle} {
        background: var(--sb-sidebar-selected-bg);
        color: var(--sb-sidebar-selected-fg);
        border-radius: 3px;
        text-decoration: none;
      }
    }
  }
`

const $SidebarBottom = styled.div`
  padding: 0.25em 0.75em;
  box-shadow: 0 -1px 0 1px var(--sb-sidebar-shadow);
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  opacity: 0.9;

  button {
    border: 2px solid var(--sb-sidebar-shadow);
    padding: 0.15em 0.5em 0.3em;
    border-top-color: transparent;
    outline: 0;
    background: transparent;
    color: inherit;
    border-radius: 3px;
    transition: all 0.5s ease;
    box-shadow: 0 1px 2px 1px var(--sb-sidebar-shadow);
    cursor: pointer;
    opacity: 0.75;

    &:hover {
      border-color: var(--sb-sidebar-fg);
      opacity: 0.5;
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
  flex-direction: row;
  height: 100%;
  width: 100%;
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
