"use client"

import Chatsidebar from "@/components/Chatsidebar";
import Loading from "@/components/Loading";
import { useAppData, User } from "@/context/Appcontext";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";

export interface Message{
    _id: string;
    chatId: string;
    sender: string;
    text?: string;
    image?:{
        url: string;
        publicId: string;
    };
    messageType: "text"| "image";
    seen: boolean;
    seenAt: string;
    createdAt?: string; 
}

const Chatapp = ()=>{
    const {loading,isAuth,logoutUser ,chats,user:LoggedInUser,users,fetchChats,setChats} = useAppData()

    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [message, setMessage] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [messages, setMessages] = useState<Message[] | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [showAllUsers, setShowAllUsers] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

    const router = useRouter();

    useEffect(()=>{
        if(!isAuth && !loading){
            router.push("/login");
        }
    },
    [isAuth,loading,router]);

    const handleLogout  = ()=> logoutUser();

    if(loading) return <Loading/>
    return(
<div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
    <Chatsidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}  showAllUsers={showAllUsers} setShowAllUsers={setShowAllUsers} users={users} loggedInUser={LoggedInUser} chats={chats} selectedUser={selectedUser} setSelectedUser={setSelectedUser} handleLogout={handleLogout}/>
</div>
    )
}

export default Chatapp;