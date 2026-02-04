import { createContext, useContext, useState, useEffect } from 'react'

// Mock users with participant data
const MOCK_USERS = {
    refiner: {
        id: '9f53546e-67a2-4d0e-bd43-131479a64c62',
        username: 'refiner',
        password: 'refiner',
        role: 'refiner',
        name: 'Gold Refinery Inc',
        permissions: ['mint_token', 'merge_token', 'transfer_token', 'view_own']
    },
    craftsman: {
        id: 'b3cf56b8-4dc0-4081-9069-2d34d55438e0',
        username: 'craftsman',
        password: 'craftsman',
        role: 'craftsman',
        name: 'Master Craftsman Ltd',
        permissions: ['split_token', 'merge_token', 'log_wastage', 'transfer_token', 'create_product', 'view_own']
    },
    lab: {
        id: '3fb85466-33f9-4ca8-a995-2bf27528e808',
        username: 'lab',
        password: 'lab',
        role: 'lab',
        name: 'Quality Lab Services',
        permissions: ['approve_wastage', 'view_all']
    },
    admin: {
        id: '505377c0-cb91-474f-9806-fc305ddc0078',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        name: 'BitVerse Admin',
        permissions: ['mint_token', 'split_token', 'merge_token', 'transfer_token', 'approve_wastage', 'update_thresholds', 'view_all', 'create_product']
    },
    jeweller: {
        id: 'e3cf56b8-4dc0-4081-9069-2d34d55438e0', // Placeholder UUID
        username: 'jeweller',
        password: 'jeweller',
        role: 'jeweller',
        name: 'Luxury Gems Jewellers',
        permissions: ['transfer_token', 'view_own']
    }
}

const AuthContext = createContext({})

export const SimpleAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('bitverse_user')
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser)
                setUser(parsedUser)
            } catch (error) {
                console.error('Error parsing saved user:', error)
                localStorage.removeItem('bitverse_user')
            }
        }
        setLoading(false)
    }, [])

    const signIn = (username, password) => {
        const user = MOCK_USERS[username]

        if (!user) {
            return { error: { message: 'User not found' } }
        }

        if (user.password !== password) {
            return { error: { message: 'Invalid password' } }
        }

        // Remove password from stored user data
        const { password: _, ...userWithoutPassword } = user

        setUser(userWithoutPassword)
        localStorage.setItem('bitverse_user', JSON.stringify(userWithoutPassword))

        return { data: { user: userWithoutPassword }, error: null }
    }

    const signOut = () => {
        setUser(null)
        localStorage.removeItem('bitverse_user')
    }

    const hasPermission = (permission) => {
        if (!user) return false
        return user.permissions?.includes(permission) || false
    }

    return (
        <AuthContext.Provider value={{
            user,
            signIn,
            signOut,
            loading,
            hasPermission,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useSimpleAuth = () => useContext(AuthContext)
