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

const normalizeModuleInput = (modules: ModuleInput): StoryModule[] => {
  if (Array.isArray(modules)) return modules

  return Object.entries(modules).map(([key, value]) => ({
    ...value,
    default: {
      title: key,
      ...value.default,
    },
  }))
}

export const useStoryBrowser = ({
  modules: modulesInput,
  useIframe = false,
}: {
  /** Story modules eg. [import('./myStory.stories.tsx'), someModule, ...] */
  modules: ModuleInput
  useIframe?: boolean
}) => {
  const modules = normalizeModuleInput(modulesInput)
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
            const kinds =
              meta.title
                ?.split('/')
                .map(sanitize)
                .filter((k) => k.trim() != null) ?? []

            for (const [key, val] of Object.entries(exportMembers)) {
              if (isReactComponent(val)) {
                const Story = val as StoryFn

                if (!kinds.length)
                  throw new Error(
                    'Cant derive a story name. Please provide a title in the default export or provide a object map of modules',
                  )

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
