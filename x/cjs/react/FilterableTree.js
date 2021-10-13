"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterableTree = void 0;
const React = __importStar(require("react"));
const react_virtualized_tree_1 = __importStar(require("react-virtualized-tree"));
const styled_1 = __importDefault(require("@emotion/styled"));
const FilterableTree = ({ nodes, onNodes, onSelect, className, }) => {
    return (React.createElement($TreeContainer, null,
        React.createElement(react_virtualized_tree_1.FilteringContainer, { nodes: nodes, indexSearch: (searchTerm) => ({ name }) => name.toUpperCase().indexOf(searchTerm.toUpperCase().trim()) > -1 }, (p) => (React.createElement(react_virtualized_tree_1.default, { nodes: p.nodes, onChange: onNodes, ...{ className } }, ({ style, node, ...rest }) => (React.createElement("div", { style: style },
            React.createElement(ItemRenderer, { node: node, ...rest, onChange: (a) => {
                    rest.onChange(a);
                    onSelect(a);
                } }, node.name))))))));
};
exports.FilterableTree = FilterableTree;
const ItemRenderer = ({ node, onChange, }) => {
    const { hasChildren, isExpanded } = react_virtualized_tree_1.selectors.getNodeRenderOptions(node);
    const select = () => onChange({
        ...react_virtualized_tree_1.selectors.updateNode(node, { expanded: !isExpanded }),
    });
    return (React.createElement(React.Fragment, null,
        React.createElement("span", { onClick: select }, hasChildren ? (React.createElement(React.Fragment, null,
            React.createElement("button", { onClick: select }, "--"),
            node.name)) : (React.createElement(React.Fragment, null, node.name)))));
};
const $TreeContainer = styled_1.default.div `
  height: 100%;
  width: 100%;
  && {
    i {
      border: 0;
      outline: 0;
    }
  }
`;
