'use strict'

const LUNATASK_API = 'https://api.lunatask.app/v1'

let areas = []

async function loadSettings () {
  return new Promise(resolve => {
    chrome.storage.local.get(['apiToken', 'areas', 'defaultAreaId'], resolve)
  })
}

async function saveSettings (data) {
  return new Promise(resolve => {
    chrome.storage.local.set(data, resolve)
  })
}

function renderAreas () {
  const list = document.getElementById('areas-list')
  list.innerHTML = ''

  if (areas.length === 0) {
    const empty = document.createElement('p')
    empty.style.color = 'var(--text-muted)'
    empty.style.fontSize = '13px'
    empty.style.marginBottom = '8px'
    empty.textContent = 'No areas added yet.'
    list.appendChild(empty)
    return
  }

  areas.forEach((area, i) => {
    const row = document.createElement('div')
    row.className = 'area-row'

    const info = document.createElement('div')
    info.className = 'area-info'

    const name = document.createElement('span')
    name.className = 'area-name'
    name.textContent = area.name

    const id = document.createElement('span')
    id.className = 'area-id'
    id.textContent = area.id

    info.appendChild(name)
    info.appendChild(id)

    const removeBtn = document.createElement('button')
    removeBtn.className = 'btn btn-danger'
    removeBtn.textContent = 'Remove'
    removeBtn.addEventListener('click', () => {
      areas.splice(i, 1)
      renderAreas()
      renderDefaultAreaSelect(null)
    })

    row.appendChild(info)
    row.appendChild(removeBtn)
    list.appendChild(row)
  })
}

function renderDefaultAreaSelect (currentDefault) {
  const select = document.getElementById('default-area')
  select.innerHTML = ''

  if (areas.length === 0) {
    const opt = document.createElement('option')
    opt.value = ''
    opt.textContent = 'No areas added'
    select.appendChild(opt)
    return
  }

  areas.forEach(area => {
    const opt = document.createElement('option')
    opt.value = area.id
    opt.textContent = area.name
    if (area.id === currentDefault) opt.selected = true
    select.appendChild(opt)
  })
}

function showVerifyStatus (msg, type) {
  const el = document.getElementById('verify-status')
  el.textContent = msg
  el.className = `status-msg ${type}`
  el.classList.remove('hidden')
}

function showSaveStatus (msg, type) {
  const el = document.getElementById('save-status')
  el.textContent = msg
  el.className = `status-msg ${type}`
  el.classList.remove('hidden')
  setTimeout(() => el.classList.add('hidden'), 3000)
}

function showAreaError (msg) {
  const el = document.getElementById('area-error')
  el.textContent = msg
  el.classList.remove('hidden')
  setTimeout(() => el.classList.add('hidden'), 3000)
}

function isValidUUID (str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim())
}

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await loadSettings()

  const tokenInput = document.getElementById('api-token')
  const toggleBtn = document.getElementById('btn-toggle-token')
  const verifyBtn = document.getElementById('btn-verify')
  const addAreaBtn = document.getElementById('btn-add-area')
  const saveBtn = document.getElementById('btn-save')

  if (settings.apiToken) tokenInput.value = settings.apiToken
  areas = settings.areas ? [...settings.areas] : []

  renderAreas()
  renderDefaultAreaSelect(settings.defaultAreaId)

  // Toggle token visibility
  toggleBtn.addEventListener('click', () => {
    if (tokenInput.type === 'password') {
      tokenInput.type = 'text'
      toggleBtn.textContent = 'Hide'
    } else {
      tokenInput.type = 'password'
      toggleBtn.textContent = 'Show'
    }
  })

  // Verify token
  verifyBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim()
    if (!token) {
      showVerifyStatus('Please enter a token first.', 'error')
      return
    }

    verifyBtn.disabled = true
    verifyBtn.textContent = 'Verifying…'

    try {
      const res = await fetch(`${LUNATASK_API}/ping`, {
        headers: { 'Authorization': `bearer ${token}` }
      })
      if (res.ok) {
        showVerifyStatus('Token is valid.', 'success')
      } else {
        showVerifyStatus(`Invalid token (${res.status}).`, 'error')
      }
    } catch (_) {
      showVerifyStatus('Network error — check your connection.', 'error')
    } finally {
      verifyBtn.disabled = false
      verifyBtn.textContent = 'Verify token'
    }
  })

  // Add area
  addAreaBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('new-area-name')
    const idInput = document.getElementById('new-area-id')
    const name = nameInput.value.trim()
    const id = idInput.value.trim()

    if (!name) {
      showAreaError('Please enter a name for the area.')
      return
    }
    if (!isValidUUID(id)) {
      showAreaError('Area ID must be a valid UUID (e.g. 550e8400-e29b-41d4-a716-446655440000).')
      return
    }
    if (areas.find(a => a.id === id)) {
      showAreaError('That area ID has already been added.')
      return
    }

    areas.push({ name, id: id.trim() })
    nameInput.value = ''
    idInput.value = ''
    renderAreas()
    renderDefaultAreaSelect(document.getElementById('default-area').value)
  })

  // Allow pressing Enter in the area ID field to add
  document.getElementById('new-area-id').addEventListener('keydown', e => {
    if (e.key === 'Enter') addAreaBtn.click()
  })

  // Save settings
  saveBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim()
    const defaultAreaId = document.getElementById('default-area').value

    if (!token) {
      showSaveStatus('Please enter an API token.', 'error')
      return
    }

    await saveSettings({ apiToken: token, areas, defaultAreaId })
    showSaveStatus('Settings saved.', 'success')
  })
})
