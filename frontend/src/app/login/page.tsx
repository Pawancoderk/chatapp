"use client"
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { redirect, useRouter } from 'next/navigation'
import {useState} from "react"
import React from 'react'
import axios from 'axios'
import { useAppData, user_service } from '@/context/Appcontext'
import Loading from '@/components/Loading'
import toast from 'react-hot-toast'

const Loginpage = () => {
    const [email, setEmail] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter();
    
    const {isAuth, loading: userLoading} = useAppData() 

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>):Promise<void>=>{
        e.preventDefault()
        setLoading(true)

        try {
            const {data}  = await axios.post(`${user_service}/api/v1/login`,{email});
            toast.success(data.message)
            router.push(`/verify?email=${email}`)
        } catch (error:any) {
           toast.error(error.response?.data?.message)
        }finally{
            setLoading(false)
        }
    }

    if(userLoading) return <Loading/>
    if(isAuth) return redirect("/chat")
  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='max-w-md w-full'>
            <div className='bg-gray-800 border border-gray-600 rounded-lg p-8'>
                <div className='text-center mb-8'>
                    <div className='mx-auto w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center mb-6'>
                       <Mail size={40} className='text-white'/>
                    </div>
                    <h1 className="text-4xl text-white mb-3">Welcome to Chat App</h1>
                    <p className="text-gray-300 text-lg">Enter your email to continue your Journey</p>
                </div>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div>
                        <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-1'>Email Address</label>
                        <input type="email" id="email" className='w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg outline-0 text-white' placeholder='Enter your email'required  value={email} onChange={(e)=>setEmail(e.target.value)}/>
                    </div>
                    <button type='submit' className=' bg-blue-600 py-4 px-6 font-semibold w-full rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2' disabled={loading}>

                        {
                            loading ? <div className='flex items-center justify-center gap-2'>
                              <Loader2 className='w-5 h-5 animate-spin text-white' /> Sending otp...
                            </div> :  <div className='flex items-center justify-center gap-2 '>
                           <span>Send Verification code</span>
                           <ArrowRight className='w-5 h-5'/>
                        </div>
                        }
                       
                    </button>
                </form>

            </div>
        </div>
    </div>
  )
}

export default Loginpage