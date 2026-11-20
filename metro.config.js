const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Os materiais de estudo (vídeo, imagens) não fazem parte do app.
config.resolver.blockList = [/\/estudo\/.*/];
// O watchman instalado via Homebrew está quebrado nesta máquina; o crawler do Node funciona.
config.resolver.useWatchman = false;

// three >= 0.180: o build CommonJS (usado pelo `require('three')` do @react-three/fiber) chama
// `process.emitWarning`, que não existe no React Native. Todo `three` vai para o build ESM — uma
// única instância para o app e para o fiber.
const threeModule = path.join(__dirname, 'node_modules/three/build/three.module.js');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') {
    return { type: 'sourceFile', filePath: threeModule };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
