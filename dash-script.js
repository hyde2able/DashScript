/* 初期設定 */
var system = require('system'),
    args = system.args,
    page = require('webpage').create()

var email = args[1], password = args[2], itemUrl = args[3]

page.viewportSize = {
  width: 1920,
  height: 1080
}
page.settings = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
  javascriptEnabled: true,
  loadImages: false
}
phantom.cookiesEnabled = true
phantom.javascriptEnabled = true
page.onInitialized = function() {
  page.evaluate(function() {
    document.addEventListener('DOMContentLoaded', function() {
      window.callPhantom('DOMContentLoaded')
    }, false)
  })
}

var funcs = function(funcs) {
  this.funcs = funcs;
  this.init();
}

funcs.prototype = {
  init: function() {
    var self = this
    page.onCallback = function(data) {
      if (data === 'DOMContentLoaded') self.next()
    }
  },
  next: function() {
    var func = this.funcs.shift()
    if (func !== undefined) {
      func()
    } else {
      page.onCallback = function(){}
    }
  }
}

// 順次実行する
new funcs([
  function() {
    console.log('Open Top Page')
    page.open('https://amazon.co.jp', function(status) {})
  },
  function() {
    console.log('Click Signin Button')
    setTimeout(function() {
      page.evaluate(function() {
        document.getElementById('nav-link-yourAccount').click()
      })
    }, 2000)
  },
  function() {
    console.log('sign in')
    setTimeout(function() {
      page.render('images/signin.png')
      page.evaluate(function(email, password) {
        document.getElementById('ap_email').value = email
        document.getElementById('ap_password').value = password
        document.getElementById('signInSubmit').click()
      }, email, password)
    }, 2000)
  },
  function() {
    setTimeout(function() {
      page.open(itemUrl, function(status) {
        document.getElementById('oneClickBuyButton').click()
      })
      setTimeout(function() {
        phantom.exit()
      }, 3000)
    }, 2000)
  }
]).next();
