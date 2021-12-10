import React from 'react';
import { Render, RenderObject } from '@hset/hyper-core';
import { reduceProps, getEventName } from '../utils/props';
import * as _ from 'lodash';

const EXCLUDE_PROPS_KEY = ['engine', 'children', 'ref', 'key', 'style'];
export interface IUpdateResult {
    add: string[];
    remove: string[];
    change: string[];
}

export const compareDiff = (oldProps: {[key: string]: any}, newProps: {[key: string]: any}) => {
    if (oldProps === newProps) return { add: [], remove: [], change: [] };
    const change = [];
    
    const oldKeys = Object.keys(oldProps).filter((el: string) => !EXCLUDE_PROPS_KEY.includes(el));
    const newKeys = Object.keys(newProps).filter((el: string) => !EXCLUDE_PROPS_KEY.includes(el));
    const intersection = _.intersection(oldKeys, newKeys);
    const add = newKeys.filter(el => !intersection.includes(el));
    const remove = oldKeys.filter(el => !intersection.includes(el));
    for(const key of intersection) {
        if (oldProps[key] !== newProps[key]) {
            change.push(key);
        }
    }

    return {
        add, remove, change
    }
}

export const executeRender = (engine: Render, type: string, props: any) => {
    const { append, render, destroy, group, ...others } = props;
    const { eventProps, otherProps } = reduceProps(others);
    const hasCallback = otherProps.callback || otherProps.async;
    let renderInstance;
    if (!hasCallback) {
        const item = engine.render(type, otherProps) as any;
        for (const key in eventProps) {
            const eventBind = eventProps[key];
            const eventName = key.slice(2).toLowerCase();
            item.on(eventName, eventBind.bind(item, item));
        }
        renderInstance = item;
    } else {
        const { callback } = (otherProps as {[key: string]: any});
        (otherProps as {[key: string]: any}).callback = function(obj: any) {
            for (const key in eventProps) {
                const eventBind = eventProps[key];
                const eventName = key.slice(2).toLowerCase();
                obj.on(eventName, eventBind.bind(obj, obj));
            }
            if (group) {
                try {
                    const groupObject: any = engine.getObject(group.id);
                    obj.selectable = false;
                    obj.evented = false;
                    groupObject.addWithUpdate(obj);
                } catch (e) {
                    e instanceof Error && console.warn(e.message)
                }
            }
            callback && callback(obj);
        }
        const item = engine.render(type, otherProps);            

        renderInstance = { ...otherProps, ...item };
    }

    return renderInstance;
}

export const applyNodeProps = (engine: Render, type: string, props: any) => {
    const { zIndex = 1, async = false, children = [] } = props;
    props.zIndex = zIndex;
    const append = function (this: any, child: any) {
        const { type: childType } = child;
        const object = executeRender(engine, childType, child);

        return object;
    }
    const render = function () {
        if (type === RenderObject.Group && !async) {
            const childObjects = [];
            for (const childProps of children) {
                const { id } = childProps;
                try {
                    const child: any = engine.getObject(id);
                    child.selectable = false;
                    child.evented = false;
                    childObjects.push(child)

                } catch (e) {
                    e instanceof Error && console.warn(e.message)
                }
            }
            props.objects = childObjects;
        }
        const object = executeRender(engine, type, props);
        
        return object;
    }
    const destroy = function () {
        const { id } = props;
        const removeObject = (object: any, props: {[key: string]: any}) => {
            const { eventProps } = reduceProps(props);
            for (const key in eventProps) {
                const eventListener = eventProps[key];
                const eventName = getEventName(key);

                object.off(eventName, eventListener);
            }

            engine.remove(object);
        }
        if (type === RenderObject.Group) {
            for (const childProps of children) {
                const { id } = childProps;
                try {
                    const child: any = engine.getObject(id);

                    removeObject(child, childProps);
                } catch (e) {
                    e instanceof Error && console.warn(e.message)
                }
            }
        }
        try {
            const child: any = engine.getObject(id);
            removeObject(child, props);
        } catch (e) {
            e instanceof Error && console.warn(e.message)
        }
    }
    return {
        ...props,
        type,
        render,
        append,
        destroy,
    }
}