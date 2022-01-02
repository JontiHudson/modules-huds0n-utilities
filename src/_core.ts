import { Keyboard } from 'react-native';
import { SharedState } from '@huds0n/shared-state';

type Huds0nStateType = {
  dismissInput: () => void;
  focusedId: null | number | string;
  isCustomInputOpen: boolean;
  isNetworkConnected: boolean;
};

export const huds0nState = new SharedState<Huds0nStateType>({
  dismissInput: Keyboard.dismiss,
  focusedId: null,
  isCustomInputOpen: false,
  isNetworkConnected: false,
});
