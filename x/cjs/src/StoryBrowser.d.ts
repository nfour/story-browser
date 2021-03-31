import * as React from 'react';
export declare const useStoryBrowser: ({ modules: modulesInput, useIframe, }: {
    /** Story modules eg. [import('./myStory.stories.tsx'), someModule, ...] */
    modules: (StoryModule | Promise<StoryModule>)[];
    useIframe?: boolean | undefined;
}) => {
    stories: StoryComponentMap;
    modules: StoryModule[];
};
interface ModuleInputs {
    modules: StoryModule[];
}
interface StoriesInputs {
    stories: StoryComponentMap;
}
declare type ExclusiveInputs = ModuleInputs | StoriesInputs;
export declare const StoryBrowser: FC<{
    activeStoryId?: string;
    /** Use this to return a `src` url for an <iframe src={src} /> */
    onIframeSrc?(story: StoryComponent): string;
    onActiveStoryIdChanged?(id: undefined | string): void;
    layout?: {
        /**
         * Adds css to make the component take all available space.
         * @default true
         */
        asFullscreenOverlay?: boolean;
    };
    className?: string;
    context?: {};
} & ExclusiveInputs>;
export declare const RenderStory: FC<{
    story: StoryComponent;
    context?: {};
}>;
export declare const $StoryListItem: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme | undefined;
    as?: React.ElementType<any> | undefined;
}, React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const $StoryRenderWrapper: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme | undefined;
    as?: React.ElementType<any> | undefined;
}, React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, {}>;
export declare const $StoryIFrame: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme | undefined;
    as?: React.ElementType<any> | undefined;
}, React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>, {}>;
export declare const $StoryList: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme | undefined;
    as?: React.ElementType<any> | undefined;
}, React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, {}>;
export declare const $StoryBrowserInner: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme | undefined;
    as?: React.ElementType<any> | undefined;
}, React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const $StoryBrowser: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme | undefined;
    as?: React.ElementType<any> | undefined;
} & {
    asFullscreenOverlay: boolean;
}, React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, {}>;
export interface StoryModule {
    default: {
        title?: string;
        component?: StoryFn;
        useIframe?: boolean;
    };
    [k: string]: StoryFn | unknown;
}
export declare type StoryFn = {
    (context: any): JSX.Element;
    useIframe?: boolean;
};
export interface StoryComponent {
    storyId: string;
    kinds: string[];
    name: string;
    Story: StoryFn;
    useIframe: boolean;
}
export declare type StoryComponentMap = Map<StoryComponent['storyId'], StoryComponent>;
/** Function JSX component */
export declare type FC<P extends {} = {}> = (p: P) => JSX.Element;
/** Function JSX component, with children */
export declare type FCC<P = {}> = (p: P & {
    children: React.ReactNode;
}) => JSX.Element;
export {};
