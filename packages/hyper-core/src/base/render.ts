export enum RenderObject {
    Rect = 'Rect',
    Line = 'Line',
    Circle = 'Circle',
    Text = 'Text',
    Image = 'Image',
    Polygon = 'Polygon',
    Group = 'Group',
    Point = 'Point',
}
export type ParticalOptions<T> = T & {[key: string]: any};
export enum AlignType {
    START = 'START',
    CENTER = 'CENTER',
    END = 'END',
}
export enum GroupAlignDirection {
    VERTICAL = 'VERTICAL',
    HORIZONTAL = 'HORIZONTAL',
    ABSOLUTE = 'ABSOLUTE',
}
export interface IEventOptions {
    selectable: boolean;
    evented: boolean;
}
export interface IPositionOptions {
    left: number;
    top: number;
    width: number;
    height: number;
}
export interface IConfig {
    container: string | HTMLElement;
}
export interface ITextOptions extends IEventOptions, IPositionOptions {
    text: string;
}

export interface ILineOptions {
    start: number[];
    end: number[];
}
export interface IRectOptions extends IPositionOptions, IEventOptions {
    fill: string;
    strokeWidth: number;
    stroke: string;
}

export interface IPolygonOptions extends IEventOptions {
    points: number[];
}
export interface IGroupOptions extends IPolygonOptions, IEventOptions {
    objects: any[];
}

export interface IImageOptions extends IPositionOptions, IEventOptions {
    src: string;
}

export default abstract class Render {
    public resourceCache: Map<string, any>;
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
    // 向渲染器注册事件
    registerRenderHook() {}
}
