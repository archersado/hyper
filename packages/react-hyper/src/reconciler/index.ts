/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import getRender from '../render/hyper';
import { RenderObject } from '@hset/hyper-core';
import { getChildrenFromFiber, isEventProps, reduceParentPosition, belongToGroup, getEventName } from '../utils/props';
import { applyNodeProps, compareDiff } from './update';

let engine: any;
const hostConfig = {
    now: Date.now,
    supportsMutation: true,
    supportsPersistence: false,
    getPublicInstance: () => {}, 
    preparePortalMount: () => {

    }, 
    scheduleTimeout: () => {

    },
    cancelTimeout: () => {}, 
    noTimeout: () => {}, 
    isPrimaryRenderer: false, 
    supportsHydration: false,
    getRootHostContext(rootContainerInstance: any) {
        if (!engine) {            
            const { engineType, config } = rootContainerInstance.dataset;
            const parsedConfig = JSON.parse(config);
            engine = getRender(engineType, parsedConfig);
            engine.registerRenderHook();
            (window as any).engine = engine;
        }
        return {
            engine
        };
    },
    getChildHostContext(parentContext: any, fiberType: string) {
        return {
            ...parentContext,
            type: fiberType
        };
    },
    prepareForCommit: () => null,
    resetAfterCommit: () => {},
    shouldSetTextContent(_type: string, props: any) {
        return (
          typeof props.children === 'string' || typeof props.children === 'number'
        );
    },
    createInstance: (type: string, props: any, _rootContainerInstance: any, currentHostContext: any, workInProgress: any) => {
        const { engine } = currentHostContext;
        const { child, return: parent, _debugID: id } = workInProgress;
        const children = getChildrenFromFiber(child, id);
        const [baseLeft, baseTop] = reduceParentPosition(parent, 0, 0);
        const group = type !== RenderObject.Group && belongToGroup(parent);
        const instance = {
            ...props,
            children,
            baseLeft,
            baseTop,
            group,
            parent: parent.elementType ? parent.pendingProps : null,
            id: `${type}_${id}`
        }
        const item = applyNodeProps(engine, type, instance);

        return item;
    },
    insertBefore: (parent: any, child: any) => {
        const append = child.render.bind(parent, child);
        return append(child);
    },
    appendChild: (parent: any, child: any) => {
        const append = child.render.bind(parent, child);
        return append(child);
    },
    appendInitialChild: function(parent: any, child: any) {
        const append = child.render.bind(parent, child);
        return append(child);
    },
    appendChildToContainer: (_parent: any, child: any) => {
        return child.render();
    },
    finalizeInitialChildren: () => false,
    createTextInstance: function(newText: string) {
        return newText;
    },
    clearContainer: () => {},
    commitMount: () => {},
    prepareUpdate: (_instance: any, _type: string, oldProps: any, newProps: any, rootContainerInstance: any, currentHostContext: any) => {
        const { engine } = currentHostContext;
        const { add, remove, change } = compareDiff(oldProps, newProps);
        const shouldUpdate = (add.length + remove.length + change.length) > 0;

        if (shouldUpdate) {
            const updateQueue: {[key: string]: any} = {};
            for (const key of add) {
                updateQueue[key] = newProps[key];
            }
            for (const key of change) {
                updateQueue[key] = newProps[key];
            }
            return { updateQueue, removeQueue: remove, engine };
        }

        return null;
    },
    commitUpdate: (instance: any, updatePayload: any, type: string, oldProps: any, newProps: any, finishedWork: boolean) => {
        try {
            const { engine, updateQueue, removeQueue = [] } = updatePayload;
            const { id } = instance;
            const object = engine.getObject(id);   
    
            if (object) {
                for (const key in updateQueue) {
                    if (isEventProps(key)) {
                        const eventBind = updateQueue[key];
                        const eventName = getEventName(key);

                        object.off(eventName);
                        object.on(eventName, (options: any) => eventBind.call(this, options, object));
                    }
                    engine.mutate(object, key, updateQueue[key]);
                }     
                for (const key in removeQueue) {
                    if (isEventProps(key)) {
                        const eventName = getEventName(key);
                        object.off(eventName);
                    }
                }
            }
            return;
        } catch (e: any) {
            console.warn(`commitUpdate, ${e.message}`);
        }

    },
    shouldDeprioritizeSubtree: (_type: string, nextProps:any) => {
        return !!nextProps.hidden
    },
    removeChildFromContainer: (_container: any, child: any) => {
        child.destroy(child);
    },
    removeChild: (_container: any, child: any) => {
        child.destroy(child);
    }
}
export default hostConfig;