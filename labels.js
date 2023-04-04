const { Octokit } = require('@octokit/rest');
const fs = require('fs');

require('dotenv').config();

const token = process.env.GITHUB_TOKEN;
const [owner, repo] = (process.env.REPOSITORY || '').split('/');
const filePath = 'labels.json';

if (!token) {
  console.error('Error: GITHUB_TOKEN is not set.');
  process.exit(1);
}

const octokit = new Octokit({
  auth: token,
});

async function exportLabels() {
  try {
    const { data: labels } = await octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
    });

    fs.writeFileSync(filePath, JSON.stringify(labels, null, 2));
    console.log(`Labels exported to ${filePath}`);
  } catch (err) {
    console.error('Error exporting labels:', err);
  }
}

async function importLabels() {
  try {
    const labelsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const label of labelsData) {
      try {
        await octokit.rest.issues.updateLabel({
          owner,
          repo,
          current_name: label.name,
          name: label.name,
          color: label.color,
          description: label.description,
        });
      } catch (err) {
        if (err.status === 404) {
          await octokit.rest.issues.createLabel({
            owner,
            repo,
            name: label.name,
            color: label.color,
            description: label.description,
          });
        } else {
          throw err;
        }
      }
    }

    console.log(`Labels imported from ${filePath}`);
  } catch (err) {
    console.error('Error importing labels:', err);
  }
}

if (process.argv[2] === 'export') {
  exportLabels();
} else if (process.argv[2] === 'import') {
  importLabels();
} else {
  console.error('Error: Invalid argument. Use "export" or "import".');
}
