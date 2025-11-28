import { reactToWebComponent } from 'piche.npm.core';

import { PicheReactAppTemplate } from './PicheReactAppTemplate';

customElements.define(
  'piche-react-app-template',
  reactToWebComponent(PicheReactAppTemplate, { props: { value: 'string' } })
);
