class Strategies {
  // 非空验证
  empty (value, errorMsg) {
    if (value === '') {
      return errorMsg || '填写数据不能为空'
    }
    return false
  }

  // 限制最小长度
  minLength (value, length, errorMsg) {
    if (!value || value.length < length) {
      return errorMsg || `填写数据长度不能小于${length}位`
    }
    return false
  }

  // 手机号码验证
  mobile (value, errorMsg) {
    if (!/^((\(\d{2,3}\))|(\d{3}\-))?1[^012][\d*]{9}$/.test(value)) {
      return errorMsg || '请正确填写手机号码'
    }
    return false
  }

  // 验证码验证
  zcode (value, errorMsg) {
    if (!/\d{6}/.test(value)) {
      return errorMsg || '请正确填写验证码'
    }
    return false
  }

  // 身份证验证
  idCard (value, errorMsg) {
    if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)) {
      return errorMsg || '身份证号码不正确'
    }
    return false
  }

  // 邮箱验证
  email (value, errorMsg) {
    if (!/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)/.test(value)) {
      return errorMsg || '邮箱格式不正确'
    }
    return false
  }

  // uuid验证
  uuid (value, errorMsg) {
    const rgx1 = /^[\da-f]{32}$/i
    const rgx2 = /^(urn:uuid:)?[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i
    if (!(value.match(rgx1) || value.match(rgx2))) {
      return errorMsg || 'id格式不正确'
    }
    return false
  }

  // 银行卡号验证
  bankCard (value, errorMsg) {
    if (!/^([1-9]{1})(\d{15}|\d{18})$/.test(value)) {
      return errorMsg || '银行卡格式不正确'
    }
    return false
  }
}

export default new Strategies()
