const card = document.getElementById("card");
const puzzleWrapper = document.getElementById("puzzle-wrapper");

let isDragging = false;
let offsetX, offsetY;

function onStart(e) {
  isDragging = true;
  card.classList.add("dragging");
  
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  
  const rect = card.getBoundingClientRect();
  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;
  
  card.style.top = rect.top + "px";
  card.style.left = rect.left + "px";
  card.style.bottom = "auto";
  card.style.right = "auto";
}

function onMove(e) {
  if (!isDragging) return;
  
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  
  card.style.left = (clientX - offsetX) + "px";
  card.style.top = (clientY - offsetY) + "px";
}

function onEnd() {
  if (!isDragging) return;
  isDragging = false;
  card.classList.remove("dragging");
  snapToCorner();
}

card.addEventListener("mousedown", onStart);
document.addEventListener("mousemove", onMove);
document.addEventListener("mouseup", onEnd);

card.addEventListener("touchstart", onStart, { passive: true });
document.addEventListener("touchmove", onMove, { passive: false });
document.addEventListener("touchend", onEnd);

function snapToCorner() {
  const rect = card.getBoundingClientRect();
  const wrapperRect = puzzleWrapper.getBoundingClientRect();
  
  // Calculate the center of the wrapper relative to the viewport
  const midX = wrapperRect.left + (wrapperRect.width / 2);
  const midY = wrapperRect.top + (wrapperRect.height / 2);
  
  // Reset positioning
  card.style.top = "auto";
  card.style.left = "auto";
  card.style.bottom = "auto";
  card.style.right = "auto";
  
  // Check the card's center against the wrapper's center
  if ((rect.left + rect.width / 2) < midX) {
    card.style.left = "20px";
  } else {
    card.style.right = "20px";
  }
  
  if ((rect.top + rect.height / 2) < midY) {
    card.style.top = "20px";
  } else {
    card.style.bottom = "20px";
  }
}