const buttonClasses = ['bg-transparent', 'hover:bg-blue-500', 'text-blue-700', 'font-semibold', 'hover:text-white', 'py-2', 'px-4', 'border', 'border-blue-500', 'hover:border-transparent', 'rounded', ]

const style = {
    navItem: [...buttonClasses, 'block','w-full'].join(' '),
    action: [...buttonClasses].join(' '),
    textInput: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
    form:  'bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4',
}

const proxyTypes = ["http", "https", "socks", "socks4"]

const textInputClass = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
