"use client";

import Chatsidebar from "@/components/Chatsidebar";
import Loading from "@/components/Loading";
import { chat_service, useAppData, User } from "@/context/Appcontext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import { SocketData } from "@/context/SocketContext";

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt: string;
  createdAt?: string;
}

const Chatapp = () => {
  const {
    loading,
    isAuth,
    logoutUser,
    chats,
    user: LoggedInUser,
    users,
    fetchChats,
    setChats,
  } = useAppData();

  const {onlineUsers,socket} = SocketData();

  console.log("Online users:", onlineUsers);

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, loading, router]);

  const handleLogout = () => logoutUser();

  // async function fetchChat(){
  //   const token =  Cookies.get("token");
  //   try {
  //     const {data} = await axios.get(`${chat_service}/api/v1/message/${selectedUser}`,{
  //       headers:{
  //         Authorization: `Bearer ${token}`,
  //       }
  //     }
  //   )
  //   setMessages(data.messages);
  //   console.log("Fetched data:", data);
  //    await fetchChats();
  //   } catch (error) {
  //     toast.error("Failed to load messages")
  //   }
  // }

  //   async function fetchChat() {
  //   const token = Cookies.get("token");
  //   if (!selectedUser || !token) return;

  //   try {
  //     const { data } = await axios.get(`${chat_service}/api/v1/message/${selectedUser}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     console.log("Fetched data:", data);

  //     if (!("messages" in data) || !("user" in data)) {
  //       throw new Error("Missing 'messages' or 'user' in response data");
  //     }
  //     setMessages(data.messages);
  //     setUser(data.user);
  //     fetchChats();
  //   } catch (error: any) {
  //     console.error("Failed to load messages:", {
  //     message: error.message,
  //     response: error.response?.data,
  //     stack: error.stack
  //   });

  //     toast.error("Failed to load messages");
  //   }
  // }

  async function fetchChat() {
    const token = Cookies.get("token");

    if (!selectedUser || !token) {
      console.warn("Cannot fetch chat: missing user or token.");
      return;
    }

    try {
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched data:", data);

      if (!("messages" in data) || !("user" in data)) {
        throw new Error("Missing 'messages' or 'user' in response data");
      }

      setMessages(data.messages);
      setUser(data.user);
      fetchChats();
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 404) {
        // ✅ Chat not found – don't show error toast
        console.warn("No chat found with this user yet.");
        setMessages([]);
        const userData = error?.response?.data?.user;
        if (userData) setUser(userData);
        return;
      }

      console.error("Failed to load messages:", {
        message: error?.message,
        response: error?.response?.data,
        stack: error?.stack,
      });

      toast.error("Failed to load messages");
    }
  }

  async function createChat(u: User) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${chat_service}/api/v1/chat/new`,
        { userId: LoggedInUser?._id, otherUserId: u._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedUser(data.chatId);
      setShowAllUsers(false);
      await fetchChats();
    } catch (error) {
      toast.error("Failed to start chat");
    }
  }

  const handleMessageSend = async (e: any, imageFile: File | null) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    if (!selectedUser) return;


    // socket work
    if(typingTimeout){
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    socket?.emit("stopTyping",{
      chatId: selectedUser,
      userId: LoggedInUser?._id
    })

    const token = Cookies.get("token");
    try {
      const formData = new FormData();
      formData.append("chatId", selectedUser);

      if (message.trim()) {
        formData.append("text", message);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await axios.post(
        `${chat_service}/api/v1/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessages((prev)=>{
        const currentMessages = prev || [];
        const messageExists = currentMessages.some((msg)=> msg._id === data.message._id)

        if(!messageExists){
          return [...currentMessages, data.message];
        }
        return currentMessages;
      })

      setMessage("");
      const displaytext = imageFile ? "📷 image" : message;

      
    } catch (error:any) { 
      toast.error(error.response?.data?.message);
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser || !socket) return;

    // socket setup
    if(value.trim()){
      socket.emit("typing",{
        chatId: selectedUser,
        userId: LoggedInUser?._id
      })
    }

    if(typingTimeout){
        clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(()=>{
      socket.emit("stopTyping",{
        chatId: selectedUser,
        userId: LoggedInUser?._id
      })
      
    },2000);

    setTypingTimeout(timeout);
  };

  useEffect(()=>{
    socket?.on("userTyping",(data)=>{
      console.log("recieved user typing",data);
      if(data.chatId === selectedUser && data.userId !== LoggedInUser?._id){
        setIsTyping(true);
      }
    })

     socket?.on("userStoppedTyping",(data)=>{
      console.log("recieved user stopped typing",data);
      if(data.chatId === selectedUser && data.userId !== LoggedInUser?._id){
        setIsTyping(false);
      }
    })

    return ()=>{
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    }
  }
  
  ,[socket,selectedUser,LoggedInUser?._id])

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
      setIsTyping(false);

      socket?.emit("joinChat",selectedUser);

      return () =>{
        socket?.emit("leaveChat",selectedUser);
        setMessages(null);
      }
    }
  }, [selectedUser, socket]);

  useEffect(()=>{
    return ()=>{
      if(typingTimeout){
        clearTimeout(typingTimeout);
      }
    }
  },
  [typingTimeout])

  if (loading) return <Loading />;
  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <Chatsidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        users={users}
        loggedInUser={LoggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
        createChat={createChat}
        onlineUsers = {onlineUsers}
      />

      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white-10">
        <ChatHeader
          user={user}
          setSidebarOpen={setSidebarOpen}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
        />
        <ChatMessages
          selectedUser={selectedUser}
          messages={messages}
          loggedInUser={LoggedInUser}
        />
        <MessageInput 
         selectedUser={selectedUser}
         message={message}
         setMessage={setMessage}
         handleMessageSend={handleMessageSend}
           handleTyping={handleTyping} // ✅ pass it

         

        />
        
      </div>
    </div>
  );
};

export default Chatapp;



