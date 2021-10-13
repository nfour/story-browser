/// <reference types="react" />
import { Node, NodeAction } from 'react-virtualized-tree';
export declare const FilterableTree: ({ nodes, onNodes, onSelect, className, }: {
    className?: string | undefined;
    nodes: Node[];
    onNodes(nodes: Node[]): void;
    onSelect(action: NodeAction): void;
}) => JSX.Element;
