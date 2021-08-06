import { createContext, useContext } from 'react'

import authStore from "./authStore";

const storeContext = createContext({ authStore })

export function useStores () {
    return useContext(storeContext)
};