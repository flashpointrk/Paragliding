import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: ['.next/**', 'node_modules/**'],
    rules: {
      // The React Compiler suggestions are not yet mandatory for React 18 and the
      // current client flows, so the warning-level rules are switched off rather
      // than risking a behavioural regression.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/refs': 'off',
    },
  },
];

export default config;
