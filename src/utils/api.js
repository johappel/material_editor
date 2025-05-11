// src/lib/utils/api.js

const N8N_LOAD_URL_BASE = import.meta.env.VITE_LOAD_WEBHOOK_URL;
const N8N_SAVE_URL = import.meta.env.VITE_SAVE_WEBHOOK_URL;

async function fetchData(url, options = {}) {
    console.log('Attempting to fetch URL:', url); // Hinzugefügte Konsolenausgabe
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }
            console.error('API Error Response:', errorData);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        // Der n8n Webhook für GET gibt oft ein Array zurück, auch wenn nur ein Element erwartet wird
        // oder direkt das Objekt. Wir versuchen, das zu handhaben.
        const data = await response.json();
        return Array.isArray(data) && data.length === 1 ? data[0] : data;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error; // Re-throw damit die aufrufende Komponente es fangen kann
    }
}

export const getRecordDetails = (id) => {
    const url = `${N8N_LOAD_URL_BASE}?id=${id}`;
    console.log('Constructed URL for getRecordDetails:', url); // Hinzugefügte Konsolenausgabe
    console.log('VITE_LOAD_WEBHOOK_URL from env:', import.meta.env.VITE_LOAD_WEBHOOK_URL); // Überprüfung der Variable
    return fetchData(url);
};

export const saveRecord = (data) => {
    // Der n8n Webhook erwartet das gesamte Objekt im Body.
    // Der POST Webhook hat keine ID im Pfad, also muss die ID im Body sein,
    // wenn n8n sie für ein UPDATE benötigt.
    // Dein Save-Webhook scheint einfach alle Daten zu erwarten.
    return fetchData(N8N_SAVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};