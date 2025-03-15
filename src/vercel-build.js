const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Iniciando script de build para Vercel...');

const isVercel = process.env.VERCEL === '1';
console.log(`Executando em ambiente Vercel: ${isVercel ? 'Sim' : 'Não'}`);

const polyfillsPath = path.join(__dirname, 'src', 'polyfills.ts');
if (!fs.existsSync(polyfillsPath)) {
  console.log(`Criando arquivo polyfills.ts em ${polyfillsPath}`);
  fs.writeFileSync(polyfillsPath, `/**
 * Este arquivo contém polyfills necessários para o Angular
 */

// Zone.js é necessário para Angular
import 'zone.js';  // Included with Angular CLI
`);
  console.log('Arquivo polyfills.ts criado com sucesso');
} else {
  console.log('Arquivo polyfills.ts já existe');
}

console.log('Executando build do Angular...');
try {
  execSync('npx ng build --configuration production', { stdio: 'inherit' });
  console.log('Build do Angular concluído com sucesso');
} catch (error) {
  console.error('Erro durante o build do Angular:', error);
  console.log('Tentando build alternativo...');

  try {
    execSync('npx ng build', { stdio: 'inherit' });
    console.log('Build alternativo concluído com sucesso');
  } catch (error2) {
    console.error('Erro no build alternativo:', error2);
    process.exit(1);
  }
}
