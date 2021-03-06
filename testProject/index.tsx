import { css } from '@emotion/css'
import * as React from 'react'
import { render } from 'react-dom'
import {
  RenderStory,
  StoryBrowser,
  useStoryBrowser,
} from '../src/react/StoryBrowser'
import * as storyMap from './nesting/folder/STORY_MAP'
import { XRoute, XRouter } from 'xroute'
import { Observer } from 'mobx-react-lite'

const Root = () => {
  const { stories } = useStoryBrowser({ modules: storyMap })

  const [router] = React.useState(
    () =>
      new XRouter([
        XRoute('storyBrowser', '/:story?', {} as { story?: string }),
        XRoute('story', '/iframe/:story', {} as { story: string }),
      ]),
  )

  return (
    <main
      className={css`
        font-family: Arial;
      `}
    >
      <Observer>
        {() => {
          if (router.routes.storyBrowser.isActive) {
            return (
              <StoryBrowser
                stories={stories}
                activeStoryId={router.routes.storyBrowser.params?.story}
                onActiveStoryIdChanged={(story) =>
                  router.routes.storyBrowser.push({ story })
                }
                /** @example "#/story/my-story--id" */
                onStoryUri={({ storyId }) =>
                  `#${router.routes.story.toPath({ story: storyId })}`
                }
                layout={{
                  asFullscreenOverlay: true,
                }}
              />
            )
          }

          if (router.routes.story.isActive) {
            const storyId = router.routes.story.params!.story
            const story = stories.get(storyId)!

            if (!story) return <></>

            // Iframes come out with a red border!
            return (
              <div
                className={css`
                  outline: 2px dashed #9b634d;
                  padding: 4em;
                `}
              >
                <RenderStory story={story} context={{}} />
              </div>
            )
          }

          return <>404</>
        }}
      </Observer>
    </main>
  )
}

render(<Root />, document.getElementById('__root'))

import.meta.hot?.accept()
