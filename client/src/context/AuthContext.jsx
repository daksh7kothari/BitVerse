import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (!error) setProfile(data)
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (email, password, fullName) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        })
    }

    const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })

    const signOut = () => supabase.auth.signOut()

    return (
        <AuthContext.Provider value={{ user, profile, signUp, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
