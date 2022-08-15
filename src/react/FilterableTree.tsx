import { makeAutoObservable, reaction } from 'mobx'
import { useEffect, useMemo } from 'react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'
import { motion, AnimatePresence } from 'framer-motion'
import { cx } from '@emotion/css'

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
    const prev = this.branchVisibilityMap.get(path)
    const visibility = to ?? prev !== undefined ? !prev : false

    this.branchVisibilityMap.set(path, visibility)
  }

  getNodePath = (parentPath: string, node: TreeNode) => {
    return `${parentPath}.${node.id}`
  }
}

export const FilterableTree = observer<{
  className?: string
  nodes: TreeNode[]
  onSelect(node?: TreeNode): void
  onInit?(state: TreeState): void
}>(({ nodes, onSelect, onInit, className }) => {
  const state = useMemo(() => new TreeState(nodes), [nodes])

  useEffect(
    () =>
      reaction(
        () => state.selectedNode,
        (node) => onSelect(node),
      ),
    [],
  )

  return (
    <$TreeContainer {...{ className }}>
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

export enum ClassNames {
  Root = 'root',
  NodeBranch = 'node-branch',
  NodeLeaf = 'node-leaf',
  NodeLeafSelected = 'node-leaf-selected',
  NodeBranchOpen = 'node-branch-open',
  NodeTitle = 'node-title',
}

const NodeRenderer = observer<{
  state: TreeState
  node: TreeNode
  parentPath: string
}>(({ node, state, parentPath }) => {
  const path = state.getNodePath(parentPath, node)
  const isOpen = state.branchVisibilityMap.get(path) ?? true
  const isSelected = state.selectedNode?.id === node.id

  if (node.kind === 'branch')
    return (
      <$NodeContainer className={cx(ClassNames.NodeBranch)}>
        <$NodeTitle
          className={cx(ClassNames.NodeTitle)}
          onClick={() => state.toggleBranchVisibility(path)}
        >
          {node.name}
        </$NodeTitle>
        <AnimatePresence initial={isOpen}>
          {isOpen && (
            <motion.section
              key={path + 'content'}
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: 'auto', scale: 1 },
                collapsed: { opacity: 0, height: 0, scale: 0.8 },
              }}
              transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <$NodeChildren>
                {node.nodes.map((childNode) => (
                  <NodeRenderer
                    key={childNode.id}
                    node={childNode}
                    parentPath={path}
                    state={state}
                  />
                ))}
              </$NodeChildren>
            </motion.section>
          )}
        </AnimatePresence>
      </$NodeContainer>
    )

  return (
    <$NodeContainer
      className={cx(ClassNames.NodeLeaf, {
        [ClassNames.NodeLeafSelected]: isSelected,
      })}
    >
      <$NodeTitle
        className={cx(ClassNames.NodeTitle)}
        onClick={() => state.selectNode(path)}
      >
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
`

const $NodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  padding-left: 1em;

  &.${ClassNames.NodeLeaf} .${ClassNames.NodeTitle} {
    &:hover {
      text-decoration: underline;
    }
  }
  .${ClassNames.NodeLeafSelected} {
    text-decoration: underline;
  }
`

const $NodeTitle = styled.div`
  border: 0;
  padding: 0;
  cursor: pointer;
  padding: 1px 6px;
  white-space: nowrap;
`
