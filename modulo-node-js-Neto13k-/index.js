const fs = require('fs');
const readline = require('readline/promises');
const { createInterface } = require('readline');
const { EventEmitter } = require('events');
const path = require('path');
const { performance } = require('perf_hooks');

const eventEmitter = new EventEmitter();

async function processFile(filePath) {
  return new Promise((resolve, reject) => {
    let numberLineCount = 0;
    let textLineCount = 0;
    let numberSum = 0;

    const startTime = performance.now();

    const rl = createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const trimmed = line.trim();

      if (/^\d+$/.test(trimmed)) {
        numberLineCount++;
        numberSum += parseInt(trimmed, 10);
      } else if (trimmed.length > 0) {
        textLineCount++;
      }
    });

    rl.on('close', () => {
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      eventEmitter.emit('summary', {
        numberSum,
        textLineCount,
        duration
      });

      resolve();
    });

    rl.on('error', reject);
  });
}

eventEmitter.on('summary', (data) => {
  console.log('\nResumo:');
  console.log(`Soma: ${data.numberSum}`);
  console.log(`Quantidade de linhas: ${data.textLineCount}`);
  console.log(`Tempo de execução: ${data.duration}ms`);
});

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let repeat = true;

  while (repeat) {
    const filePath = await rl.question(' Digite o caminho do arquivo .txt: ');

    if (!fs.existsSync(filePath) || path.extname(filePath) !== '.txt') {
      console.log('Arquivo inválido. Tente novamente.');
      continue;
    }

    try {
      await processFile(filePath);
    } catch (err) {
      console.error('Erro ao processar o arquivo:', err.message);
    }

    const again = await rl.question('\n Deseja executar novamente? (sim/não): ');
    repeat = again.toLowerCase() === 'sim';
  }

  rl.close();
}

main();
