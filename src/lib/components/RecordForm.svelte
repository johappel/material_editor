<!-- src/lib/components/RecordForm.svelte -->
<script lang="ts">
  import { onMount, onDestroy /*, createEventDispatcher */ } from 'svelte'; // createEventDispatcher entfernt
  import { browser } from '$app/environment';
  import KeywordsInput from './KeywordsInput.svelte';
  import AuthorsInput from './AuthorsInput.svelte';
  import PublishersInput from './PublishersInput.svelte';
  import 'easymde/dist/easymde.min.css';

  export let initialData: any = null;
  export let onSaved: (record: any) => void = () => {};

  // Typ für die EasyMDE-Klasse und -Instanz definieren
  type EasyMDEConstructor = typeof import('easymde');
  type EasyMDEInstance = import('easymde');

  let EasyMDE: EasyMDEConstructor;

  let formData = {
    id: null as number | null,
    title: '', 
    content_type: 'article',
    url: '',
    description: '', // Wird von EasyMDE verwaltet
    thumbnail: '', 
    summary: '', // Wird von EasyMDE verwaltet
    date_published: new Date().toISOString().slice(0, 10),
    keywords: [] as string[],
    author: [] as { name: string; url: string }[],
    publisher: [] as { name: string; url: string }[],
    links: [] as string[], 
    activities: [] as string[], 
    educational_level: [] as string[], 
    content: '' as string | null, // Wird von EasyMDE verwaltet, sicherstellen, dass es ein String ist
  };
  let isLoading = false;
  let error: string | null = null;
  let successMessage = '';

  let descriptionEditor: EasyMDEInstance | null = null;
  let summaryEditor: EasyMDEInstance | null = null;
  let contentEditor: EasyMDEInstance | null = null;
  let descriptionTextarea: HTMLTextAreaElement;
  let summaryTextarea: HTMLTextAreaElement;
  let contentTextarea: HTMLTextAreaElement;

  $: {
    if (initialData && typeof initialData === 'object' && Object.keys(initialData).length > 0) {
      const newFormDataCopy = JSON.parse(JSON.stringify(initialData)); 
      formData = {
        id: newFormDataCopy.id !== undefined ? newFormDataCopy.id : null,
        title: newFormDataCopy.title || '',
        content_type: newFormDataCopy.content_type || 'article',
        url: newFormDataCopy.url || '',
        description: newFormDataCopy.description || '', 
        thumbnail: newFormDataCopy.thumbnail || '', 
        summary: newFormDataCopy.summary || '', 
        date_published: newFormDataCopy.date_published || newFormDataCopy.created_at || new Date().toISOString().slice(0, 10),
        keywords: [] as string[], 
        author: [] as { name: string; url: string }[],
        publisher: [] as { name: string; url: string }[],
        links: [] as string[], 
        activities: [] as string[], 
        educational_level: [] as string[], 
        content: newFormDataCopy.content || '', 
        ...Object.fromEntries(Object.entries(newFormDataCopy).filter(([key]) => !['id', 'title', 'content_type', 'url', 'description', 'thumbnail', 'summary', 'date_published', 'created_at', 'keywords', 'author', 'publisher', 'links', 'activities', 'educational_level', 'content'].includes(key)))
      };

      if (newFormDataCopy.keywords && typeof newFormDataCopy.keywords === 'string') {
        try { formData.keywords = JSON.parse(newFormDataCopy.keywords); } catch (e) { formData.keywords = []; }
      } else if (Array.isArray(newFormDataCopy.keywords)) {
        formData.keywords = newFormDataCopy.keywords;
      } else { formData.keywords = []; }

      if (newFormDataCopy.author && typeof newFormDataCopy.author === 'string') {
        try {
          if (!newFormDataCopy.author.trim().startsWith('[') && !newFormDataCopy.author.trim().startsWith('{')) {
            formData.author = [{ name: newFormDataCopy.author.trim(), url: '' }];
          } else { formData.author = JSON.parse(newFormDataCopy.author); }
        } catch (e) { formData.author = []; }
      } else if (Array.isArray(newFormDataCopy.author)) {
        formData.author = newFormDataCopy.author;
      } else { formData.author = []; }

      if (newFormDataCopy.publisher && typeof newFormDataCopy.publisher === 'string') {
        try {
          if (!newFormDataCopy.publisher.trim().startsWith('[') && !newFormDataCopy.publisher.trim().startsWith('{')) {
            formData.publisher = []; 
          } else { formData.publisher = JSON.parse(newFormDataCopy.publisher); }
        } catch (e) { formData.publisher = []; }
      } else if (Array.isArray(newFormDataCopy.publisher)) {
        formData.publisher = newFormDataCopy.publisher;
      } else { formData.publisher = []; }

      if (newFormDataCopy.links && typeof newFormDataCopy.links === 'string') {
        try { formData.links = JSON.parse(newFormDataCopy.links); } catch (e) { formData.links = []; }
      } else if (Array.isArray(newFormDataCopy.links)) {
        formData.links = newFormDataCopy.links;
      } else { formData.links = []; }
      
      if (newFormDataCopy.activities && typeof newFormDataCopy.activities === 'string') {
        try { formData.activities = JSON.parse(newFormDataCopy.activities); } catch (e) { formData.activities = []; }
      } else if (Array.isArray(newFormDataCopy.activities)) {
        formData.activities = newFormDataCopy.activities;
      } else { formData.activities = []; }

      if (newFormDataCopy.educational_level && typeof newFormDataCopy.educational_level === 'string') {
        try { formData.educational_level = JSON.parse(newFormDataCopy.educational_level); } catch (e) { formData.educational_level = []; }
      } else if (Array.isArray(newFormDataCopy.educational_level)) {
        formData.educational_level = newFormDataCopy.educational_level;
      } else { formData.educational_level = []; }

      if (browser) { 
        if (descriptionEditor && descriptionEditor.value() !== formData.description) {
          descriptionEditor.value(formData.description || '');
        }
        if (summaryEditor && summaryEditor.value() !== formData.summary) {
          summaryEditor.value(formData.summary || '');
        }
        if (contentEditor && contentEditor.value() !== formData.content) {
          contentEditor.value(formData.content || '');
        }
      }

    } else if (!initialData) {
      const defaultDate = new Date().toISOString().slice(0, 10);
      formData = {
        id: null, title: '', content_type: 'article', url: '', description: '', thumbnail: '', summary: '', 
        content: '', date_published: defaultDate,
        keywords: [], author: [], publisher: [],
        links: [], activities: [], educational_level: [], 
      };
       if (browser) { 
        if (descriptionEditor) {
          descriptionEditor.value('');
        }
        if (summaryEditor) {
          summaryEditor.value('');
        }
        if (contentEditor) {
          contentEditor.value('');
        }
      }
    }
  }

  onMount(async () => {
    if (browser) { 
      const module = await import('easymde');
      EasyMDE = module.default; 

      if (descriptionTextarea && EasyMDE) {
        descriptionEditor = new EasyMDE({
          element: descriptionTextarea,
          initialValue: formData.description || '',
          spellChecker: false,
          minHeight: '100px',
          toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
        });
        descriptionEditor.codemirror.on('change', () => {
          if (descriptionEditor) {
            formData.description = descriptionEditor.value();
          }
        });
      }

      if (summaryTextarea && EasyMDE) {
        summaryEditor = new EasyMDE({
          element: summaryTextarea,
          initialValue: formData.summary || '',
          spellChecker: false,
          minHeight: '150px',
          toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
        });
        summaryEditor.codemirror.on('change', () => {
          if (summaryEditor) {
            formData.summary = summaryEditor.value();
          }
        });
      }

      if (contentTextarea && EasyMDE) {
        contentEditor = new EasyMDE({
          element: contentTextarea,
          initialValue: formData.content || '',
          spellChecker: false,
          minHeight: '200px', 
          maxHeight: '200px', 
          toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', 'table', 'horizontal-rule', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
        });
        contentEditor.codemirror.on('change', () => {
          if (contentEditor) {
            formData.content = contentEditor.value();
          }
        });
        contentEditor.codemirror.on('focus', () => {
          if (contentEditor) {
            const cmInstance = contentEditor.codemirror;
            const wrapper = cmInstance.getWrapperElement();
            wrapper.style.height = '600px'; 
            cmInstance.refresh(); 
          }
        });
        contentEditor.codemirror.on('blur', () => {
          if (contentEditor) {
            const cmInstance = contentEditor.codemirror;
            const wrapper = cmInstance.getWrapperElement();
            wrapper.style.height = ''; // Setzt auf CSS/minHeight zurück
            cmInstance.refresh();
          }
        });
      }
      
      if (descriptionEditor && formData.description !== descriptionEditor.value()) {
        descriptionEditor.value(formData.description || '');
      }
      if (summaryEditor && formData.summary !== summaryEditor.value()) {
        summaryEditor.value(formData.summary || '');
      }
      if (contentEditor && formData.content !== contentEditor.value()) {
        contentEditor.value(formData.content || '');
      }
    }
  });

  onDestroy(() => {
    if (browser) { 
      if (descriptionEditor) {
        descriptionEditor.toTextArea();
        descriptionEditor = null;
      }
      if (summaryEditor) {
        summaryEditor.toTextArea();
        summaryEditor = null;
      }
      if (contentEditor) {
        contentEditor.toTextArea();
        contentEditor = null;
      }
    }
  });

  function handleKeywordsChange(updatedKeywords: string[]) { 
    formData.keywords = updatedKeywords;
  }

  function handleAuthorsChange(updatedAuthors: { name: string; url: string }[]) {
    formData.author = updatedAuthors;
  }

  function handlePublishersChange(updatedPublishers: { name: string; url: string }[]) {
    formData.publisher = updatedPublishers;
  }

  function handleLinksChange(updatedLinks: string[]) { 
    formData.links = updatedLinks;
  }

  function handleActivitiesChange(updatedActivities: string[]) { 
    formData.activities = updatedActivities;
  }

  function handleEducationalLevelChange(updatedEducationalLevels: string[]) { 
    formData.educational_level = updatedEducationalLevels;
  }

  async function handleSubmit() {
    isLoading = true;
    error = null;
    successMessage = '';
    if (browser) { 
      if (descriptionEditor) {
        formData.description = descriptionEditor.value();
      }
      if (summaryEditor) {
        formData.summary = summaryEditor.value();
      }
      if (contentEditor) {
        formData.content = contentEditor.value();
      }
    }
    const dataToSave = {
      ...formData,
      keywords: JSON.stringify(Array.isArray(formData.keywords) ? formData.keywords : []),
      author: JSON.stringify(Array.isArray(formData.author) ? formData.author : []),
      publisher: JSON.stringify(Array.isArray(formData.publisher) ? formData.publisher : []),
      links: JSON.stringify(Array.isArray(formData.links) ? formData.links : []), 
      activities: JSON.stringify(Array.isArray(formData.activities) ? formData.activities : []), 
      educational_level: JSON.stringify(Array.isArray(formData.educational_level) ? formData.educational_level : []), 
    };
    console.log("Sende Daten:", dataToSave);
    try {
      const response = await import('../../utils/api.js').then(m => m.saveRecord(dataToSave));
      successMessage = `Datensatz ${response.id ? '(ID: ' + response.id + ')' : ''} erfolgreich gespeichert!`;
      console.log("Antwort vom Server:", response);
      onSaved(response);
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
      <a href={'https://material.rpi-virtuell.de/?p='+initialData.material_id} target="_blank" style="float: inline-end;">
        Im Materialpool anschauen
      </a>
    </div>
    
    

    <div class="form-field">
      <label for="title">Titel / Name:</label>
      <input type="text" id="title" bind:value={formData.title} required /> 
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
      <textarea id="description" bind:this={descriptionTextarea}></textarea>
    </div>
    <div class="form-field">
      <label for="summary">Analyse:</label>
      <textarea id="summary" bind:this={summaryTextarea}></textarea> 
    </div>

    <div class="form-field">
      <label for="date_published">Veröffentlicht:</label>
      <input type="text" id="date_published" bind:value={formData.date_published} /> 
    </div>
    <div class="form-field">
      <label for="thumbnail">URL des Beitragsbilds:</label>
      <input type="text" id="thumbnail" bind:value={formData.thumbnail} /> 
    </div>

    <div class="form-field">
      <label for="keywords">Keywords:</label>
      <KeywordsInput keywords={formData.keywords} onChange={handleKeywordsChange} />
    </div>

    <div class="form-field">
      <label for="authors">Autoren:</label>
      <AuthorsInput authors={formData.author} onAuthorsChange={handleAuthorsChange} /> 
    </div>
    <div class="form-field">
      <label for="publishers">Herausgeber:</label>
      <PublishersInput publishers={formData.publisher} onPublishersChange={handlePublishersChange} /> 
    </div>

    <div class="form-field">
      <label for="links">Links:</label>
      <KeywordsInput keywords={formData.links} onChange={handleLinksChange} placeholder="Link hinzufügen..." />
    </div>

    <div class="form-field">
      <label for="activities">Lern-Aktivitäten:</label>
      <KeywordsInput keywords={formData.activities} onChange={handleActivitiesChange} placeholder="Aktivität hinzufügen..." />
    </div>

    <div class="form-field">
      <label for="educational_level">Bildungsstufen:</label>
      <KeywordsInput keywords={formData.educational_level} onChange={handleEducationalLevelChange} placeholder="Bildungsstufe hinzufügen..." />
    </div>

    

    <div class="form-field">
      <label for="content">Raw Content:</label>
      <textarea id="content" bind:this={contentTextarea}></textarea> 
    </div>

    <button type="submit" class="submit-button" disabled={isLoading}>
      {isLoading ? 'Speichern...' : 'Datensatz Speichern'}
    </button>
  </form>
{:else}
  <p>Keine Daten zum Anzeigen.</p>
{/if}

<style>
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
  .json-field-label { 
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .form-field input[type="text"],
  .form-field input[type="url"],
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

  :global(.EasyMDEContainer .CodeMirror) {
    border-color: #ccc; 
    border-radius: 4px; 
  }
  :global(.editor-toolbar) {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  :global(.editor-statusbar) {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
</style>