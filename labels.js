const labels = require('github-labels');
const fs = require('fs');

const token = process.env.GITHUB_TOKEN;
const repo = process.env.REPOSITORY;
const filePath = 'labels.json';

if (!token) {
  console.error('Error: GITHUB_TOKEN is not set.');
  process.exit(1);
}

const options = {
  token,
  repo,
};

function exportLabels() {
  labels.get(options, (err, result) => {
    if (err) {
      console.error('Error exporting labels:', err);
      return;
    }

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    console.log(`Labels exported to ${filePath}`);
  });
}

function importLabels() {
  const labelsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  options.labels = labelsData;
  options.force = true;

  labels.set(options, (err) => {
    if (err) {
      console.error('Error importing labels:', err);
      return;
    }

    console.log(`Labels imported from ${filePath}`);
  });
}

if (process.argv[2] === 'export') {
  exportLabels();
} else if (process.argv[2] === 'import') {
  importLabels();
} else {
  console.error('Error: Invalid argument. Use "export" or "import".');
}
