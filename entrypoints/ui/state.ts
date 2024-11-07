import { useStorage, computedAsync } from '@vueuse/core'
import { ui } from './figma'
import { evaluate, getTemPadComponent } from './utils'

import type { QuirksNode, GhostNode } from './quirks'
import type { Plugin } from '../../plugins/src/index'

type Options = {
  minimized: boolean
  panelPosition: {
    left: number
    top: number
  }
  prefOpen: boolean
  deepSelectOn: boolean
  measureOn: boolean
  cssUnit: 'px' | 'rem'
  rootFontSize: number
  plugins: {
    [key: string]: {
      name: string
      code: string
      source: string
    }
  }
  activePluginSource: string | null
}

type SelectionNode = SceneNode | QuirksNode | GhostNode

export const options = useStorage<Options>('tempad-dev', {
  minimized: false,
  panelPosition: {
    left: window.innerWidth - ui.nativePanelWidth - ui.tempadPanelWidth,
    top: ui.topBoundary
  },
  prefOpen: false,
  deepSelectOn: false,
  measureOn: false,
  cssUnit: 'px',
  rootFontSize: 16,
  plugins: {},
  activePluginSource: null
})

export const isQuirksMode = shallowRef<boolean>(false)
export const selection = shallowRef<readonly SelectionNode[]>([])
export const selectedNode = computed(() => selection.value?.[0] ?? null)
export const selectedTemPadComponent = computed(() => getTemPadComponent(selectedNode.value))

export const activePlugin = computedAsync(async () => {
  if (!options.value.activePluginSource) {
    return null
  }

  const pluginData = options.value.plugins[options.value.activePluginSource]

  if (!pluginData) {
    return null
  }

  try {
    const plugin = (await evaluate(pluginData.code)).plugin as Plugin
    if (plugin) {
      return plugin
    }
  } catch (e) {
    return null
  }
}, null)
