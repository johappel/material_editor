<!-- src/lib/components/KeywordsInput.svelte -->
<script lang="ts">
  // import { createEventDispatcher } from 'svelte'; // Entfernt

  export let keywords: string[] = [];
  export let placeholder: string = "Neues Keyword..."; // Standard-Platzhalter
  export let onChange: (updatedKeywords: string[]) => void; // Hinzugefügte Callback-Prop
  let newKeyword = '';

  // const dispatch = createEventDispatcher(); // Entfernt

  $: actualKeywords = Array.isArray(keywords) ? keywords : [];

  function addKeyword() {
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword && !actualKeywords.includes(trimmedKeyword)) {
      const updatedKeywords = [...actualKeywords, trimmedKeyword];
      // dispatch('change', updatedKeywords); // Ersetzt
      if (onChange) {
        onChange(updatedKeywords);
      }
      newKeyword = '';
    } else if (actualKeywords.includes(trimmedKeyword)) {
      console.warn("Eintrag bereits vorhanden:", trimmedKeyword);
      newKeyword = '';
    }
  }

  function removeKeyword(index: number) {
    const updatedKeywords = actualKeywords.filter((_, i) => i !== index);
    // dispatch('change', updatedKeywords); // Ersetzt
    if (onChange) {
      onChange(updatedKeywords);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addKeyword();
    }
  }
</script>

<div class="keywords-input-component">
  <div class="tags-container">
    {#each actualKeywords as keyword, index}
      <span class="tag">
        {keyword}
        <button class="remove-tag" on:click={() => removeKeyword(index)} title="Eintrag entfernen">×</button>
      </span>
    {/each}
  </div>
  <div class="add-keyword-controls">
    <input
      type="text"
      bind:value={newKeyword}
      on:keydown={handleKeydown}
      placeholder={placeholder}
    />
    <button on:click={addKeyword} class="add-button">Hinzufügen</button>
  </div>
</div>

<style>
  .keywords-input-component {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    font-family: sans-serif;
  }
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
    min-height: 20px; /* Damit es nicht kollabiert wenn leer */
  }
  .tag {
    background-color: #e0e0e0;
    padding: 5px 10px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    font-size: 0.9em;
  }
  .remove-tag {
    background: none;
    border: none;
    color: #555;
    margin-left: 8px;
    cursor: pointer;
    font-size: 1.2em;
    line-height: 1;
    padding: 0;
  }
  .remove-tag:hover {
    color: #000;
  }
  .add-keyword-controls {
    display: flex;
    gap: 8px;
  }
  .add-keyword-controls input[type="text"] {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .add-button {
    padding: 8px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .add-button:hover {
    background-color: #0056b3;
  }
</style>