// add_headers.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToUpdate = [
  path.join(__dirname, 'backend', 'models'),
  path.join(__dirname, 'backend', 'routes'),
  path.join(__dirname, 'frontend', 'src', 'views')
];

function addJSDocHeader(filePath, fileName) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Prüfen, ob schon ein Header existiert
  if (content.trim().startsWith('/**')) return;

  const isVue = fileName.endsWith('.vue');
  let description = '';

  if (isVue) {
    description = `Vue 3 Component für das ${fileName.replace('.vue', '')}-Interface.`;
  } else if (filePath.includes('routes')) {
    description = `Express.js Router für die API-Endpunkte der ${fileName.replace('.js', '')}-Ressource.`;
  } else {
    description = `Mongoose Datenschema und Modell-Definition für ${fileName.replace('.js', '')}.`;
  }

  const header = `/**
 * @fileoverview ${fileName}
 * @project Zeiterfassungssystem (Diplomarbeit HTL)
 * @author Nawal & Ahmad
 * @description ${description}
 */\n\n`;

  if (isVue) {
      // Füge den Header nach dem <script setup> Tag ein, oder ganz oben wenn kein script setup.
      if (content.includes('<script setup>')) {
          content = content.replace('<script setup>', '<script setup>\n' + header.trim() + '\n');
      } else {
          // Falls kein script tag gefunden wird, ignorieren wir es
      }
  } else {
    content = header + content;
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Header zu ${fileName} hinzugefügt.`);
}

dirsToUpdate.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n📂 Durchsuche Verzeichnis: ${dir}`);
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isFile() && (file.endsWith('.js') || file.endsWith('.vue'))) {
        addJSDocHeader(fullPath, file);
      }
    });
  }
});

console.log("\n🎉 Alle Dateien wurden mit professionellen HTL-Diplomarbeits-Headern aktualisiert!");
