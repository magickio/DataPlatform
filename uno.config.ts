import { presetUni } from '@uni-helper/unocss-preset-uni'
import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUni(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      // HBuilderX 必须针对要使用的 Collections 做异步导入
      collections: {
        'carbon': () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        'fa': () => import('@iconify-json/fa/icons.json').then(i => i.default),
        'fa-solid': () => import('@iconify-json/fa-solid/icons.json').then(i => i.default),
        'fa-brands': () => import('@iconify-json/fa-brands/icons.json').then(i => i.default),
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
