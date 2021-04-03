import { sanitize, storyNameFromExport, toId } from '@componentdriven/csf'
import { css } from '@emotion/react'
import * as React from 'react'
import styled from '@emotion/styled'
import Tree, {
  Expandable,
  Favorite,
  FilteringContainer,
  Node,
} from 'react-virtualized-tree'
import 'react-virtualized-tree/styles.css'
import 'react-virtualized-tree/lib/main.css'

export const useStoryBrowser = ({
  modules: modulesInput,
  useIframe = false,
}: {
  /** Story modules eg. [import('./myStory.stories.tsx'), someModule, ...] */
  modules: (StoryModule | Promise<StoryModule>)[] | Record<string, StoryModule>
  useIframe?: boolean
}) => {
  const [modules, setModules] = React.useState<StoryModule[]>([])

  const allModuleKeys = modules
    .map((mod) => Object.keys(mod))
    .flat()
    .join()

  React.useEffect(() => {
    Promise.all(
      modulesInput instanceof Array
        ? modulesInput
        : Object.values(modulesInput),
    ).then((m) => setModules(m))
  }, [modulesInput])

  const stories: StoryComponentMap = React.useMemo(
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
    onIframeSrc?(story: StoryComponent): string
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
  onIframeSrc,
  ...input
}) => {
  const stories =
    'modules' in input
      ? useStoryBrowser({ modules: input.modules }).stories // eslint-disable-line
      : input.stories

  const activeStory = stories.get(activeStoryId!)
  const storyKeys = [...stories.keys()]

  React.useEffect(() => {
    if (activeStory) return

    const firstKey = storyKeys[0]

    if (!firstKey) return

    onActiveStoryIdChanged?.(firstKey)
  }, [activeStoryId, storyKeys.join('')])

  const [treeNodes, setTreeNodes] = React.useState<Node[]>(() => {
    /** For components without a kind */
    const unkindedKind = '*'
    const items = [...stories.entries()]
    const topLevelKinds = new Set([unkindedKind, ...items.map(([key, { kinds }]) => kinds[0]).flat()])

    function createNode({ kinds, name, storyId}: StoryComponent) {
      return {
        id: storyId,
        name: name,
        children: items.filter(())
      }
    }

    return [...topLevelKinds.values()].map((kind) => {
      return {
        id: kind,
        name: kind,
        children: items.filter(())
      }
    })
  }

  return (
    <$StoryBrowser
      asFullscreenOverlay={!!layout?.asFullscreenOverlay}
      className={className}
    >
      <$StoryBrowserInner>
        <$StoryList>
          {/* {[...stories.entries()].map(([key, { name, kinds }]) => (
            <$StoryListItem
              className={cx({ isActive: activeStoryId === key })}
              key={`${key}${name}`}
              onClick={() => {
                onActiveStoryIdChanged?.(key)
              }}
            >
              <small>{kinds.map(storyNameFromExport).join(' • ')}</small>
              <span>{name}</span>
            </$StoryListItem>
          ))} */}
          <FilteringContainer
            nodes={treeNodes}
            indexSearch={(searchTerm) => ({ name }) => {
              return (
                name.toUpperCase().indexOf(searchTerm.toUpperCase().trim()) > -1
              )
            }}
          >
            {({ nodes }) => (
              <Tree nodes={nodes} onChange={setTreeNodes}>
                {({ style, node, ...rest }) => (
                  <div style={style}>
                    <Expandable node={node} {...rest}>
                      <Favorite node={node} {...rest}>
                        {node.name}
                      </Favorite>
                    </Expandable>
                  </div>
                )}
              </Tree>
            )}
          </FilteringContainer>
        </$StoryList>
        {(() => {
          if (!activeStory) return <>No story selected.</>
          if (onIframeSrc && activeStory.useIframe) {
            return <$StoryIFrame src={onIframeSrc(activeStory)} />
          }

          return <RenderStory story={activeStory} context={context} />
        })()}
      </$StoryBrowserInner>
    </$StoryBrowser>
  )
}

export const RenderStory: FC<{
  story: StoryComponent
  context?: {}
}> = ({ story: { Story, storyId, name }, context = {} }) => (
  <$StoryRenderWrapper>
    <Story {...context} />
  </$StoryRenderWrapper>
)

export const $StoryListItem = styled.div`
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
export type FCC<P = {}> = (p: P & { children: React.ReactNode }) => JSX.Element
