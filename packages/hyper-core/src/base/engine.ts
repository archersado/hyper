import Render, { ParticalOptions, IConfig } from './render';

export type Factory<T> = { new(...any): T };

export default class EngineContainer {
    container: Map<string, any>;
    engine: Render;

    constructor() {
        this.container = new Map<string, any>();

        return this;
    }
    register<T>(type: string, cls: Factory<T>): Factory<T> {
        if (this.container.has(type)) {
            throw new Error(`Hyper Core:${type}已被注册!不能重复注册!`);
        }

        this.container.set(type, cls);

        return cls;
    }


    get(type: string) {
        if (!this.container.has(type)) {
            throw new Error(`Hyper Core: ${type} 不存在!`);
        }
        return this.container.get(type);
    }

    getSupportEngine() {
        return Array.from(this.container.keys());
    }

    use(type: string, config: ParticalOptions<IConfig>): Render {
        const kls = this.get(type);
        this.engine = new kls(config);
        return this.engine;
    }
}