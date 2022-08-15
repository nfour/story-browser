import { makeAutoObservable } from 'mobx'
import { useMemo } from 'react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

class TreeState {
  constructor(public nodes: TreeNode[]) {
    makeAutoObservable(this)
  }

  static ROOT_NODE_ID = ''

  branchVisibilityMap = new Map<string, boolean>()
  // nodeMap = new Map<string, TreeNode>()
  selectedNode: TreeNode | undefined = undefined

  get nodePathMap() {
    const pathMapping = new Map<string, TreeNode>()

    const traverse = (nodes: TreeNode[], parentPath: string) => {
      for (const node of nodes) {
        const path = this.getNodePath(parentPath, node)

        pathMapping.set(path, node)

        if (node.kind === 'branch') traverse(node.nodes, path)
      }
    }

    traverse(this.nodes, TreeState.ROOT_NODE_ID)

    return pathMapping
  }

  selectNode = (path: string) => {
    const node = this.nodePathMap.get(path)

    if (!node) return

    this.selectedNode = node
  }

  toggleBranchVisibility = (path: string, to?: boolean) => {
    const visibility = to ?? !this.branchVisibilityMap.get(path) ?? true

    this.branchVisibilityMap.set(path, visibility)
  }

  getNodePath = (parentPath: string, node: TreeNode) => {
    return `${parentPath}.${node.id}`
  }
}

export const FilterableTree = observer<{
  className?: string
  nodes: TreeNode[]
  onSelect(node: TreeNode): void
  onInit?(state: TreeState): void
}>(({ nodes, onSelect, onInit, className }) => {
  const state = useMemo(() => new TreeState(nodes), [nodes])

  return (
    <$TreeContainer>
      {nodes.map((node) => (
        // Root nodes
        <NodeRenderer
          key={node.id}
          state={state}
          node={node}
          parentPath={TreeState.ROOT_NODE_ID}
        />
      ))}
    </$TreeContainer>
  )
})

export type TreeNode = TreeNodeBranch | TreeNodeLeaf
export interface TreeNodeBranch {
  kind: 'branch'
  id: string
  name: string
  isOpen: boolean
  nodes: TreeNode[]
}
export interface TreeNodeLeaf {
  kind: 'leaf'
  id: string
  name: string
  isSelected: boolean
}

const NodeRenderer = observer<{
  state: TreeState
  node: TreeNode
  parentPath: string
}>(({ node, state, parentPath }) => {
  const path = state.getNodePath(parentPath, node)

  if (node.kind === 'branch')
    return (
      <$NodeContainer>
        <$NodeTitle onClick={() => state.toggleBranchVisibility(path)}>
          {node.name}
        </$NodeTitle>
        <$NodeChildren>
          {node.nodes.map((childNode) => (
            <NodeRenderer
              key={path}
              node={childNode}
              parentPath={path}
              state={state}
            />
          ))}
        </$NodeChildren>
      </$NodeContainer>
    )

  return (
    <$NodeContainer>
      <$NodeTitle onClick={() => state.selectNode(path)}>
        {node.name}
      </$NodeTitle>
    </$NodeContainer>
  )
})

const $NodeChildren = styled.div`
  display: flex;
  flex-direction: column;
`

const $TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  && {
    i {
      border: 0;
      outline: 0;
    }
  }
`

const $NodeFolderDecorator = styled.span`
  margin-left: -3ex;
  margin-right: 1ex;
  opacity: 0.5;
`

const $NodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  font-family: monospace;
  font-size: 1.2em;
  padding-left: 2em;
`

const $NodeTitle = styled.div`
  border: 0;
  padding: 0;
  cursor: pointer;
  border-radius: 3px;
  padding: 1px 6px;
  background: #00000006;
  font-weight: 600;
`
