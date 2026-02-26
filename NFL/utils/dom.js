/**
 * DOM Utilities Module
 * Provides common DOM manipulation helpers
 */

/**
 * Create an element with optional class and content
 * @param {string} tag - HTML tag name
 * @param {string} className - CSS class name(s)
 * @param {string} textContent - Text content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, className = "", textContent = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

/**
 * Create an element with attributes
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Object with attribute key-value pairs
 * @returns {HTMLElement} Created element
 */
export function createElementWithAttrs(tag, attributes = {}) {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'innerHTML') {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  return el;
}

/**
 * Safely update an element's text content
 * @param {string} elementId - Element ID
 * @param {string} text - Text to set
 */
export function updateText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text;
}

/**
 * Safely update an element's HTML content
 * @param {string} elementId - Element ID
 * @param {string} html - HTML to set
 */
export function updateHTML(elementId, html) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = html;
}

/**
 * Clear all children from an element
 * @param {string|HTMLElement} elementOrId - Element ID or element reference
 */
export function clearElement(elementOrId) {
  const el = typeof elementOrId === 'string' 
    ? document.getElementById(elementOrId)
    : elementOrId;
  if (el) el.innerHTML = "";
}

/**
 * Show or hide an element
 * @param {string} elementId - Element ID
 * @param {boolean} show - Whether to show
 */
export function toggleElement(elementId, show = true) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = show ? "" : "none";
}

/**
 * Add event listener with error handling
 * @param {string} elementId - Element ID
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function addEventListener(elementId, event, handler) {
  const el = document.getElementById(elementId);
  if (el) el.addEventListener(event, handler);
}

/**
 * Select multiple elements and add event listeners
 * @param {string} selector - CSS selector
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function addEventListenerToAll(selector, event, handler) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener(event, handler);
  });
}
