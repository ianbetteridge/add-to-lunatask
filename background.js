'use strict'

// Open settings on first install so the user can configure their token
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.runtime.openOptionsPage()
  }
})
