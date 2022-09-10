import { useState } from 'react'
import * as stories from './nesting/folder/STORY_MAP'
import { XRoute, XRouter } from 'xroute'
import { createBrowserHistory } from 'history'
import { StoryBrowserPage } from '../src'
import { observer } from 'mobx-react-lite'
import { css, Global } from '@emotion/react'

export const Root = observer(() => {
  const [router] = useState(
    () =>
      new XRouter(
        [
          XRoute(
            'storyBrowser',
            '/:story?',
            {} as { pathname: { story?: string }; search: {} },
          ),
          XRoute(
            'story',
            '/iframe/:story',
            {} as { pathname: { story: string }; search: {} },
          ),
        ],
        createBrowserHistory(),
      ),
  )

  return (
    <>
      <Global
        styles={css`
          body {
            font-family: 'Open Sans', Arial;
          }
        `}
      />
      <StoryBrowserPage
        {...{
          stories,
          onRouteChange(route) {
            if (route.kind === 'indexPage') {
              router.routes.storyBrowser.push({
                pathname: { story: route.storyId },
              })
            }

            if (route.kind === 'storyPage') {
              router.routes.story.push({ pathname: { story: route.storyId } })
            }
          },
          route: (() => {
            if (router.routes.storyBrowser.isActive)
              return {
                kind: 'indexPage',
                storyId: router.routes.storyBrowser.pathname?.story,
                layout: {
                  branding: () => (
                    <>
                      Story Browser
                      <br />
                      Root Test
                    </>
                  ),
                },
              }
            if (router.routes.story.isActive)
              return {
                kind: 'storyPage',
                storyId: router.routes.story.pathname!.story,
              }

            return { kind: 'indexPage', storyId: undefined }
          })(),
        }}
      />
    </>
  )
})
