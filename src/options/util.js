export function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
    const random = Math.random() * 16 | 0
    const v = character === 'x' ? random : (random & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function generateAuthorizationHeader (username, password) {
  return 'Basic ' + btoa(`${username}:${password}`)
}
