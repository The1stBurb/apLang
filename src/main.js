import { createApp } from 'vue'
import App from './comps/App.vue'

createApp(App).mount('#app')

function waitForElement(selector, callback) {
  // Check if the element already exists
  const existingElement = document.querySelector(selector);
  if (existingElement) {
    callback(existingElement);
    return;
  }

  // Watch for future changes to the DOM
  const observer = new MutationObserver((mutations, obs) => {
    const element = document.querySelector(selector);
    if (element) {
      obs.disconnect(); // Stop watching once found to save memory
      callback(element);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

waitForElement("#editor", ()=>{
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
})