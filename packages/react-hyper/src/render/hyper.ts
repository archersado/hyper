import hyperManager from '@hset/hyper-core';

export default function getRender(type: string, config: any) {
    if (hyperManager.engine) {
        return hyperManager.engine;
    }
    return hyperManager.use(type, config);
}