const NextjsResolverPlugin = require('./lib/NextjsResolverPlugin');
const path = require('path');

// GraphCommerce için varsayılan override paketleri
const defaultPackages = [
    '@graphcommerce/next-ui',
    '@graphcommerce/magento-cart',
    '@graphcommerce/magento-product'
];

const packagesToOverride = process.env.FOOMAN_OVERRIDEPACKAGES
    ? process.env.FOOMAN_OVERRIDEPACKAGES.split(',')
    : defaultPackages;

let resolverPlugins = [];

packagesToOverride.forEach(function (package) {
    const pluginName = `fooman/${package}-override-resolver`;
    // Override dosyalarının konumu
    const destinationDir = path.resolve(process.cwd(), 'src/overrides', package.replace('@graphcommerce/', ''));
    // Orijinal modül konumu
    const sourceDir = path.resolve(process.cwd(), 'node_modules', package);

    const resolverPlugin = new NextjsResolverPlugin({
        name: pluginName,
        projectPath: destinationDir,
        nextjsModulePath: sourceDir
    });
    resolverPlugins.push(resolverPlugin);
});

// Next.js webpack konfigürasyonu için export
module.exports = (nextConfig = {}) => {
    return {
        ...nextConfig,
        webpack: (config, options) => {
            // Mevcut webpack konfigürasyonuna resolver pluginleri ekliyoruz
            config.resolve.plugins = [
                ...(config.resolve.plugins || []),
                ...resolverPlugins
            ];

            // Kullanıcının kendi webpack konfigürasyonu varsa çalıştırıyoruz
            if (typeof nextConfig.webpack === 'function') {
                return nextConfig.webpack(config, options);
            }

            return config;
        }
    };
};
