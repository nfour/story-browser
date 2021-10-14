import React from 'react'
import Tree from 'antd/es/tree'
import styled from '@emotion/styled'

export const FilterableTree = ({
  nodes,
  onNodes,
  onSelect,
  className,
}: {
  className?: string
  nodes: any[]
  onNodes(nodes: any[]): void
  onSelect(action: any): void
}) => {
  return (
    <$TreeContainer>
      <Tree
        treeData={[
          {
            title: 'parent 1',
            key: '0-0',
            children: [
              {
                title: 'parent 1-0',
                key: '0-0-0',
                disabled: true,
                children: [
                  {
                    title: 'leaf',
                    key: '0-0-0-0',
                    disableCheckbox: true,
                  },
                  {
                    title: 'leaf',
                    key: '0-0-0-1',
                  },
                ],
              },
              {
                title: 'parent 1-1',
                key: '0-0-1',
                children: [
                  {
                    title: <span style={{ color: '#1890ff' }}>sss</span>,
                    key: '0-0-1-0',
                  },
                ],
              },
            ],
          },
        ]}
      />
    </$TreeContainer>
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
