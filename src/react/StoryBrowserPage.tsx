import { ModuleInput, useStoryBrowser } from './useStoryBrowser'
import { RenderStory, StoryBrowser } from './StoryBrowser'
import { PropsOf } from '@emotion/react'

type StoryBrowserProps = PropsOf<typeof StoryBrowser>

/** Simplifies Story Browser integration with minimized configuration */
export const StoryBrowserPage = <
  P extends {
    stories: ModuleInput
    route:
      | {
          kind: 'indexPage'
          storyId: undefined | string
          layout?: StoryBrowserProps['layout']
        }
      | {
          kind: 'storyPage'
          storyId: string
          context?: Record<any, any>
        }

    onRouteChange(route: P['route']): void

    /** When using iframes, this is required to return a `src` url for an <iframe src={src} /> */
    onStoryUri?: StoryBrowserProps['onStoryUri']
  },
>({
  stories: modules,
  route,
  onRouteChange,
  onStoryUri,
}: P) => {
  const { stories } = useStoryBrowser({ modules })

  if (route.kind === 'indexPage') {
    return (
      <StoryBrowser
        stories={stories}
        activeStoryId={route.storyId}
        onActiveStoryIdChanged={(storyId) =>
          onRouteChange({ kind: 'indexPage', storyId })
        }
        onStoryUri={onStoryUri}
        layout={{
          branding: 'storyBrowser',
          initialSidebarPosition: 'open',
          initialTheme: 'light',
          asFullscreenOverlay: true,
        }}
      />
    )
  }

  if (route.kind === 'storyPage') {
    const storyId = route.storyId
    const story = stories.get(storyId)!

    if (!story) return <></>

    return <RenderStory story={story} context={route.context} />
  }

  return <></>
}
