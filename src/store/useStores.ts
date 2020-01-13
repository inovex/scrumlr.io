import React from "react";
import {RootStore} from "./index";
import {MobXProviderContext} from "mobx-react";

const useStores = () => {
    return React.useContext<RootStore>(MobXProviderContext)
};

export default useStores;