import {
  TreeNode,
  TreeNodeBranch,
  TreeNodeLeaf
} from './FilterableTree'
import { groupBy, last, uniq } from 'lodash'
import { StoryComponent } from './StoryBrowser'

export function createTreeNodesFromStories({
  stories,
}: {
  stories: StoryComponent[]
}): TreeNode[] {
  const delimiter = '///'
  /** For components without a kind */
  const makePath = (kinds: string[]) => kinds.join(delimiter)
  const branchPaths = uniq(
    stories
      .map((story) => story.kinds.reduce((prev, curr) => {
        return [...prev, makePath([...prev, curr])]
      }, [] as string[])
      )
      .flat()
  )

  const rootBranchPaths = uniq(stories.map((story) => story.kinds[0]))
  const storyGroups = groupBy(stories, (s) => makePath(s.kinds))

  function makeBranchNode(parentPath: string): TreeNode {
    const childStoriesAtPath = stories.filter(
      (s) => makePath(s.kinds) === parentPath
    )

    const childBranchesAtPath = branchPaths
      .filter((p) => makePath(p.split(delimiter).slice(0, -1)) === parentPath)
      .map((p) => makeBranchNode(p))

    const name = last(parentPath.split(delimiter))!

    function makeChildNode(story: StoryComponent) {
      return {
        name: story.name,
        id: story.storyId,
        isSelected: false,
        kind: 'leaf',
      } as TreeNodeLeaf
    }

    const node: TreeNodeBranch = {
      kind: 'branch',
      id: parentPath,
      isOpen: true,
      name,
      nodes: [
        ...childBranchesAtPath,
        ...childStoriesAtPath.map((s) => makeChildNode(s)),
      ],
    }

    return node
  }

  return rootBranchPaths.map((path) => makeBranchNode(path)).flat()
}
