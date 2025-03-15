const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const polyfillsPath = path.join(__dirname, 'src', 'polyfills.ts');
if (!fs.existsSync(polyfillsPath)) {
  console.log('Criando arquivo polyfills.ts...');
  fs.writeFileSync(polyfillsPath, `/**
 * Este arquivo contém polyfills necessários para o Angular
 */

// Zone.js é necessário para Angular
import 'zone.js';  // Included with Angular CLI
`);
  console.log('Arquivo polyfills.ts criado com sucesso.');
}

const reminderDialogPath = path.join(__dirname, 'src', 'app', 'components', 'add-reminder-dialog', 'add-reminder-dialog.component.html');
if (fs.existsSync(reminderDialogPath)) {
  try {
    let content = fs.readFileSync(reminderDialogPath, 'utf8');

    content = content.replace(/data\?\.jobApplication\?\.jobName/g, 'data && data.jobApplication && data.jobApplication.jobName');

    fs.writeFileSync(reminderDialogPath, content);
    console.log('Arquivo add-reminder-dialog.component.html corrigido com sucesso.');
  } catch (err) {
    console.error('Erro ao modificar add-reminder-dialog.component.html:', err);
  }
}

console.log('Executando build do Angular...');
try {
  execSync('ng build --configuration production --aot --output-hashing=all --optimization=false', { stdio: 'inherit' });
  console.log('Build concluído com sucesso');
} catch (error) {
  console.error('Erro durante o build:', error);
  process.exit(1);
}
