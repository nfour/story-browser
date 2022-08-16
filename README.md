# Story Browser

Story Browser will render React based [CSF (Component Story Format)](https://storybook.js.org/docs/react/api/csf/) files.

> The difference is that this is just a React component, avoiding all of the tooling issues from `StoryBook` and `ViteBook`
> However, you must route to this component and/or embed it into your application yourself

**Features**:
- [x] Render stories in `iframes` _(Optional)_
- [x] CLI to generate an import map for story files in the project
- [x] Can be rethemed (CSS variables & Class names)
- [x] Has dark & light theme
- [x] Sidebar is a nested, collapsable, searchable tree
- [ ] **Planned**:
  - [ ] Can zoom rendered component in/out

**Not planned**:
- Full CSF support

+ [React Usage](#react-usage)
+ [CLI Usage](#cli-usage)
+ [Contributing](#contributing)
  
## React Usage

```tsx
import { StoryBrowser, useStoryBrowser } from 'story-browser'
import * as modules from './storymap'

// This example uses the `xroute` library for rounting
export const StoryBrowserPage = ({ router }) => {
  return (
    <StoryBrowser
      modules={modules}
      activeStoryId={router.routes.storyBrowser.pathname?.story}
      onActiveStoryIdChanged={(story) =>
        router.routes.storyBrowser.push({ pathname: { story } })
      }
      /** @example "/story/my-story--id" */
      onStoryUri={({ storyId }) =>
        router.routes.story.toUri({
          pathname: { story: storyId },
        })
      }
      layout={{
        branding: 'storyBrowser',
        initialSidebarPosition: 'open',
        initialTheme: 'light',
        asFullscreenOverlay: true,
      }}
    />
  )
}
```

> The full example also includes how to utilize iFramed components
> See the full example here: [./testProject/Root.tsx](./testProject/Root.tsx)


## CLI Usage

```bash
# Install it
npm add story-browser
```

```bash
# Generate a story map to import into the component
# This is a simple glob pattern
npm run makeStoryMap './src/**/*.stories.tsx' --output ./src/storyBrowser/storyMap.ts
```

## Contributing

```bash
git clone https://github.com/nfour/story-browser.git
cd story-browser
pnpm i
pnpm dev # start dev server for ./testProject
```