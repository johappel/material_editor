<!-- src/lib/components/AuthorsInput.svelte -->
<script lang="ts">
  // import { createEventDispatcher } from 'svelte'; // Entfernt

  export let authors: { name: string; url: string }[] = [];
  export let onAuthorsChange: (updatedAuthors: { name: string; url: string }[]) => void;

  // interface ComponentEvents { // Entfernt
  //   change: { name: string; url: string }[];
  // }
  
  // const dispatch = createEventDispatcher<ComponentEvents>(); // Entfernt

  $: actualAuthors = Array.isArray(authors) ? authors : [];

  function addAuthor() {
    const updatedAuthors = [...actualAuthors, { name: '', url: '' }];
    // dispatch('change', updatedAuthors); // Ersetzt
    if (onAuthorsChange) {
      onAuthorsChange(updatedAuthors);
    }
  }

  function removeAuthor(index: number) {
    const updatedAuthors = actualAuthors.filter((_, i) => i !== index);
    // dispatch('change', updatedAuthors); // Ersetzt
    if (onAuthorsChange) {
      onAuthorsChange(updatedAuthors);
    }
  }

  function handleAuthorInputChange(index: number, field: 'name' | 'url', value: string) {
    const updatedAuthors = actualAuthors.map((author, i) => {
      if (i === index) {
        return { ...author, [field]: value };
      }
      return author;
    });
    // dispatch('change', updatedAuthors); // Ersetzt
    if (onAuthorsChange) {
      onAuthorsChange(updatedAuthors);
    }
  }
</script>

<div class="authors-input-component">
  {#if actualAuthors.length === 0}
    <p class="no-authors-notice">Keine Autoren vorhanden.</p>
  {/if}
  {#each actualAuthors as author, index (author)}
    <div class="author-entry">
      <input
        type="text"
        placeholder="Name des Autors"
        value={author.name || ''}
        on:input={(e) => handleAuthorInputChange(index, 'name', (e.target as HTMLInputElement).value)}
      />
      <input
        type="text"
        placeholder="Rolle (optional)"
        value={author.url || ''}
        on:input={(e) => handleAuthorInputChange(index, 'url', (e.target as HTMLInputElement).value)}
      />
      <button class="remove-author" on:click={() => removeAuthor(index)} title="Autor entfernen">×</button>
    </div>
  {/each}
  <button on:click={addAuthor} class="add-button">Autor hinzufügen</button>
</div>

<style>
  .authors-input-component {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    font-family: sans-serif;
  }
  .author-entry {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    align-items: center;
  }
  .author-entry input[type="text"] {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .remove-author {
    background: none;
    border: none;
    color: #cc0000;
    cursor: pointer;
    font-size: 1.5em;
    line-height: 1;
    padding: 0 5px;
  }
  .remove-author:hover {
    color: #990000;
  }
  .add-button {
    padding: 8px 12px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }
  .add-button:hover {
    background-color: #1e7e34;
  }
  .no-authors-notice {
    color: #777;
    font-style: italic;
    margin-bottom: 10px;
  }
</style>