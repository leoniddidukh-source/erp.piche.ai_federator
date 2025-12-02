import './local/main.scss';

import React from 'react';

import { AIAssistant } from './app/AIAssistant';

interface Props {
  apiUrl?: string;
  userId?: string;
}

const App: React.FC<Props> = ({ apiUrl, userId }) => {
  // userId and apiUrl are passed from the host application via Module Federation
  console.log('[AI Federator Module] App loaded with apiUrl:', apiUrl, 'userId:', userId);

  return <AIAssistant apiUrl={apiUrl} />;
};

export default App;
