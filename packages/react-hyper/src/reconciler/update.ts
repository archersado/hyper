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
            item.on(eventName, (options: any) => eventBind.call(this, options, item));
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
                    groupObject.add(obj);
                    groupObject.alignInGroup(obj);
                } catch (e) {
                    e instanceof Error && console.warn(e.message)
                    engine.remove(obj);
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
    const { children = [] } = props;
    const render = function () {
        const object = executeRender(engine, type, props);
        if (type === RenderObject.Group) {
            for (const childProps of children) {
                const { id } = childProps;
                try {
                    const child: any = engine.getObject(id);
                    child.selectable = false;
                    child.evented = false;

                    object.add(child);
                    object.alignInGroup(child);
                } catch (e) {
                    e instanceof Error && console.warn(e.message)
                }
            }
        }

        return object;
    }
    const destroy = function (props: any) {
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
        try {
            const child: any = engine.getObject(id);
            if (type === RenderObject.Group) {
                child.removeAll();
            }
            removeObject(child, props);
        } catch (e) {
            e instanceof Error && console.warn(`销毁失败，${e.message}`);
        }
    }
    return {
        ...props,
        type,
        render,
        destroy,
    }
}