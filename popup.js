'use strict'

const LUNATASK_API = 'https://api.lunatask.app/v1'

async function getSettings () {
  return new Promise(resolve => {
    chrome.storage.local.get(['apiToken', 'areas', 'defaultAreaId'], resolve)
  })
}

async function getCurrentTab () {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

function showStatus (msg, type) {
  const el = document.getElementById('status-msg')
  el.textContent = msg
  el.className = type
  el.classList.remove('hidden')
}

function hideStatus () {
  const el = document.getElementById('status-msg')
  el.classList.add('hidden')
}

function populateAreas (areas, defaultAreaId) {
  const select = document.getElementById('area-select')
  select.innerHTML = ''

  if (!areas || areas.length === 0) {
    const opt = document.createElement('option')
    opt.value = ''
    opt.textContent = 'No areas configured'
    select.appendChild(opt)
    return
  }

  areas.forEach(area => {
    const opt = document.createElement('option')
    opt.value = area.id
    opt.textContent = area.name
    if (area.id === defaultAreaId) opt.selected = true
    select.appendChild(opt)
  })
}

async function createTask (token, payload) {
  const res = await fetch(`${LUNATASK_API}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (res.status === 204) return { duplicate: true }
  if (!res.ok) {
    let msg = `API error ${res.status}`
    try {
      const data = await res.json()
      if (data.message) msg = data.message
    } catch (_) {}
    throw new Error(msg)
  }

  return res.json()
}

document.addEventListener('DOMContentLoaded', async () => {
  const { apiToken, areas, defaultAreaId } = await getSettings()

  const notConfigured = document.getElementById('not-configured')
  const taskForm = document.getElementById('task-form')

  if (!apiToken) {
    notConfigured.classList.remove('hidden')
    document.getElementById('btn-go-settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage()
    })
    document.getElementById('btn-settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage()
    })
    return
  }

  taskForm.classList.remove('hidden')
  populateAreas(areas, defaultAreaId)

  const tab = await getCurrentTab()
  const nameInput = document.getElementById('task-name')
  const noteInput = document.getElementById('task-note')

  nameInput.value = tab.title || ''
  noteInput.value = tab.url || ''
  nameInput.focus()
  nameInput.select()

  document.getElementById('btn-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage()
  })

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    hideStatus()

    const name = nameInput.value.trim()
    const note = noteInput.value.trim()
    const areaId = document.getElementById('area-select').value
    const scheduledOn = document.getElementById('scheduled-on').value

    if (!areaId) {
      showStatus('Please configure an area in settings.', 'error')
      return
    }

    const btn = document.getElementById('btn-add')
    btn.disabled = true
    btn.textContent = 'Adding…'

    const payload = { area_id: areaId }
    if (name) payload.name = name
    if (note) payload.note = note
    if (scheduledOn) payload.scheduled_on = scheduledOn

    try {
      const result = await createTask(apiToken, payload)
      if (result.duplicate) {
        showStatus('A matching task already exists in Lunatask.', 'success')
      } else {
        showStatus('Task added!', 'success')
        setTimeout(() => window.close(), 1200)
      }
    } catch (err) {
      showStatus(err.message || 'Something went wrong.', 'error')
      btn.disabled = false
      btn.textContent = 'Add task'
    }
  })
})
