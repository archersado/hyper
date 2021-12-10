import { fabric } from 'fabric';
import * as _ from 'lodash';
import Render, { IConfig, ParticalOptions, RenderObject, ILineOptions, IPolygonOptions,
     IImageOptions, IRectOptions, IGroupOptions, ITextOptions, IPositionOptions } from '../../base/render';
import { getEnumKeys } from '../../utils';
import { NOOP } from '../../utils/event';

type KeysEnum<T> = { [P in keyof Required<T>]: true };
const IPositionOptionsKey: KeysEnum<IPositionOptions> = {
    left: true,
    top: true,
    width: true,
    height: true,
}

export default class FabricRender extends Render {
    public canvas: any;
    public container: HTMLElement;
    public elements: any[];
    public originWidth: number;
    public originHeight: number;
    public config: ParticalOptions<IConfig>;
    constructor(config: ParticalOptions<IConfig>) {
        super(config);
        const { container } = config;
        let containerDom;
        if (_.isString(container)) {
            containerDom = document.getElementById(container as string);
            if (!containerDom) throw new Error(`容器 dom 不存在!`);
            this.container = containerDom;
        } else {
            containerDom = container;
            this.container = container as HTMLElement;
        }

        this.canvas = new fabric.Canvas(this.container, config);
        this.originHeight = this.canvas.getHeight();
        this.originWidth = this.canvas.getWidth();
        return this;
    };
    // 渲染某个元素
    render(type: RenderObject, props: {[key: string]: any}) {
        let object;
        const { id } = props;
        switch (type) {
            case RenderObject.Line: {
                const { start = [], end = [], x2, y2, ...others } = props as Partial<ParticalOptions<ILineOptions>>;
                object = new fabric.Line([ ...start, ...end ], others);
                    break;
            }
            case RenderObject.Text: {
                const { text } = props as Partial<ParticalOptions<ITextOptions>>;
                object = new fabric.Textbox(text, props);
                break;
            }
            case RenderObject.Polygon: {
                const { points, ...others } = props as Partial<ParticalOptions<IPolygonOptions>>;
                if (!points) return;
                const parsedPoints = typeof points === 'string' ? JSON.parse(points) : points;
                object = new fabric.Polyline(parsedPoints, others);
                break;
            }
            case RenderObject.Rect: {
                const { left, top, width, height } = props as Partial<ParticalOptions<IRectOptions>>;
                if (_.isUndefined(left) || _.isUndefined(top) || _.isUndefined(width) || _.isUndefined(height)) throw new Error(`缺少绘制必要信息!`)
                object = new fabric.Rect(props);
                break;
            }
            case RenderObject.Image: {
                const { src, width, height, callback = NOOP, left = 0, top = 0, baseLeft = 0, baseTop = 0, ...others } = props as ParticalOptions<IImageOptions>;
                    const fromCDN = src.includes('http');
                    if (fromCDN) {
                      fabric.Image.fromURL(src, object => {
                            object.scaleToWidth(width, true);
                            object.scaleY = height / object.height;
                            object.type = type;
                            object.id = id;
                            for (const key in props) {
                                if (getEnumKeys(IPositionOptionsKey).includes(key)) continue;
                                object[key] = props[key];
                            }
                            callback(object);
                            this.canvas.add(object);
                      }, {
                        left: baseLeft + left,
                        top: baseTop + top,
                        ...others,
                        crossOrigin: 'Anonymous',
                      });
                    } else {
                      const image = new Image();
              
                      image.src = src;
                      image.onload = () => {
                            object = new fabric.Image(image, others);
                            object.scaleToWidth(width, true);
                            object.scaleY = height / object.height;
                            object.type = type;
                            object.id = id;
                            object.left = baseLeft + left;
                            object.top = baseTop + top;
                            for (const key in props) {
                                if (getEnumKeys(IPositionOptionsKey).includes(key)) continue;
                                object.set(key, props[key])
                            }
                            callback(object);
                            this.canvas.add(object);
                            
                      };
                      image.setAttribute('crossOrigin', 'Anonymous');
                    }
                    break;
            }
            case RenderObject.Group: {
                const { objects, ...others } = props as Partial<ParticalOptions<IGroupOptions>>;
                this.canvas.discardActiveObject();
                object = new fabric.Group(objects, { canvas: this.canvas, ...others });
                break;        
            }
            default: {
                if (!fabric[type]) {
                    console.log('not support yet');
                    return;
                }
                object = new fabric[type](props);
            }

        }
        if (object) {
            this.canvas.add(object);
        } else {
            object = {};
        }
        object.type = type;
        object.id = id;
        return object;
    };
    destroy() {
        this.clear();
        this.canvas.dispose();
    };
    // 清空画布
    clear() {
        this.canvas.clear();
        this.canvas.requestRenderAll();
    };
    // 选中某个对象
    select(obj: any) {
        this.canvas.setActiveObject(obj);
        this.canvas.requestRenderAll();
    };
    // 反选某个对象
    unselect(obj: any) {
        if (obj) {
            this.canvas.discardActiveObject(obj);
        }
    };
    // 删除某个对象
    remove(object) {
        this.canvas.remove(object);
        this.canvas.discardActiveObject().requestRenderAll();
    };
    // 设置画布缩放
    setZoom(zoom: number) {
        if (typeof zoom !== 'number' || zoom < 0) {
            return;
        }
      
        this.canvas.setZoom(zoom);
        this.canvas.setHeight(this.originHeight * zoom);
        this.canvas.setWidth(this.originWidth * zoom);
        this.canvas.requestRenderAll();
    };
    // 重置画布缩放    
    resetZoom() {
        this.canvas.setHeight(this.originHeight);
        this.canvas.setWidth(this.originWidth);
        this.setZoom(1);
    };
    // 获取画板缩放比例
    getZoom(): number {
        return this.canvas.getZoom();
    };

    getObject(id: number): object {
        const objects = this.canvas.getObjects();
        const match = objects.find(el => el.id === id);
        
        if (!match) throw new Error(`未找到 id 为${id}的渲染对象!`);
        return match;
    };
    // 发起重绘
    reflow() {
        this.canvas.requestRenderAll();
    }
    registerRenderHook() {
        const canvas = this.canvas;
        this.canvas.on('before:render', function () {
            const objects = canvas.getObjects();

            objects.sort((p, n) => p.zIndex - n.zIndex).forEach(el => {
                canvas.bringToFront(el);
            });
            canvas.requestRenderAll();
        });
    }
    mutate(object, key, value) {
        const { type } = object;

        if (type === RenderObject.Image) {
            if (key === 'width') {
                object.scaleToWidth(value, true);
            }
            if (key === 'height') {
                object.scaleToHeight(value, true);
            }
        }

        return object;
    }
}