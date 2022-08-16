import { useMemo, useEffect, ReactNode, useState } from 'react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { FilterableTree } from './FilterableTree'
import { createTreeNodesFromStories } from './createTreeNodesFromStories'
import { minimizedSidebarWidthPx, StoryBrowserClasses } from './constants'
import { useStoryBrowser } from './useStoryBrowser'
import { cx } from '@emotion/css'

interface ModuleInputs {
  modules: StoryModule[]
}
interface StoriesInputs {
  stories: StoryComponentMap
}

type ExclusiveInputs = ModuleInputs | StoriesInputs

export const StoryBrowser = (() => {
  const StoryBrowser: FC<
    {
      activeStoryId?: string
      /** Use this to return a `src` url for an <iframe src={src} /> */
      onStoryUri?(story: StoryComponent): string
      onActiveStoryIdChanged?(id: undefined | string): void
      layout?: {
        /** Initial theme state. Can be changed in sidebar UI. */
        initialTheme?: 'light' | 'dark'
        /**
         * A branding section at the top of the sidebar.
         * @default 'storyBrowser'
         * @option 'storyBrowser'
         * @option `undefined` to hide
         * @option () => ReactNode to provide your own
         */
        branding?: 'storyBrowser' | 'none' | (() => JSX.Element)
        /** Whether the sidebar is closed initially */
        initialSidebarPosition?: 'open' | 'closed'
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
    layout: {
      asFullscreenOverlay = true,
      initialTheme = 'dark',
      branding = 'storyBrowser',
      initialSidebarPosition = 'open',
    } = {},
    onStoryUri,
    ...input
  }) => {
    const [theme, setTheme] = useState(initialTheme)
    const [sidebarPosition, setSidebarPosition] = useState(
      initialSidebarPosition,
    )

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
        asFullscreenOverlay={asFullscreenOverlay}
        className={cx(className, StoryBrowserClasses.Root)}
        isMinimized={sidebarPosition === 'closed'}
      >
        <$StoryBrowserInner>
          <$Sidebar className={StoryBrowserClasses.SidebarBox}>
            <$FilterableTree
              nodes={treeNodes}
              selectedId={activeStoryId}
              onSelect={(node) => {
                onActiveStoryIdChanged?.(node?.id)
              }}
            />
            <$SidebarBottom className={StoryBrowserClasses.SidebarBottomBox}>
              <div>
                <button
                  className={StoryBrowserClasses.ThemeToggleButton}
                  title="Toggle dark/light theme"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <>&#x25D2;</> : <>&#x25D3;</>}
                </button>
              </div>
              <$BrandingBox className={StoryBrowserClasses.SidebarBrandingBox}>
                {(() => {
                  if (branding === 'storyBrowser')
                    return (
                      <$StoryBrowserLogo>
                        <b>Story</b>
                        <br />
                        Browser
                      </$StoryBrowserLogo>
                    )

                  if (typeof branding === 'function') {
                    const Comp = branding

                    return <Comp />
                  }

                  return <></>
                })()}
              </$BrandingBox>
              <div>
                <button
                  className={StoryBrowserClasses.OpenCloseButton}
                  title="Open or close the sidebar"
                  onClick={() =>
                    setSidebarPosition(
                      sidebarPosition === 'open' ? 'closed' : 'open',
                    )
                  }
                >
                  <big>
                    {sidebarPosition === 'open' ? <>&#8249;</> : <>&#8250;</>}
                  </big>
                </button>
              </div>
            </$SidebarBottom>
          </$Sidebar>
          {iframeSrc ? (
            <$StoryRenderWrapper className={StoryBrowserClasses.RenderWindow}>
              <$StoryIFrame src={iframeSrc} />
            </$StoryRenderWrapper>
          ) : (
            <RenderStory story={activeStory} context={context} />
          )}
        </$StoryBrowserInner>
      </$StoryBrowser>
    )
  }

  return Object.assign(StoryBrowser, {
    Classes: StoryBrowserClasses,
  }) as typeof StoryBrowser & {
    Classes: typeof StoryBrowserClasses
  }
})()

export const RenderStory: FC<{
  story?: StoryComponent
  context?: {}
}> = ({ story, context = {} }) => (
  <$StoryRenderWrapper className={StoryBrowserClasses.RenderWindow}>
    {(() => {
      if (!story) return <></>

      return <story.Story {...context} />
    })()}
  </$StoryRenderWrapper>
)

type $StoryBrowserProps = {
  asFullscreenOverlay: boolean
  colorScheme: 'light' | 'dark'
  isMinimized?: boolean
}
const $StoryBrowser = styled.main<$StoryBrowserProps>`
  width: 100%;
  height: 100%;
  transition: all 0.5s ease;

  .${FilterableTree.Classes.Root} {
    transition: all 0.5s ease;
  }

  ${({ isMinimized }) =>
    isMinimized
      ? css`
          .${StoryBrowser.Classes.SidebarBox} {
            width: ${minimizedSidebarWidthPx}px;
            transition: all 0.5s ease;
            overflow: hidden;
          }
          .${FilterableTree.Classes.Root} {
            overflow: hidden;
            padding-left: ${minimizedSidebarWidthPx * 1.25}px;
          }

          .${StoryBrowser.Classes.SidebarBottomBox} {
            padding-left: 0.25em;
            .${StoryBrowser.Classes.SidebarBrandingBox},
              button:not(.${StoryBrowser.Classes.OpenCloseButton}) {
              display: none;
            }
          }
        `
      : ''}

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
  padding: 0.25em 0.25em;
  box-shadow: 0 -1px 0 1px var(--sb-sidebar-shadow);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  opacity: 0.9;
  align-items: center;

  button {
    border: 2px solid var(--sb-sidebar-shadow);
    padding: 0.15rem 0.5rem 0.16rem;
    height: 100%;
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

    /** Means its a big wonky character */
    big {
      font-size: 1.5em;
      font-weight: bold;
      line-height: 0.5em;
    }
  }
`

const $BrandingBox = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
`

const $StoryBrowserLogo = styled.div`
  font-size: 11px;
  width: 100%;
  padding: 0 0.5rem;
  opacity: 0.5;
  text-transform: uppercase;
  white-space: nowrap;
  text-align: center;
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

type ExtraStoryProps = {
  useIframe?: boolean
}

export interface StoryModule {
  default: {
    title?: string
    component?: StoryFn
  } & ExtraStoryProps
  [k: string]: (React.Component<any> & ExtraStoryProps) | unknown
}

export type StoryFn = {
  (context: any): JSX.Element
} & ExtraStoryProps

export type StoryComponent = {
  storyId: string
  kinds: string[]
  name: string
  Story: StoryFn
} & ExtraStoryProps

export type StoryComponentMap = Map<StoryComponent['storyId'], StoryComponent>

/** Function JSX component */
export type FC<P extends {} = {}> = (p: P) => JSX.Element

/** Function JSX component, with children */
export type FCC<P = {}> = (p: P & { children: ReactNode }) => JSX.Element
