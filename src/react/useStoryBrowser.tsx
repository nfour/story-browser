import { useMemo } from 'react'
import { sanitize, storyNameFromExport, toId } from '@componentdriven/csf'
import {
  StoryModule,
  StoryComponentMap,
  StoryComponent,
  StoryFn,
} from './StoryBrowser'
import { isPlainObject } from 'lodash'

export type ModuleInput = StoryModule[] | Record<string, StoryModule>

export const useStoryBrowser = ({
  modules: modulesInput,
  useIframe = false,
}: {
  /** Story modules eg. [import('./myStory.stories.tsx'), someModule, ...] */
  modules: ModuleInput
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
              if (isReactComponent(val)) {
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

const isReactComponent = (v: any) =>
  typeof v === 'function' ||
  (isPlainObject(v) && v.$$typeof === Symbol.for('react.memo'))
