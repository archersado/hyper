import EngineManager from './base/engine';
import Render from './base/render';
import FabricEngine from './engine/fabric/render';
export * from './base/engine';
export * from './base/render';

const engineManager = new EngineManager();
engineManager.register('fabric', FabricEngine);
export { Render };
export default engineManager;
