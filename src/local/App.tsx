import '../../index';

import { AuthProvider } from 'piche.npm.core';
import React from 'react';

const App: React.FC = () => {
  return (
    <AuthProvider>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <piche-react-app-template value='passed value' />
    </AuthProvider>
  );
};

export { App };
