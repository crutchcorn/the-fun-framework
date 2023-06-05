import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import HomePage from './HomePage.vue';
import './custom.css'

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-features-after': () => h(HomePage),
    })
  },
}
