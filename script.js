

const cards = [
  { id: 1, revealed: false, spread: false, x: 0, y: 0, rotation: 0, zIndex: 6 },
  { id: 2, revealed: false, spread: false, x: 0, y: 0, rotation: 0, zIndex: 5 },
  { id: 3, revealed: false, spread: false, x: 0, y: 0, rotation: 0, zIndex: 4 },
  { id: 4, revealed: false, spread: false, x: 0, y: 0, rotation: 0, zIndex: 3 },
  { id: 5, revealed: false, spread: false, x: 0, y: 0, rotation: 0, zIndex: 2 },
  { id: 6, revealed: false, spread: false, x: 0, y: 0, rotation: 0, zIndex: 1 },
]

let isSpread = false
let isShuffling = false
let noteRevealed = false
let maxZIndex = 10


let isDragging = false
let dragProgress = 0
let dragStartX = 0
let currentX = 0


let draggingCardId = null
let cardDragStart = { x: 0, y: 0, cardX: 0, cardY: 0 }


function createBokehEffects() {
  const container = document.getElementById("bokeh-container")
  for (let i = 0; i < 20; i++) {
    const bokeh = document.createElement("div")
    bokeh.className = "bokeh"
    bokeh.style.left = `${Math.random() * 100}%`
    bokeh.style.top = `${Math.random() * 100}%`
    bokeh.style.animationDelay = `${Math.random() * 5}s`
    bokeh.style.animationDuration = `${4 + Math.random() * 4}s`
    container.appendChild(bokeh)
  }
}

function createFloatingHearts() {
  const container = document.getElementById("floating-hearts")
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement("div")
    heart.className = "floating-heart"
    heart.textContent = "❤"
    heart.style.left = `${Math.random() * 100}%`
    heart.style.animationDelay = `${Math.random() * 10}s`
    heart.style.animationDuration = `${8 + Math.random() * 6}s`
    container.appendChild(heart)
  }
}


function scrollToStage2() {
  document.getElementById("stage-2").scrollIntoView({ behavior: "smooth" })
}

function scrollToStage3() {
  document.getElementById("stage-3").scrollIntoView({ behavior: "smooth" })
}


function initSlider() {
  const handle = document.getElementById("slider-handle")

  handle.addEventListener("mousedown", handleSliderDragStart)
  handle.addEventListener("touchstart", handleSliderDragStart, { passive: false })

  document.addEventListener("mousemove", handleSliderDragMove)
  document.addEventListener("mouseup", handleSliderDragEnd)
  document.addEventListener("touchmove", handleSliderDragMove, { passive: false })
  document.addEventListener("touchend", handleSliderDragEnd)
}

function handleSliderDragStart(e) {
  if (noteRevealed) return
  e.preventDefault()
  isDragging = true
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  dragStartX = clientX - currentX
}

function handleSliderDragMove(e) {
  if (!isDragging || noteRevealed) return

  const track = document.getElementById("slider-track")
  const handle = document.getElementById("slider-handle")
  const progress = document.getElementById("slider-progress")

  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const trackWidth = track.offsetWidth - 60
  let newX = clientX - dragStartX
  newX = Math.max(0, Math.min(newX, trackWidth))

  requestAnimationFrame(() => {
    currentX = newX
    dragProgress = (newX / trackWidth) * 100

    handle.style.left = `${dragProgress}%`
    progress.style.width = `${dragProgress}%`

    if (newX >= trackWidth * 0.95) {
      noteRevealed = true
      revealNote()
    }
  })
}

function handleSliderDragEnd() {
  isDragging = false
}

function revealNote() {
  document.getElementById("note-content").classList.add("fade-out")
  document.getElementById("reveal-image").classList.add("visible")
  document.getElementById("drag-slider").classList.add("hidden")
  triggerMagicalParticles()
}

function triggerMagicalParticles() {
  const container = document.getElementById("particles-container")
  const types = ["heart", "star", "butterfly"]
  const emojis = { heart: "❤", star: "✨", butterfly: "🦋" }

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div")
    const type = types[Math.floor(Math.random() * 3)]
    particle.className = `particle particle-${type}`
    particle.textContent = emojis[type]
    particle.style.left = `${Math.random() * 100}%`
    particle.style.top = `${Math.random() * 100}%`
    container.appendChild(particle)

    setTimeout(() => particle.remove(), 3000)
  }
}


function createCards() {
  const wrapper = document.getElementById("cards-wrapper")

  const cardImageSources = wrapper.querySelectorAll(".card-image-source")
  const cardImageMap = {}
  cardImageSources.forEach((source) => {
    const cardId = Number.parseInt(source.dataset.cardId)
    const imgEl = source.querySelector("img")
    if (imgEl) {
      cardImageMap[cardId] = imgEl.src
    }
  })


  cardImageSources.forEach((source) => source.remove())

  cards.forEach((card, index) => {
    const cardEl = document.createElement("div")
    cardEl.className = `memory-card ${card.revealed ? "revealed" : ""} ${card.spread ? "spread" : ""}`
    cardEl.dataset.id = card.id

    updateCardTransform(cardEl, card, index)

    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <div class="card-pattern">
            <span class="card-heart">❤</span>
          </div>
        </div>
        <div class="card-back">
          <img src="${cardImageMap[card.id]}" alt="Memory ${card.id}" crossorigin="anonymous" referrerpolicy="no-referrer" />
          <div class="card-glow"></div>
        </div>
      </div>
    `

    cardEl.addEventListener("mousedown", (e) => handleCardMouseDown(e, card.id))
    cardEl.addEventListener("touchstart", (e) => handleCardTouchStart(e, card.id), { passive: false })
    cardEl.addEventListener("click", (e) => handleCardClick(e, card.id))

    wrapper.appendChild(cardEl)
  })
}

function updateCardTransform(cardEl, card, index) {
  let transform = ""

  if (isSpread) {
    transform = `translate3d(${card.x}px, ${card.y}px, 0) rotate(${card.rotation}deg)`
  } else {
    const offsetX = ((index % 3) - 1) * 240
    transform = `translate3d(${card.x}px, ${card.y}px, 0) rotate(${card.rotation}deg) translateX(${offsetX}px)`
  }

  cardEl.style.transform = transform
  cardEl.style.zIndex = card.zIndex + (card.revealed ? 100 : 0) + (draggingCardId === card.id ? 200 : 0)
}

function renderCards() {
  const wrapper = document.getElementById("cards-wrapper")
  wrapper.className = `cards-wrapper ${isSpread ? "spread-mode" : ""}`

  cards.forEach((card, index) => {
    const cardEl = wrapper.querySelector(`[data-id="${card.id}"]`)
    if (cardEl) {
      cardEl.className = `memory-card ${card.revealed ? "revealed" : ""} ${card.spread ? "spread" : ""} ${draggingCardId === card.id ? "dragging" : ""}`
      updateCardTransform(cardEl, card, index)
    }
  })
}


function handleCardClick(e, cardId) {
  if (draggingCardId !== null) return

  const card = cards.find((c) => c.id === cardId)
  if (!card) return

  card.revealed = !card.revealed

  if (card.revealed) {
    createClickParticles(e, cardId)
  }

  renderCards()
}

function createClickParticles(e, cardId) {
  const cardEl = document.querySelector(`[data-id="${cardId}"]`)
  const rect = cardEl.getBoundingClientRect()

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement("div")
    particle.className = "click-particle"
    particle.textContent = Math.random() > 0.5 ? "❤" : "✨"
    particle.style.left = `${e.clientX - rect.left}px`
    particle.style.top = `${e.clientY - rect.top}px`
    particle.style.setProperty("--dx", (Math.random() - 0.5) * 150)
    particle.style.setProperty("--dy", (Math.random() - 0.5) * 150 - 50)
    cardEl.appendChild(particle)

    setTimeout(() => particle.remove(), 1500)
  }
}


function handleCardMouseDown(e, cardId) {
  if (!isSpread || e.target.closest(".click-particle")) return
  startCardDrag(e.clientX, e.clientY, cardId)
}

function handleCardTouchStart(e, cardId) {
  if (!isSpread) return
  e.preventDefault()
  const touch = e.touches[0]
  startCardDrag(touch.clientX, touch.clientY, cardId)
}

function startCardDrag(clientX, clientY, cardId) {
  const card = cards.find((c) => c.id === cardId)
  if (!card) return

  cardDragStart = {
    x: clientX,
    y: clientY,
    cardX: card.x,
    cardY: card.y,
  }

  maxZIndex += 1
  card.zIndex = maxZIndex
  draggingCardId = cardId

  renderCards()
}

document.addEventListener("mousemove", handleCardDragMove)
document.addEventListener("touchmove", handleCardDragMove, { passive: false })

function handleCardDragMove(e) {
  if (draggingCardId === null) return

  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  const deltaX = clientX - cardDragStart.x
  const deltaY = clientY - cardDragStart.y

  requestAnimationFrame(() => {
    const card = cards.find((c) => c.id === draggingCardId)
    if (card) {
      card.x = cardDragStart.cardX + deltaX
      card.y = cardDragStart.cardY + deltaY
      renderCards()
    }
  })
}

document.addEventListener("mouseup", handleCardDragEnd)
document.addEventListener("touchend", handleCardDragEnd)

function handleCardDragEnd() {
  if (draggingCardId !== null) {
    draggingCardId = null
    renderCards()
  }
}


async function shuffleCards() {
  if (isShuffling) return
  isShuffling = true

  const shuffleBtn = document.getElementById("shuffle-btn")
  shuffleBtn.disabled = true
  shuffleBtn.querySelector(".button-text").textContent = "✨ Shuffling..."

  for (let pass = 0; pass < 4; pass++) {
    cards.sort(() => Math.random() - 0.5)
    cards.forEach((card, i) => {
      card.x = isSpread ? card.x + (Math.random() - 0.5) * 60 : (Math.random() - 0.5) * 20
      card.y = isSpread ? card.y + (Math.random() - 0.5) * 40 : (Math.random() - 0.5) * 15
      card.rotation = isSpread ? card.rotation + (Math.random() - 0.5) * 15 : (Math.random() - 0.5) * 10
      card.zIndex = i + 1
    })
    renderCards()
    await new Promise((resolve) => setTimeout(resolve, 150))
  }


  cards.sort(() => Math.random() - 0.5)
  cards.forEach((card, i) => {
    if (!isSpread) {
      card.x = 0
      card.y = 0
      card.rotation = 0
    }
    card.zIndex = i + 1
  })
  renderCards()

  isShuffling = false
  shuffleBtn.disabled = false
  shuffleBtn.querySelector(".button-text").textContent = "✨ Shuffle Cards"
}


function spreadCards() {
  isSpread = !isSpread

  const spreadBtn = document.getElementById("spread-btn")
  const dragHint = document.getElementById("drag-hint")

  if (isSpread) {
    const positions = [
      { x: -200, y: -120 },
      { x: 0, y: -120 },
      { x: 200, y: -120 },
      { x: -200, y: 120 },
      { x: 0, y: 120 },
      { x: 200, y: 120 },
    ]

    // Adjust for mobile
    const isMobile = window.innerWidth <= 768
    const scale = isMobile ? 0.6 : 1

    cards.forEach((card, i) => {
      card.spread = true
      card.x = positions[i].x * scale + (Math.random() - 0.5) * 30
      card.y = positions[i].y * scale + (Math.random() - 0.5) * 20
      card.rotation = (Math.random() - 0.5) * 15
      card.zIndex = i + 1
    })

    spreadBtn.querySelector(".button-text").textContent = "📚 Stack Cards"
    dragHint.classList.add("visible")
  } else {
    cards.forEach((card, i) => {
      card.spread = false
      card.x = 0
      card.y = 0
      card.rotation = 0
      card.zIndex = i + 1
    })

    spreadBtn.querySelector(".button-text").textContent = "🃏 Spread Cards"
    dragHint.classList.remove("visible")
  }

  renderCards()
}


document.addEventListener("DOMContentLoaded", () => {
  createBokehEffects()
  createFloatingHearts()
  initSlider()
  createCards()

})
