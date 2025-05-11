<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import RecordForm from '$lib/components/RecordForm.svelte';
  import { getRecordDetails } from '../utils/api.js';

  let recordData = null;
  let isLoading = true;
  let error = null;
  let recordIdToLoad = 42; // Die ID, die wir laden wollen

  async function loadRecord(id) {
    isLoading = true;
    error = null;
    recordData = null; // Zurücksetzen, um Formular-Neurendering bei ID-Wechsel zu triggern
    try {
      const data = await getRecordDetails(id);
      recordData = data; // Das wird die RecordForm-Komponente aktualisieren
    } catch (e) {
      error = e.message || `Fehler beim Laden von Datensatz ID ${id}.`;
      recordData = {}; // Leeres Objekt, damit das Formular nicht "Keine Daten" anzeigt
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadRecord(recordIdToLoad);
  });

  function handleRecordSaved(event) {
    // Optional: Nach dem Speichern die Daten neu laden,
    // um sicherzustellen, dass alles aktuell ist (falls der Server Änderungen vornimmt)
    // oder eine Erfolgsmeldung anzeigen, die schon im Formular ist.
    console.log('Record saved in parent, new data:', event.detail);
    // Für dieses Beispiel laden wir nicht automatisch neu, da die Formular Komponente
    // schon eine Erfolgsmeldung hat. Man könnte hier aber auch `loadRecord(recordData.id)` aufrufen.
  }

  function handleIdChange(event) {
    const newId = parseInt(event.target.value, 10);
    if (!isNaN(newId) && newId > 0) {
        recordIdToLoad = newId;
        // Optional: loadRecord(recordIdToLoad); // Direkt laden bei ID-Änderung
    }
  }
</script>

<main>
  <h1>RPI Datensatz Editor</h1>

  <div class="load-controls">
    <label for="recordIdInput">Datensatz ID laden:</label>
    <input type="number" id="recordIdInput" bind:value={recordIdToLoad} min="1" />
    <button on:click={() => loadRecord(recordIdToLoad)} disabled={isLoading}>
        {isLoading && recordData === null ? 'Lade...' : 'Laden'}
    </button>
  </div>

  {#if isLoading && recordData === null}
    <p>Lade Datensatz ID: {recordIdToLoad}...</p>
  {:else if error}
    <p style="color: red;">{error}</p>
    <p>Bitte stelle sicher, dass der n8n Webhook aktiv ist und die ID existiert.</p>
    <p>Versuche, das Formular mit leeren / Standardwerten zu initialisieren:</p>
    <RecordForm initialData={{}} on:saved={handleRecordSaved} />
  {:else if recordData}
    <RecordForm initialData={recordData} on:saved={handleRecordSaved} />
  {:else}
    <p>Keine Daten zum Anzeigen. Bitte eine ID eingeben und laden.</p>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
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
    width: 80px;
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