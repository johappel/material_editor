<!-- src/lib/components/PublishersInput.svelte -->
<script lang="ts">
  // import { createEventDispatcher } from 'svelte'; // Veraltet und entfernt

  export let publishers: { name: string; url: string }[] = [];
  export let onPublishersChange: (updatedPublishers: { name: string; url: string }[]) => void;

  $: actualPublishers = Array.isArray(publishers) ? publishers : [];

  function addPublisher() {
    const updatedPublishers = [...actualPublishers, { name: '', url: '' }];
    if (onPublishersChange) {
      onPublishersChange(updatedPublishers);
    }
  }

  function removePublisher(index: number) {
    const updatedPublishers = actualPublishers.filter((_, i) => i !== index);
    if (onPublishersChange) {
      onPublishersChange(updatedPublishers);
    }
  }

  function handlePublisherInputChange(index: number, field: 'name' | 'url', value: string) {
    const updatedPublishers = actualPublishers.map((publisher, i) => {
      if (i === index) {
        return { ...publisher, [field]: value };
      }
      return publisher;
    });
    if (onPublishersChange) {
      onPublishersChange(updatedPublishers);
    }
  }
</script>

<div class="publishers-input-component">
  {#if actualPublishers.length === 0}
    <p class="no-publishers-notice">Keine Publisher vorhanden.</p>
  {/if}
  {#each actualPublishers as publisher, index (publisher)}
    <div class="publisher-entry">
      <input
        type="text"
        placeholder="Name des Publishers"
        value={publisher.name || ''}
        on:input={(e) => handlePublisherInputChange(index, 'name', (e.target as HTMLInputElement).value)}
      />
      <input
        type="text"
        placeholder="URL (optional)"
        value={publisher.url || ''}
        on:input={(e) => handlePublisherInputChange(index, 'url', (e.target as HTMLInputElement).value)}
      />
      <button class="remove-publisher" on:click={() => removePublisher(index)} title="Publisher entfernen">×</button>
    </div>
  {/each}
  <button on:click={addPublisher} class="add-button">Publisher hinzufügen</button>
</div>

<style>
  .publishers-input-component {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    font-family: sans-serif;
  }
  .publisher-entry {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    align-items: center;
  }
  .publisher-entry input[type="text"] {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .remove-publisher {
    background: none;
    border: none;
    color: #cc0000;
    cursor: pointer;
    font-size: 1.5em;
    line-height: 1;
    padding: 0 5px;
  }
  .remove-publisher:hover {
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
  .no-publishers-notice {
    color: #777;
    font-style: italic;
    margin-bottom: 10px;
  }
</style>