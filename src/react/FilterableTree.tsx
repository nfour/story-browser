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

  filterText: undefined | string = undefined
  branchVisibilityMap = new Map<string, boolean>()
  // nodeMap = new Map<string, TreeNode>()
  selectedNode: TreeNode | undefined = undefined

  get nodeMapping() {
    const paths = new Map<string, TreeNode>()
    const stories = new Map<string, TreeNode>()

    const traverse = (nodes: TreeNode[], parentPath: string) => {
      for (const node of nodes) {
        const path = this.getNodePath(parentPath, node)

        paths.set(path, node)

        if (node.kind === 'leaf') stories.set(node.id, node)
        if (node.kind === 'branch') traverse(node.nodes, path)
      }
    }

    traverse(this.nodes, TreeState.ROOT_NODE_ID)

    return { paths, stories }
  }

  selectNode = (path: string) => {
    const node =
      this.nodeMapping.paths.get(path) ?? this.nodeMapping.stories.get(path)

    console.log({ path, node, map: this.nodeMapping, nodes: this.nodes })

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

  setFilterText = (text: this['filterText']) => {
    this.filterText = text || undefined
  }

  isNodeFilteredOut = (node: TreeNode) => {
    if (!this.filterText) return false
    if (node.kind === 'leaf')
      return !node.name.toLowerCase().includes(this.filterText.toLowerCase())

    return false
  }
}

export enum FilterableTreeClasses {
  Root = 'root',
  NodeBranch = 'node-branch',
  NodeLeaf = 'node-leaf',
  NodeLeafSelected = 'node-leaf-selected',
  NodeBranchOpen = 'node-branch-open',
  NodeTitle = 'node-title',
  NodeChildren = 'node-children',
  FilterBox = 'filter-box',
  FilterBoxHasContent = 'filter-box-has-content',
}

export const FilterableTree = (() => {
  const FilterableTree = observer<{
    className?: string
    nodes: TreeNode[]
    onSelect(node?: TreeNode): void
    selectedId: undefined | string
    onInit?(state: TreeState): void
  }>(({ nodes, onSelect, onInit, selectedId, className }) => {
    const state = useMemo(() => new TreeState(nodes), [nodes])

    useEffect(
      () =>
        reaction(
          () => state.selectedNode,
          (node) => onSelect(node),
        ),
      [],
    )

    useEffect(() => {
      selectedId && state.selectNode(selectedId)
    }, [selectedId])

    useEffect(() => {
      onInit?.(state)
    }, [])

    return (
      <$TreeContainer {...{ className }}>
        <FilterBox state={state} />
        <$TreeInner>
          {nodes.map((node) => (
            // Root nodes
            <NodeRenderer
              key={node.id}
              state={state}
              node={node}
              parentPath={TreeState.ROOT_NODE_ID}
            />
          ))}
        </$TreeInner>
      </$TreeContainer>
    )
  })

  return Object.assign(FilterableTree, {
    Classes: FilterableTreeClasses,
  }) as typeof FilterableTree & { Classes: typeof FilterableTreeClasses }
})()

const FilterBox = observer<{
  state: TreeState
}>(({ state }) => {
  const hasFilter = state.filterText !== undefined

  return (
    <$FilterBox
      className={cx(FilterableTreeClasses.FilterBox, {
        [FilterableTreeClasses.FilterBoxHasContent]: hasFilter,
      })}
    >
      <input
        placeholder="Filter..."
        value={state.filterText ?? ''}
        onChange={(e) => state.setFilterText(e.target.value)}
      />
      <button
        disabled={!hasFilter}
        onClick={() => state.setFilterText(undefined)}
      >
        &#10005;
      </button>
    </$FilterBox>
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
      <$NodeContainer
        className={cx(FilterableTreeClasses.NodeBranch, {
          [FilterableTreeClasses.NodeBranchOpen]: isOpen,
        })}
      >
        <$NodeTitle
          className={cx(FilterableTreeClasses.NodeTitle)}
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
              <$NodeChildren className={cx(FilterableTreeClasses.NodeChildren)}>
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

  if (state.isNodeFilteredOut(node)) return <></>

  return (
    <$NodeContainer
      className={cx(FilterableTreeClasses.NodeLeaf, {
        [FilterableTreeClasses.NodeLeafSelected]: isSelected,
      })}
    >
      <$NodeTitle
        className={cx(FilterableTreeClasses.NodeTitle)}
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
  width: 100%;
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
  width: 100%;

  section {
    width: 100%;
  }

  .${FilterableTreeClasses.NodeChildren} {
    padding: 0.1em 0;
    padding-left: 0.5em;
    padding-right: 0.5em;
    margin-left: 0.5em;
  }

  &.${FilterableTreeClasses.NodeLeaf} .${FilterableTreeClasses.NodeTitle} {
    &:hover {
      text-decoration: underline;
    }
  }
  .${FilterableTreeClasses.NodeLeafSelected} {
    text-decoration: underline;
  }
`

const $NodeTitle = styled.div`
  border: 0;
  padding: 0;
  cursor: pointer;
  padding: 1px 6px;
  white-space: nowrap;
  min-width: 100%;
`

const $TreeInner = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const $FilterBox = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 0;
  margin-bottom: 1em;
  position: relative;

  input {
    z-index: 1;
    opacity: 0.5;
    transition: all 0.5s ease;

    margin-left: 1em;
    width: 100%;
    background: transparent;
    border: 0;
    border-bottom: 2px solid var(--sb-sidebar-fg);
    padding: 0.25em 0.5em;
    outline: none;
    color: inherit;
    padding-right: 2ex;

    &:focus {
      opacity: 1;
    }
  }

  button {
    z-index: 2;
    margin-left: -3ex;
    border: 0;
    transition: all 0.3s ease;

    background: var(--sb-sidebar-fg);
    color: var(--sb-sidebar-bg);
    border-radius: 3px 3px 3px 0;

    cursor: pointer;

    &:hover {
      outline: 1px solid var(--sb-sidebar-fg);
    }
    &[disabled] {
      cursor: default;
      opacity: 0.25;
      background: transparent;
      color: inherit;
      &:hover {
        outline: none;
      }
    }
  }
`
