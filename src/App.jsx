.app {
  display: flex;
  min-height: 100vh;
  background: #1a1a1a;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  min-height: 100vh;
}

button {
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #2a2a2a;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.25s;
}

button:hover {
  background-color: #3a3a3a;
  border-color: #4a4a4a;
}

button.active {
  background: linear-gradient(135deg, #e2b714 0%, #f5c61f 100%);
  color: #000;
  border-color: #e2b714;
  font-weight: 600;
}

button.active:hover {
  box-shadow: 0 4px 12px rgba(226, 183, 20, 0.3);
  transform: translateY(-1px);
}

button:focus,
button:focus-visible {
  outline: 2px solid #e2b714;
  outline-offset: 2px;
}

button:active {
  transform: translateY(1px);
}

input[type="text"],
input[type="number"] {
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: 'Roboto Mono', monospace;
  color: #e0e0e0;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="number"]:focus {
  outline: none;
  border-color: #e2b714;
  box-shadow: 0 0 0 3px rgba(226, 183, 20, 0.1);
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #e2b714;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
}
