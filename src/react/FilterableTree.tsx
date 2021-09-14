import * as React from 'react'
import Tree, {
  FilteringContainer,
  Node,
  NodeAction,
  selectors,
  FlattenedNode,
} from 'react-virtualized-tree'
import styled from '@emotion/styled'

export const FilterableTree = ({
  nodes,
  onNodes,
  onSelect,
  className,
}: {
  className?: string
  nodes: Node[]
  onNodes(nodes: Node[]): void
  onSelect(action: NodeAction): void
}) => {
  return (
    <$TreeContainer>
      <FilteringContainer
        nodes={nodes}
        indexSearch={(searchTerm) => ({ name }) => {
          return (
            name.toUpperCase().indexOf(searchTerm.toUpperCase().trim()) > -1
          )
        }}
      >
        {(p) => (
          <Tree nodes={p.nodes} onChange={onNodes} {...{ className }}>
            {({ style, node, ...rest }) => (
              <div style={style}>
                <ItemRenderer
                  node={node}
                  {...rest}
                  onChange={(a) => {
                    rest.onChange(a)
                    onSelect(a)
                  }}
                >
                  {node.name}
                </ItemRenderer>
              </div>
            )}
          </Tree>
        )}
      </FilteringContainer>
    </$TreeContainer>
  )
}

const ItemRenderer = ({
  node,
  onChange,
}: {
  onChange(nodes: NodeAction): void
  node: FlattenedNode
  children: React.ReactNode
  index: number
}) => {
  const { hasChildren, isExpanded } = selectors.getNodeRenderOptions(node)

  const select = () =>
    onChange({
      ...selectors.updateNode(node, { expanded: !isExpanded }),
    })

  return (
    <>
      <span onClick={select}>
        {hasChildren ? (
          <>
            <button onClick={select}>--</button>
            {node.name}
          </>
        ) : (
          <>{node.name}</>
        )}
      </span>
    </>
  )
}

const $TreeContainer = styled.div`
  height: 100%;
  width: 100%;
  && {
    i {
      border: 0;
      outline: 0;
    }
  }
`
