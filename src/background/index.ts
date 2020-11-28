import { Store } from '../store/Store'
import BackgroundMain from './BackgroundMain'

console.log('Background script started')

// const browser = browser
const store = new Store()

const backgroundListener = new BackgroundMain({ store })
backgroundListener.run(browser)
