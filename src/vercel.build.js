const { execSync} = require('child_process');
console.log('Instalando dependências...');
execSync('npm install', { stdio: 'inherit' });

console.log('Executando build...');
execSync('ng build --configuration production', { stdio: 'inherit' });

console.log('Build concluído com sucesso');
