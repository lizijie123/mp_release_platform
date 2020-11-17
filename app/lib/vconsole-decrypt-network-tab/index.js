import VConsole from 'vconsole'
import * as utils from '@utils/index'

export const vConsoleDecryptNetworkTabOption = {
  id: 'decryptNetwork',
  name: 'DecryptNetwork',
}

class VConsoleDecryptNetworkTab extends VConsole.VConsoleNetworkPlugin {
  onAddTool (callback) {
    const toolList = [
      {
        name: '打印至控制台',
        global: false,
        onClick: () => {
          this.detailToConsole()
        },
      },
      {
        name: '清空',
        global: false,
        onClick: () => {
          this.clearLog()
        },
      },
    ]
    callback(toolList)
  }

  detailToConsole () {
    const reqList = Object.values(this.reqList || {}).reduce((previous, value) => {
      const { url } = value
      let { response } = value
      try {
        response = JSON.parse(response)
      } catch (err) {
        // err
      }
      previous.push({
        url,
        response,
      })
      return previous
    }, [])
    console.log(reqList)
  }

  updateRequest (...args) {
    super.updateRequest(...args)
    try {
      for (const req of Object.values(this.reqList)) {
        const { readyState } = req
        let { response: oldResponse } = req
        if (!oldResponse || oldResponse === '[object Object]' || readyState !== 4) continue
        try {
          oldResponse = JSON.parse(oldResponse)
        } catch (err) {
          // err
        }
        if (utils.getType(oldResponse) === 'string') {
          try {
            oldResponse = utils.decrypt(oldResponse)
          } catch (err) {
            __CLIENT__ && console.warn('数据解密失败')
          }
        }
        Object.assign(req, {
          response: utils.getType(oldResponse) === 'string' ? oldResponse : JSON.stringify(oldResponse),
        })
      }
    } catch (err) {
      console.error(err)
    }
  }
}

const vConsoleDecryptNetworkTab = new VConsoleDecryptNetworkTab(vConsoleDecryptNetworkTabOption.id, vConsoleDecryptNetworkTabOption.name)

export default vConsoleDecryptNetworkTab
