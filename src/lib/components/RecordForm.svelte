<!-- src/lib/components/RecordForm.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import KeywordsInput from './KeywordsInput.svelte';
  import AuthorsInput from './AuthorsInput.svelte';
  import PublishersInput from './PublishersInput.svelte';

  export let initialData: any = null;
  
  const dispatch = createEventDispatcher();

  let formData = {
    id: null as number | null,
    name: '', // Geändert von title zu name für Konsistenz
    content_type: 'article',
    url: '',
    description: '',
    summary: '', // Hinzugefügt für das summary-Feld
    date_published: new Date().toISOString().slice(0, 10),
    keywords: [] as string[],
    author: [] as { name: string; url: string }[],
    publisher: [] as { name: string; url: string }[],
    links: [] as string[], // NEU
    activities: [] as string[], // NEU
    educational_level: [] as string[], // NEU
  };
  let isLoading = false;
  let error: string | null = null;
  let successMessage = '';

  $: {
    if (initialData && typeof initialData === 'object' && Object.keys(initialData).length > 0) {
      const newFormData = JSON.parse(JSON.stringify(initialData)); // Tiefe Kopie
      formData = {
        id: newFormData.id !== undefined ? newFormData.id : null,
        name: newFormData.name || newFormData.title || '', // Akzeptiert name oder title aus initialData
        content_type: newFormData.content_type || 'article',
        url: newFormData.url || '',
        description: newFormData.description || '',
        summary: newFormData.summary || '',
        date_published: newFormData.date_published || newFormData.created_at || new Date().toISOString().slice(0, 10),
        keywords: [] as string[], 
        author: [] as { name: string; url: string }[],
        publisher: [] as { name: string; url: string }[],
        links: [] as string[], // NEU
        activities: [] as string[], // NEU
        educational_level: [] as string[], // NEU
        // Behalte andere Felder aus newFormData, falls vorhanden
        ...Object.fromEntries(Object.entries(newFormData).filter(([key]) => !['id', 'name', 'title', 'content_type', 'url', 'description', 'summary', 'date_published', 'created_at', 'keywords', 'author', 'publisher', 'links', 'activities', 'educational_level'].includes(key)))
      };

      if (newFormData.keywords && typeof newFormData.keywords === 'string') {
        try { formData.keywords = JSON.parse(newFormData.keywords); } catch (e) { formData.keywords = []; }
      } else if (Array.isArray(newFormData.keywords)) {
        formData.keywords = newFormData.keywords;
      } else { formData.keywords = []; }

      if (newFormData.author && typeof newFormData.author === 'string') {
        try {
          if (!newFormData.author.trim().startsWith('[') && !newFormData.author.trim().startsWith('{')) {
            formData.author = [{ name: newFormData.author.trim(), url: '' }];
          } else { formData.author = JSON.parse(newFormData.author); }
        } catch (e) { formData.author = []; }
      } else if (Array.isArray(newFormData.author)) {
        formData.author = newFormData.author;
      } else { formData.author = []; }

      if (newFormData.publisher && typeof newFormData.publisher === 'string') {
        try {
          if (!newFormData.publisher.trim().startsWith('[') && !newFormData.publisher.trim().startsWith('{')) {
            formData.publisher = []; 
          } else { formData.publisher = JSON.parse(newFormData.publisher); }
        } catch (e) { formData.publisher = []; }
      } else if (Array.isArray(newFormData.publisher)) {
        formData.publisher = newFormData.publisher;
      } else { formData.publisher = []; }

      // Links (NEU)
      if (newFormData.links && typeof newFormData.links === 'string') {
        try { formData.links = JSON.parse(newFormData.links); } catch (e) { formData.links = []; }
      } else if (Array.isArray(newFormData.links)) {
        formData.links = newFormData.links;
      } else { formData.links = []; }
      
      // Activities (NEU)
      if (newFormData.activities && typeof newFormData.activities === 'string') {
        try { formData.activities = JSON.parse(newFormData.activities); } catch (e) { formData.activities = []; }
      } else if (Array.isArray(newFormData.activities)) {
        formData.activities = newFormData.activities;
      } else { formData.activities = []; }

      // Educational Level (NEU)
      if (newFormData.educational_level && typeof newFormData.educational_level === 'string') {
        try { formData.educational_level = JSON.parse(newFormData.educational_level); } catch (e) { formData.educational_level = []; }
      } else if (Array.isArray(newFormData.educational_level)) {
        formData.educational_level = newFormData.educational_level;
      } else { formData.educational_level = []; }

    } else if (!initialData) {
      formData = {
        id: null, name: '', content_type: 'article', url: '', description: '', summary: '',
        date_published: new Date().toISOString().slice(0, 10),
        keywords: [], author: [], publisher: [],
        links: [], activities: [], educational_level: [], // NEU
      };
    }
  }

  function handleKeywordsChange(event: CustomEvent<string[]>) {
    formData.keywords = event.detail;
  }

  function handleAuthorsChange(updatedAuthors: { name: string; url: string }[]) {
    formData.author = updatedAuthors;
  }

  function handlePublishersChange(updatedPublishers: { name: string; url: string }[]) {
    formData.publisher = updatedPublishers;
  }

  // NEUE HANDLER
  function handleLinksChange(event: CustomEvent<string[]>) {
    formData.links = event.detail;
  }

  function handleActivitiesChange(event: CustomEvent<string[]>) {
    formData.activities = event.detail;
  }

  function handleEducationalLevelChange(event: CustomEvent<string[]>) {
    formData.educational_level = event.detail;
  }

  async function handleSubmit() {
    isLoading = true;
    error = null;
    successMessage = '';
    const dataToSave = {
      ...formData,
      keywords: JSON.stringify(Array.isArray(formData.keywords) ? formData.keywords : []),
      author: JSON.stringify(Array.isArray(formData.author) ? formData.author : []),
      publisher: JSON.stringify(Array.isArray(formData.publisher) ? formData.publisher : []),
      links: JSON.stringify(Array.isArray(formData.links) ? formData.links : []), // NEU
      activities: JSON.stringify(Array.isArray(formData.activities) ? formData.activities : []), // NEU
      educational_level: JSON.stringify(Array.isArray(formData.educational_level) ? formData.educational_level : []), // NEU
    };
    // ... (Rest der handleSubmit Funktion bleibt gleich)
    console.log("Sende Daten:", dataToSave);
    try {
      const response = await import('../../utils/api.js').then(m => m.saveRecord(dataToSave));
      successMessage = `Datensatz ${response.id ? '(ID: ' + response.id + ')' : ''} erfolgreich gespeichert!`;
      console.log("Antwort vom Server:", response);
      dispatch('saved', response); 
    } catch (e: any) {
      error = e.message || "Ein Fehler ist beim Speichern aufgetreten.";
    } finally {
      isLoading = false;
    }
  }
</script>

{#if !initialData && !formData.id}
  <p>Lade Formulardaten oder erstelle neuen Datensatz...</p>
{:else if initialData || formData.id}
  <form on:submit|preventDefault={handleSubmit} class="record-form">
    <!-- ... (Form Status unverändert) ... -->
    <div class="form-status">
      {#if isLoading}
        <p class="loading-message">Speichern...</p>
      {/if}
      {#if error}
        <p class="error-message">Fehler: {error}</p>
      {/if}
      {#if successMessage}
        <p class="success-message">{successMessage}</p>
      {/if}
    </div>

    <div class="form-field">
      <label for="id">ID:</label>
      <input type="text" id="id" bind:value={formData.id} readonly />
    </div>

    <div class="form-field">
      <label for="name">Titel / Name:</label>
      <input type="text" id="name" bind:value={formData.name} required /> <!-- Geändert zu formData.name -->
    </div>

    <div class="form-field">
      <label for="contentType">Art des Inhalts:</label>
      <select id="contentType" bind:value={formData.content_type}>
        <option value="scientific">Article</option>
        <option value="collection">Sammlung</option>
        <option value="medium">Medium</option>
        <option value="teachingmethod">Unterrichts- Lernmethode</option>
        <option value="teaching_practice">Unterrichtspraxis (Unterrichtsentwürfe, -einheiten...)</option>
        <option value="learning_task">Lernaktivity</option>
        <option value="education">Bildung</option>
      </select>
    </div>

    <div class="form-field">
      <label for="url">URL:</label>
      <input type="url" id="url" bind:value={formData.url} placeholder="https://example.com" />
    </div>
    
    <div class="form-field">
      <label for="description">Beschreibung:</label>
      <textarea id="description" rows="4" bind:value={formData.description}></textarea>
    </div>
    <div class="form-field">
      <label for="summary">Analyse:</label>
      <textarea id="summary" rows="4" bind:value={formData.summary}></textarea> <!-- Geändert zu formData.summary -->
    </div>

    <div class="form-field">
      <label for="date_published">Date Published:</label>
      <input type="text" id="date_published" bind:value={formData.date_published} /> <!-- Geändert zu formData.date_published -->
    </div>

    <div class="form-field">
      <label for="keywords">Keywords:</label>
      <KeywordsInput keywords={formData.keywords} on:change={handleKeywordsChange} />
    </div>

    <div class="form-field">
      <label for="authors">Autoren:</label>
      <AuthorsInput authors={formData.author} onAuthorsChange={handleAuthorsChange} /> <!-- Korrekte Prop-Übergabe -->
    </div>
    <div class="form-field">
      <label for="publishers">Publisher:</label>
      <PublishersInput publishers={formData.publisher} onPublishersChange={handlePublishersChange} /> <!-- Korrekte Prop-Übergabe -->
    </div>

    <!-- NEUE FELDER MIT KEYWORDSINPUT -->
    <div class="form-field">
      <label for="links">Links:</label>
      <KeywordsInput keywords={formData.links} on:change={handleLinksChange} placeholder="Link hinzufügen..." />
      <!-- Optional: anderer Placeholder für Links -->
    </div>

    <div class="form-field">
      <label for="activities">Activities:</label>
      <KeywordsInput keywords={formData.activities} on:change={handleActivitiesChange} placeholder="Aktivität hinzufügen..." />
    </div>

    <div class="form-field">
      <label for="educational_level">Educational Level:</label>
      <KeywordsInput keywords={formData.educational_level} on:change={handleEducationalLevelChange} placeholder="Bildungsstufe hinzufügen..." />
    </div>

    <div class="form-field debug-json" style="margin-top: 20px;">
        <div class="json-field-label">Andere JSON-Felder (Rohansicht zum Debuggen):</div> <!-- Geändert zu div für a11y -->
        {#each Object.entries(formData) as [key, value]}
            {#if typeof value === 'object' && value !== null && !['keywords', 'author', 'publisher', 'links', 'activities', 'educational_level'].includes(key)}
                <div class="json-field-debug">
                    <strong>{key}:</strong>
                    <textarea rows="3" readonly>{JSON.stringify(value, null, 2)}</textarea>
                </div>
            {:else if !['id', 'name', 'content_type', 'url', 'description', 'summary', 'date_published', 'keywords', 'author', 'publisher', 'links', 'activities', 'educational_level'].includes(key) && typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))}
                 <div class="json-field-debug">
                    <strong>{key} (als String, potenziell JSON):</strong>
                    <textarea rows="3" bind:value={formData[key]} placeholder="JSON-String eingeben"></textarea>
                </div>
            {/if}
        {/each}
    </div>

    <button type="submit" class="submit-button" disabled={isLoading}>
      {isLoading ? 'Speichern...' : 'Datensatz Speichern'}
    </button>
  </form>
{:else}
  <p>Keine Daten zum Anzeigen.</p>
{/if}

<style>
  /* ... (Styles bleiben weitgehend gleich, außer der entfernte Selektor) ... */
  .record-form {
    max-width: 700px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    font-family: sans-serif;
  }
  .form-field {
    margin-bottom: 15px;
  }
  .form-field label,
  .json-field-label { /* Hinzugefügt für das Debug-Label */
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .form-field input[type="text"],
  .form-field input[type="url"],
  /* .form-field input[type="date"], Entfernt, da nicht mehr verwendet */
  .form-field select,
  .form-field textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .form-field input[readonly] {
    background-color: #f0f0f0;
  }
  .submit-button {
    padding: 12px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
  }
  .submit-button:hover {
    background-color: #45a049;
  }
  .submit-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  .form-status p {
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
  }
  .loading-message {
    background-color: #e0e0e0;
    border: 1px solid #c0c0c0;
  }
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  .success-message {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
   .json-field-debug {
    margin-top: 10px;
    padding: 10px;
    background-color: #f9f9f9;
    border: 1px dashed #ddd;
  }
  .json-field-debug strong {
    display: block;
    margin-bottom: 5px;
  }
  .json-field-debug textarea {
    width: 100%;
    font-family: monospace;
    font-size: 0.9em;
  }
</style>