const fs = require('fs');
const yaml = require('js-yaml');

// Pfad zur YAML-Datei
const yamlFilePath = 'deine_datei.yml';

// Lese die YAML-Datei ein
try {
    const data = fs.readFileSync(yamlFilePath, 'utf8');
    const entries = yaml.safeLoad(data);

    // Iteriere über jeden Eintrag
    for (const key in entries) {
        if (entries.hasOwnProperty(key)) {
            const entry = entries[key];
            const filename = `${entry.id}.yaml`; // Verwende die ID als Dateinamen

            // Konvertiere den Eintrag in YAML-Format
            const yamlData = yaml.safeDump(entry);

            // Schreibe die Daten in eine separate YAML-Datei
            fs.writeFileSync(filename, yamlData, 'utf8');

            console.log(`Datei ${filename} wurde erfolgreich erstellt.`);
        }
    }
} catch (error) {
    console.error('Fehler beim Lesen der YAML-Datei:', error);
}
