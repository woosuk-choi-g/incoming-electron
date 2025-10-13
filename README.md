# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Project Structure

This project is an Electron application built with React and Vite. Below is an overview of the key directories and files:

- **`electron/`**: Contains Electron-specific files for the main and preload processes.
  - `main.ts`: Entry point for the Electron main process.
  - `preload.ts`: Preload script for secure communication between main and renderer processes.
  - `electron-env.d.ts`: TypeScript declarations for Electron.

- **`src/`**: Source code for the React application.
  - `App.tsx`: Main React component.
  - `App.css`: Styles for the main component.
  - `index.css`: Global styles.
  - `assets/`: Static assets like images (e.g., `react.svg`).
  - Additional TypeScript/React files for components and utilities.

- **`public/`**: Static assets served by Vite.
  - Icons and images used in the application (e.g., `electron-vite.svg`).

- **Root-level files**:
  - `package.json`: Project dependencies and scripts.
  - `vite.config.ts`: Vite configuration.
  - `tsconfig.json` & `tsconfig.node.json`: TypeScript configuration.
  - `electron-builder.json5`: Configuration for building the Electron app.
  - Other config files like `.eslintrc.cjs`, `.prettierrc`, and `index.html` for development setup.

This structure supports a desktop application with a React frontend packaged via Electron.
