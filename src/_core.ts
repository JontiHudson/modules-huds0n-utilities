import { SharedState } from '@huds0n/shared-state';
import { Keyboard } from 'react-native';

type Huds0nStateType = {
  dismissInput: () => void;
  focusedId: undefined | number | string;
  isCustomInputOpen: boolean;
  isNetworkConnected: boolean;
};

export const huds0nState = new SharedState<Huds0nStateType>({
  dismissInput: Keyboard.dismiss,
  focusedId: undefined,
  isCustomInputOpen: false,
  isNetworkConnected: false,
});
