import { Store } from '../store/Store.js'
import BackgroundMain from './BackgroundMain.js'

console.log('Background script started')

const store = new Store()

const backgroundListener = new BackgroundMain({ store })
backgroundListener.run(browser)
