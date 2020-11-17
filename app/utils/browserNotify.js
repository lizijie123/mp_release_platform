export function browserNotify ({ title = '小程序发布平台温馨提示', content }) {
  const notify = () => new Notification(title, { body: content, icon: '/logo-circular.png' })
  return new Promise(resolve => {
    if (!Reflect.has(window, 'Notification')) {
      resolve({
        msg: 'error',
      })
    } else if (Notification.permission === 'granted') {
      notify()
      resolve({
        msg: 'success',
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(result => {
        if (result === 'granted') {
          notify()
          resolve({
            msg: 'success',
          })
        }
      })
    }
  })
}

export default browserNotify
