import type { FC } from 'react';

import { AIAssistant } from './AIAssistant';

interface Props {
  value?: string;
  apiUrl?: string;
}

export const PicheReactAppTemplate: FC<Props> = ({ apiUrl }) => {
  return <AIAssistant apiUrl={apiUrl} />;
};
