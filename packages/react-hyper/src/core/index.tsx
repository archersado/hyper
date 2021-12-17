import React, { useLayoutEffect, useRef, forwardRef } from 'react';
import hostConfig from '../reconciler';
import { RenderObject } from '@hset/hyper-core';
import ReactFiberReconciler from 'react-reconciler';

export const Component = RenderObject;

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

        setRef(fiberRef);
        ReactRconcilerHyper.updateContainer(props.children, fiberRef.current);
        
        return () => {
            ReactRconcilerHyper.updateContainer(null, fiberRef.current, null); 
        }
    }, []);
    React.useLayoutEffect(() => {
        ReactRconcilerHyper.updateContainer(props.children, fiberRef.current, null);
    });

    return (<div id="react-hyper-container" {...props} ref={container}>
        <canvas id={containerId} width={width} height={height}/>
        {props.children}
    </div>);
}



export default forwardRef((props, ref) => <BoardWarp {...props} forwardRef={ref} />)
