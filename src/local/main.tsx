import './main.scss';

import { ApiClient, AppConfig, Logger, OperationClient, TableClient, UserManager } from 'piche.npm.core';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

document.addEventListener('DOMContentLoaded', async () => {
  const idUrl = import.meta.env.VITE_LOGIN_URL as string;
  const apiUrl = import.meta.env.VITE_API_URL as string;
  const operationUrl = import.meta.env.VITE_API_OPERATION_URL as string;

  const appConfig = new AppConfig({ apiUrl });
  appConfig.subscribe();

  const userManager = new UserManager({
    storageKey: 'piche-security',
    location: idUrl,
    logoutRedirectRoute: 'login',
  });
  userManager.subscribe();

  const tableClient = new TableClient();
  tableClient.subscribe();

  const operationService = new OperationClient(operationUrl);
  operationService.subscribe();

  const identityService = {
    storageKey: 'test',
    location: idUrl,
    logoutRedirectRoute: 'login',
  };

  const apiClient = new ApiClient(identityService);
  apiClient.setup(userManager);
  apiClient.subscribe();

  const logger = new Logger({
    remote: {
      url: `/api/v1/Logs`,
      sendIntervalInSeconds: 10,
      batchSize: 10,
      headers: {
        apikey: '52556b24-7381-4a66-acf5-828dff58f35d',
      },
    },
    userManager,
  });
  logger.enableEventDrivenLogging();

  await userManager.tryAutoLogin();

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
