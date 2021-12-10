

## Install

```sh
npm install
```

## Abstract Render Interface 
Hyper defines a set of abstract render interface for different render engine, such as fabricjs, Pixijs and Threejs.

```typescript
export default abstract class Render {
    public container: HTMLElement;
    public canvas: any;
    public elements: any[];
    public config: ParticalOptions<IConfig>;
    constructor(config: ParticalOptions<IConfig>) {
        this.config = config;
    };

    // 销毁画布
    destroy() {}
    // 渲染某个元素到内存
    render(_type: string, _props: {[key: string]: any}): any {};
    // 清空画布
    clear() {};
    // 选中某个对象
    select(_obj: any) {};
    // 反选某个对象
    unselect(_obj: any) {};
    // 删除某个对象
    remove(_obj: any) {};
    // 设置画布缩放
    setZoom(_zoom: number) {};
    // 重置画布缩放    
    resetZoom() {};
    // 获取画板缩放比例
    getZoom(): number {
        return 1;
    };
    // 触发重绘
    reflow() {};
    // 渲染对象发生属性变更
    mutate(_obj: any, _key: string, _value: any): object {
        return {};
    };
    // 获取渲染对象
    getObject(_id: number): object { return {} };
    // 向渲染器注册 render hook 事件
    registerRenderHook() {}
}

```

## How To Use

### register an render engine 
```typescript
import engineManager from '@hset/hyper-core';
import FabricEngine from './engine/fabric/render';


// 渲染引擎即为实现了渲染器接口的渲染实现类
engineManager.register('fabric', FabricEngine);

```
### use an render engine 

```typescript
import hyperManager from '@hset/hyper-core';

// 向引擎注册配置
const config = {};

return hyperManager.use("fabric", config);

```


## Show your support

Give a ⭐️ if this project helped you!