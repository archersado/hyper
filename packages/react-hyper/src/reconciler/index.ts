/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import getRender from '../render/hyper';
import { getChildrenFromFiber, isEventProps, reduceParentPosition, belongToGroup, getEventName } from '../utils/props';
import { applyNodeProps, compareDiff } from './update';


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
        const { engineType, config } = rootContainerInstance.dataset;
        const parsedConfig = JSON.parse(config);
        const engine = getRender(engineType, parsedConfig);
        engine.registerRenderHook();
        (window as any).engine = engine;
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
        const group = belongToGroup(parent);
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
    appendInitialChild: function(parent: any, child: any) {
        const append = parent.append.bind(parent, child);
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
        const { engine, updateQueue, removeQueue = [] } = updatePayload;
        const { id } = instance;
        const object = engine.getObject(id);   

        if (object) {
            for (const key in updateQueue) {
                if (isEventProps(key)) {
                    const eventBind = updateQueue[key];
                    const eventName = getEventName(key);
                    object.on(eventName, eventBind.bind(object, object));
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
    },
    shouldDeprioritizeSubtree: (_type: string, nextProps:any) => {
        return !!nextProps.hidden
    },
    removeChildFromContainer: (_container: any, child: any) => {
        child.destroy();
    },
    removeChild: (_container: any, child: any) => {
        child.destroy();
    }
}
export default hostConfig;