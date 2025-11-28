# Piche React App Template

## How to use:

1. Click on the "Use this template" button and then " Create a new repository"
2. In " Repository name" enter a name for your new repository and provide an optional description in "Description field".
3. Choose to create a private repository.
4. Click "Create a repository".

## When repository is created from the template:

1. Press "Code" button an choose link with which to clone it.
2. (Optional) In Settings -> Branches add branch protection rules as 'Require a pull request before merging'.

## Customize the Template

1.  Replace all `react-app-template` and `PicheReactAppTemplate` mentions with an appropriate new application name. Files that need change:

- vite.config.ts,

- package.json,

- index.html,

- App.tsx,

- app & local folders and .tsx .ts files,

- main.yml.

2. In main.yml remove current placeholder jobs and uncomment build jobs.

3. Adjust readme file.

4. Install dependencies.

5. Run the Application.

## Setup in webx

1. Go to https://npm.piche.it/ and find your repository and its current version.
2. To add App in webx, go to webx.gpark.lv -> tables -> "Web component registry".
3. Add your App information there as Name (Nosaukums), Package (Paka), Version (Versija) and in unpkg column add "dist/index.umd.js".
4. To see your App in webx dashboard, add it also in Apps table. Provide information about Name, Image, App tag and if needed check "Use loading screen" and add config.
