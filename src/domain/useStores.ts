import React from 'react';
import { RootStore } from './rootStore';
import { MobXProviderContext } from 'mobx-react';

const useStores = () => {
    return React.useContext<RootStore>(MobXProviderContext);
};

export default useStores;
