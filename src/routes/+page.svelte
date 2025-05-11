<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import RecordForm from '$lib/components/RecordForm.svelte';
  import { getRecordDetails } from '../utils/api.js';

  let recordData = null;
  let isLoading = true;
  let error = null;
  let recordIdToLoad = null; // Startet ohne vorausgewählte ID

  let searchTerm = '';
  let searchResults = [];
  let isSearching = false;
  let searchError = null;

  async function loadRecord(idOrData) {
    isLoading = true;
    error = null;
    recordData = null; // Zurücksetzen für Neurendering
    try {
      if (typeof idOrData === 'number') {
        const data = await getRecordDetails(idOrData);
        recordData = data;
        recordIdToLoad = idOrData; // ID für das Eingabefeld aktualisieren
      } else if (typeof idOrData === 'object' && idOrData !== null) {
        recordData = idOrData;
        recordIdToLoad = idOrData.id; // ID für das Eingabefeld aktualisieren
      }
    } catch (e) {
      error = e.message || `Fehler beim Laden des Datensatzes.`;
      recordData = {}; // Leeres Objekt, um das Formular anzuzeigen
    } finally {
      isLoading = false;
    }
  }

  async function searchRecords() {
    if (!searchTerm.trim()) return;
    isSearching = true;
    searchError = null;
    searchResults = [];
    const searchUrl = import.meta.env.VITE_SEARCH_WEBHOOK_URL;
    if (!searchUrl) {
      searchError = "Such-Webhook-URL ist nicht konfiguriert.";
      isSearching = false;
      return;
    }
    try {
      const response = await fetch(`${searchUrl}?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`Fehler bei der Suche: ${response.statusText}`);
      }
      const data = await response.json();
      searchResults = data;
      if (data.length === 0) {
        searchError = "Keine Datensätze für diesen Suchbegriff gefunden.";
      }
    } catch (e) {
      searchError = e.message || "Ein Fehler ist bei der Suche aufgetreten.";
    } finally {
      isSearching = false;
    }
  }

  onMount(() => {
    // Optional: Initial einen Datensatz laden, falls gewünscht
    // if (recordIdToLoad) {
    //   loadRecord(recordIdToLoad);
    // } else {
    //   isLoading = false; // Wenn keine ID initial geladen wird
    // }
    isLoading = false; // Starten ohne Laden, bis der Benutzer eine Aktion ausführt
  });

  function handleRecordSaved(event) {
    console.log('Record saved in parent, new data:', event.detail);
    // Optional: Nach dem Speichern die Daten neu laden oder Suchergebnisse aktualisieren
  }

  function handleIdInputChange(event) {
    const newId = parseInt(event.target.value, 10);
    if (!isNaN(newId) && newId > 0) {
        recordIdToLoad = newId;
    } else if (event.target.value === ''){
        recordIdToLoad = null;
    }
  }

  function handleSearchTermChange(event) {
    searchTerm = event.target.value;
  }

  function handleSearchResultClick(result) {
    loadRecord(result.id); // Lädt den Datensatz über die ID neu
    searchResults = []; // Suchergebnisse ausblenden nach Auswahl
    searchTerm = ''; // Suchfeld leeren
  }

</script>

<main>
  <h1>RPI Datensatz Editor</h1>

  <div class="search-controls">
    <label for="searchInput">Datensatz suchen:</label>
    <input type="text" id="searchInput" value={searchTerm} on:input={handleSearchTermChange} placeholder="Suchbegriff eingeben..." />
    <button on:click={searchRecords} disabled={isSearching || !searchTerm.trim()}>
      {isSearching ? 'Suche...' : 'Suchen'}
    </button>
  </div>

  {#if searchError}
    <p class="search-error">{searchError}</p>
  {/if}

  {#if searchResults.length > 0}
    <div class="search-results">
      <h2>Suchergebnisse:</h2>
      <ul>
        {#each searchResults as result (result.id)}
          <li>
            <button 
              type="button" 
              class="search-result-button" 
              on:click={() => handleSearchResultClick(result)} 
              on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSearchResultClick(result); }}
            >
              <strong>{result.title}</strong> (ID: {result.id})
              <p>{result.description ? result.description.substring(0, 100) + '...' : 'Keine Beschreibung'}</p>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="load-controls">
    <label for="recordIdInput">Datensatz ID manuell laden:</label>
    <input type="number" id="recordIdInput" value={recordIdToLoad} on:input={handleIdInputChange} min="1" placeholder="ID eingeben"/>
    <button on:click={() => recordIdToLoad && loadRecord(recordIdToLoad)} disabled={isLoading || !recordIdToLoad}>
        {#if isLoading && recordData === null && recordIdToLoad}Lade...{:else}Laden{/if}
    </button>
  </div>

  {#if isLoading && recordData === null && recordIdToLoad}
    <p>Lade Datensatz ID: {recordIdToLoad}...</p>
  {:else if error}
    <p style="color: red;">{error}</p>
    <p>Bitte stelle sicher, dass der n8n Webhook aktiv ist und die ID existiert, oder versuche die Suche.</p>
    <p>Neuen Datensatz erstellen (Formular mit Standardwerten):</p>
    <RecordForm initialData={{}} on:saved={handleRecordSaved} />
  {:else if recordData}
    <RecordForm initialData={recordData} on:saved={handleRecordSaved} />
  {:else}
    <p>Bitte eine ID eingeben und laden oder die Suchfunktion verwenden, um einen Datensatz zu bearbeiten. Um einen neuen Datensatz zu erstellen, kann das Formular direkt verwendet werden, wenn keine Daten geladen sind.</p>
    <RecordForm initialData={{}} on:saved={handleRecordSaved} /> 
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  .search-controls, .load-controls {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f0f0f0;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .search-controls label, .load-controls label {
    font-weight: bold;
  }
  .search-controls input[type="text"], .load-controls input[type="number"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex-grow: 1; /* Damit das Suchfeld mehr Platz einnimmt */
  }
  .load-controls input[type="number"] {
      flex-grow: 0;
      width: 100px;
  }
  .search-controls button, .load-controls button {
    padding: 8px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .search-controls button:hover, .load-controls button:hover {
    background-color: #0056b3;
  }
  .search-controls button:disabled, .load-controls button:disabled {
    background-color: #cccccc;
  }
  .search-error {
    color: red;
    margin-bottom: 15px;
  }
  .search-results {
    margin-top: 20px;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 10px;
  }
  .search-results h2 {
    margin-top: 0;
    font-size: 1.2em;
  }
  .search-results ul {
    list-style: none;
    padding: 0;
  }
  .search-results li {
    margin-bottom: 5px; /* Etwas weniger Abstand, da der Button jetzt Padding hat */
  }
  .search-result-button {
    background: none;
    border: 1px solid transparent; /* Für konsistenten Platz, auch ohne Fokus */
    color: inherit;
    cursor: pointer;
    display: block; /* Nimmt die volle Breite des li ein */
    padding: 10px;
    text-align: left;
    width: 100%;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  }
  .search-result-button:hover,
  .search-result-button:focus {
    background-color: #f0f0f0;
    border-color: #007bff; /* Hebt den Button bei Fokus/Hover hervor */
    outline: none; /* Entfernt den Standard-Browser-Fokusring, da wir einen eigenen Rand setzen */
  }
  .search-result-button strong {
    display: block; /* Stellt sicher, dass der Titel in einer eigenen Zeile ist, falls gewünscht */
    font-size: 1.1em;
    margin-bottom: 5px;
  }
  .search-result-button p {
    margin: 0;
    font-size: 0.9em;
    color: #555;
  }

  .load-controls {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f0f0f0;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .load-controls label {
    font-weight: bold;
  }
  .load-controls input[type="number"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex-grow: 0;
    width: 100px;
  }
  .load-controls button {
    padding: 8px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .load-controls button:hover {
    background-color: #0056b3;
  }
  .load-controls button:disabled {
    background-color: #cccccc;
  }
</style>