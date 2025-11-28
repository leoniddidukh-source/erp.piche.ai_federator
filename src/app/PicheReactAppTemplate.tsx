import { PuiTheme } from 'piche.ui';
import type { FC } from 'react';

interface Props {
  value?: string;
}

export const PicheReactAppTemplate: FC<Props> = ({ value }) => {
  return (
    <PuiTheme>
      <h1>Piche React App Template</h1>
      <h3>Value is: {value}</h3>
    </PuiTheme>
  );
};
