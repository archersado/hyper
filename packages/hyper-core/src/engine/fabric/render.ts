import { fabric } from 'fabric';
import * as _ from 'lodash';
import * as LRU from 'lru-cache';
import Render, { IConfig, ParticalOptions, RenderObject, ILineOptions, IPolygonOptions,
     IImageOptions, IRectOptions, IGroupOptions, ITextOptions, IPositionOptions, AlignType, GroupAlignDirection } from '../../base/render';
import { getEnumKeys } from '../../utils';
import { NOOP } from '../../utils/event';

const lruOption = {
    max: 1000,
}

type KeysEnum<T> = { [P in keyof Required<T>]: true };
const IPositionOptionsKey: KeysEnum<IPositionOptions> = {
    left: true,
    top: true,
    width: true,
    height: true,
}

export interface IAlignOptions {
    x: AlignType;
    y: AlignType;
}

export default class FabricRender extends Render {
    public canvas: any;
    public container: HTMLElement;
    public resourceCache: LRU;
    public elements: any[];
    public originWidth: number;
    public originHeight: number;
    public config: ParticalOptions<IConfig>;
    constructor(config: ParticalOptions<IConfig>) {
        super(config);
        const { container } = config;
        let containerDom;
        this.resourceCache = new LRU(lruOption);
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
                const { left = 0, top = 0, width, height } = props as Partial<ParticalOptions<IRectOptions>>;
                if (_.isUndefined(left) || _.isUndefined(top) || _.isUndefined(width) || _.isUndefined(height)) throw new Error(`缺少绘制必要信息!`)
                object = new fabric.Rect(props);
                break;
            }
            case RenderObject.Image: {
                const { src, width, height, callback = NOOP, left = 0, top = 0, baseLeft = 0, baseTop = 0, ...others } = props as ParticalOptions<IImageOptions>;
                    const cached = this.resourceCache.get(src);
                    if (cached) {
                        const self = this;
                        cached.clone(function(object) {
                            object.scaleY = height / object.height;
                            object.type = type;
                            object.id = id;
                            object.left = left;
                            object.top = top;
                            for (const key in props) {
                                if (getEnumKeys(IPositionOptionsKey).includes(key)) continue;
                                object[key] = props[key];
                            }
                            self.canvas.add(object);
                            callback(object);
                        });

                    } else {
                        if (_.isString(src)) {
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
                                this.resourceCache.set(src, object);
                                this.canvas.add(object);
                          }, {
                            left: left,
                            top: top,
                            ...others,
                            crossOrigin: 'Anonymous',
                          });
                        } else {
                            (src as any).setAttribute('crossOrigin', 'Anonymous');
                            object = new fabric.Image(src, others);
                            object.width = width;
                            object.height = height;
                            object.scaleToWidth(width, true);
                            object.scaleY = height / object.height;
                            object.type = type;
                            object.id = id;
                            object.left = left;
                            object.top = top;
                            for (const key in props) {
                                if (getEnumKeys(IPositionOptionsKey).includes(key)) continue;
                                object.set(key, props[key])
                            }
                            callback(object);
                            this.canvas.add(object);
                        }
                    }

                    break;
            }
            case RenderObject.Group: {
                const { objects, ...others } = props as Partial<ParticalOptions<IGroupOptions>>;
                const self = this;
                this.canvas.discardActiveObject();
                object = new fabric.Group(objects, { canvas: this.canvas, ...others });
                object.removeAll = function () {
                    object.getObjects().forEach(el => {
                        this.remove(el);
                        self.remove(el);
                    });
                }
                object.alignInGroup = function () {
                    const { width, height, direction = GroupAlignDirection.VERTICAL } = this;
                    if (direction === GroupAlignDirection.ABSOLUTE) return;
                    const objects = this.getObjects().sort((p, n) => {
                        const getId = id => id.split('_')[1];
                        const { id: pid } = p;
                        const { id: nid } = n;

                        return getId(pid) - getId(nid);
                    });

                    let baseX = -width / 2;
                    let baseY = -height / 2;
                    for(const item of objects) {
                        const { alignX, alignY, width, height } = item;
                        if (alignX && alignX) {
                            // 脱离文档流
                            switch (alignX) {
                                case AlignType.CENTER:
                                    item.left = 0;
                                    item.originX = "center";
                                    item.originY = "center";
                                    break;
                                case AlignType.START:
                                    item.left = - width/2;
                                    break;
                                case AlignType.END:
                                    item.left = width/2;
                                    item.originX = "right";
                                    break;
                                default:
                                    break;
                            }
                            switch (alignY) {
                                case AlignType.CENTER:
                                    item.top = 0;
                                    item.originX = "center";
                                    item.originY = "center";
                                    break;
                                case AlignType.START:
                                    item.top = - height/2;
                                    break;
                                case AlignType.END:
                                    item.top = height/2;
                                    item.originY = "bottom";
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            item.left = baseX;
                            item.top = baseY;
                            if (direction === GroupAlignDirection.HORIZONTAL) {
                                baseX += width;
                            } else {
                                baseY += height;
                            }
                        }
                    }
                }
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
    getAllObjects() {
        return this.canvas.getObjects();
    }
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
        object[key] = value;
        // this.reflow();
        return object;
    }

    unselectAll() {
        this.canvas.discardActiveObject();
    }

    on(event: string, handler: Function) {
        this.canvas.on(event, handler);
    }

    off(event: string) {
        this.canvas.off(event);
    }
}