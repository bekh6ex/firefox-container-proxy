import {Store} from '../store/Store.js'
import BackgroundMain from './BackgroundMain'

console.log('Background script started')

const browser = (window as any).browser
const store = new Store()

const backgroundListener = new BackgroundMain({ store })
backgroundListener.run(browser)
