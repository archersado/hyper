import { RenderObject } from '@hset/hyper-core';

export interface IProps {
    eventProps: {[key: string]: any};
    otherProps: {[key: string]: any};
}

export const reduceProps = function (props: {[key: string]: any}): IProps {
    return Object.keys(props).reduce((ret, key) => {
        const isEvent = isEventProps(key);
        const { eventProps, otherProps } = ret;
        if (isEvent) {

            return {
                ...ret,
                eventProps: {
                    ...eventProps,
                    [key]: props[key]
                }
            }
        } else {
            return {
                ...ret,
                otherProps: {
                    ...otherProps,
                    [key]: props[key]
                }
            }
        }
    }, {
        eventProps: {},
        otherProps: {}
    })
};
export const getEventName = (props: string): string => props.slice(2).toLowerCase();
export const isEventProps = (key: string) => key.slice(0, 2) === 'on';
export const getChildrenFromFiber = (node: any, startId: string): any[] => {
    if (!node) return [];
    const { _debugID, elementType, stateNode, child, sibling } = node;
    const isGroupType = elementType === RenderObject.Group;
    if (typeof elementType === 'function' || !elementType) return [ ...getChildrenFromFiber(child, startId), ...getChildrenFromFiber(sibling, startId) ];
    if (isGroupType) return getChildrenFromFiber(sibling, startId);
    let children = [];
    const item = {
        id: `${elementType}_${_debugID}`,
        ...stateNode
    };

    if (child) {
        children = getChildrenFromFiber(child, _debugID);
        return [ item, ...children, ...getChildrenFromFiber(sibling, startId) ];
    } else {
        return [ item, ...getChildrenFromFiber(sibling, startId) ];
    }
}
export const reduceParentPosition = (node: any, left: number, top: number): number[] => {
    if (!node) return [0, 0];
    const { pendingProps, return: parentNode, elementType } = node;
    if (!elementType) return [left, top];
    const { left: currentLeft = 0, top: currentTop = 0 } = pendingProps;


    return reduceParentPosition(parentNode, left + currentLeft, top + currentTop);
}

export const belongToGroup = (node: any): number[]|undefined => {
    if (!node) return;
    const { _debugID, pendingProps, return: parentNode, elementType } = node;
    if (elementType === RenderObject.Group) {
        const group = {
            ...pendingProps,
            type: RenderObject.Group,
            id: `${RenderObject.Group}_${_debugID}`
        }
        return group;
    }

    return belongToGroup(parentNode);
}