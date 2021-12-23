import React, { useLayoutEffect, useRef, forwardRef } from 'react';
import hostConfig from '../reconciler';
import generateUUID from '../utils/uuid';
import { RenderObject } from '@hset/hyper-core';
import hyperManager from '@hset/hyper-core';
import ReactFiberReconciler from 'react-reconciler';

export const Component = Object.keys(RenderObject).reduce((ret: any, type: string) => {
    return {
        ...ret,
        [type]: function (props: any) {
            const id = useRef(generateUUID(type));
            return React.createElement(type, {
                ...props,
                id: id.current
            })
        }
    }
}, {});

const ReactRconcilerHyper = ReactFiberReconciler(hostConfig);
const BoardWarp = (props: any) => {
    const { engineType, config, width, height } = props;
    const { container: containerId } = config;
    const container = useRef<HTMLElement | null>(); 
    const fiberRef = useRef<HTMLElement | null>();
    const canvas = useRef<HTMLElement | null>();
    const setRef = function (engine: any) {
        const { forwardRef } = props;

        if (!forwardRef) return;
        if (typeof forwardRef === 'function') {
            forwardRef(engine);
        } else {
            forwardRef.current = engine;
        }
    };

    useLayoutEffect(() => {
        canvas.current = document.getElementById('rpe');
        (canvas.current as HTMLElement).dataset.engineType = engineType;
        (canvas.current as HTMLElement).dataset.config = JSON.stringify(config);
        
        fiberRef.current = ReactRconcilerHyper.createContainer(canvas.current, 0, false, null);

        ReactRconcilerHyper.updateContainer(props.children, fiberRef.current);
        
        return () => {
            ReactRconcilerHyper.updateContainer(null, fiberRef.current, null); 
        }
    }, []);
    React.useLayoutEffect(() => {
        setRef(hyperManager.engine);
        ReactRconcilerHyper.updateContainer(props.children, fiberRef.current, null);
    });

    return (<div id="react-hyper-container" {...props} ref={container}>
        <canvas id={containerId} width={width} height={height}/>
    </div>);
}

// ReactRconcilerHyper.injectIntoDevTools({
//     findFiberByHostInstance: () => null,
//     bundleType: 1,
//     version: React.version,
//     rendererPackageName: 'react-hyper',
// });
  

export default forwardRef((props, ref) => <BoardWarp {...props} forwardRef={ref} />)
