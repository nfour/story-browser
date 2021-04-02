# Story Browser

Render React based [CSF (Component Story Format)](https://storybook.js.org/docs/react/api/csf/) files using a react component!

**Features**:
- [x] Render CSF 
- [x] Render CSF components in `iframes` _(Optional, default:false)_
- [x] CLI tool to generate import maps for stories
- [x] Story Browser can be styled
- [x] Story Browser has usable default layout
- [ ] **Planned**:
  - [ ] Sidebar listing is a [nested & collapsable * searchable tree](https://github.com/diogofcunha/react-virtualized-tree)
  - [ ] Story Browser default layout is good enough
  - [ ] Can zoom a component/iframe
  - [ ] Snowpack routing integration example

**Not planned**:
- Full CSF support
  
## React Usage

```tsx
import { StoryBrowser, useStoryBrowser } from 'story-browser'
import * as modules from './storymap'

export default ({ route }) => {
  const { stories } = useStoryBrowser({ modules })

  return (
    <StoryBrowser
      stories={stories}
      activeStoryId={route.params?.story}
      onActiveStoryIdChanged={(story) => route.push({ story })}
      layout={{ asFullscreenOverlay: true }}
    />
  )
}
```

> In this example, `route.params.story` contains the active story id,    
> and `route.push({ ... })` sets it

Its up to you to route this component.

See the full example [./testProject/index.tsx](./testProject/index.tsx) for details.


## CLI

```
yarn add story-browser

yarn makeStoryMap '**/*.stories.tsx' --output ./src/storyBrowser/storiesMap.ts
```

> The above generates an import mapping at `./src/storyBrowser/storymap.ts`    
> with all matched files from the provided glob pattern(s)

## This project

## Contributing

```bash
git clone https://github.com/nfour/story-browser.git
cd story-browser
yarn
yarn build
yarn start
```