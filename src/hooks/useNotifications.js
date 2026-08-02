import { ref, onValue, off, update } from "firebase/database";
import { useEffect, useState } from "react"
import { rtdb } from "../firebase/config"

export const useNotifications =(uid) => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!uid) return

        const notifRef = ref(rtdb, `notificaitons/${uid}`)
        onValue(notifRef, (snap) => {
            const data = snap.val() || {}
            const list =Object.entries(data)
            .map(([id, notif]) => ({id, ...notif}))
            .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))
            setNotifications(list)
            setUnreadCount(list.filter((n) =>!n.read).length)
        })

        return () => off(notifRef)
    }, [uid]

)

const markAllRead = async () => {
    if (!uid || notifications.length === 0) return
    const updates = {}
    notifications.forEach((n) => {
        if (!n.read) updates[`notifications/${uid}/${n.id}/read`] = true
    })
    await update(ref(rtdb), updates)
}

return {notifications, unreadCount, markAllRead}
}