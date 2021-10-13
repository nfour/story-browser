import * as React from 'react';
import Tree, { FilteringContainer, selectors, } from 'react-virtualized-tree';
import styled from '@emotion/styled';
export const FilterableTree = ({ nodes, onNodes, onSelect, className, }) => {
    return (React.createElement($TreeContainer, null,
        React.createElement(FilteringContainer, { nodes: nodes, indexSearch: (searchTerm) => ({ name }) => name.toUpperCase().indexOf(searchTerm.toUpperCase().trim()) > -1 }, (p) => (React.createElement(Tree, { nodes: p.nodes, onChange: onNodes, ...{ className } }, ({ style, node, ...rest }) => (React.createElement("div", { style: style },
            React.createElement(ItemRenderer, { node: node, ...rest, onChange: (a) => {
                    rest.onChange(a);
                    onSelect(a);
                } }, node.name))))))));
};
const ItemRenderer = ({ node, onChange, }) => {
    const { hasChildren, isExpanded } = selectors.getNodeRenderOptions(node);
    const select = () => onChange({
        ...selectors.updateNode(node, { expanded: !isExpanded }),
    });
    return (React.createElement(React.Fragment, null,
        React.createElement("span", { onClick: select }, hasChildren ? (React.createElement(React.Fragment, null,
            React.createElement("button", { onClick: select }, "--"),
            node.name)) : (React.createElement(React.Fragment, null, node.name)))));
};
const $TreeContainer = styled.div `
  height: 100%;
  width: 100%;
  && {
    i {
      border: 0;
      outline: 0;
    }
  }
`;
