import { createContext, useContext } from 'react'

import auth from "./auth";

const storeContext = createContext({ auth })

export function useStores () {
    return useContext(storeContext)
};