import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";



const AuthContext = createContext(null)

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(undefined)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null))
        return () => unsub()
    }, [])

    return(
        <AuthContext.Provider value={{user}} >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)