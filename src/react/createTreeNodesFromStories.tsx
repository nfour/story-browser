import { TreeNode, TreeNodeBranch, TreeNodeLeaf } from './FilterableTree'
import { last, uniq } from 'lodash'
import { StoryComponent } from './StoryBrowser'
import { sentenceCase } from 'change-case'

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
      .map((story) =>
        story.kinds.reduce((prev, curr) => {
          return [...prev, makePath([...prev, curr])]
        }, [] as string[]),
      )
      .flat(),
  )

  const rootBranchPaths = uniq(stories.map((story) => story.kinds[0]))

  function makeBranchNode(parentPath: string): TreeNode {
    const childStoriesAtPath = stories.filter(
      (s) => makePath(s.kinds) === parentPath,
    )

    const childBranchesAtPath = branchPaths
      .filter((p) => makePath(p.split(delimiter).slice(0, -1)) === parentPath)
      .map((p) => makeBranchNode(p))

    const name = sentenceCase(last(parentPath.split(delimiter))!)

    function makeChildNode(story: StoryComponent) {
      return {
        kind: 'leaf',
        name: story.name,
        id: story.storyId,
      } as TreeNodeLeaf
    }

    const node: TreeNodeBranch = {
      kind: 'branch',
      id: parentPath,
      isOpen: true,
      nodes: [
        ...childBranchesAtPath,
        ...childStoriesAtPath.map((s) => makeChildNode(s)),
      ],
      name,
    }

    return node
  }

  return rootBranchPaths.map((path) => makeBranchNode(path)).flat()
}
