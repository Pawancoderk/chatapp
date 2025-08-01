"use client";
import axios from "axios";
import { ArrowRight, ChevronLeft, Loader2, Lock } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useAppData, user_service } from "@/context/Appcontext";
import Loading from "./Loading";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const {isAuth, setIsAuth, setUser, loading: userLoading,fetchChats,fetchUsers} = useAppData()
  const [loading, setLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const searchParams = useSearchParams();
  const email: string = searchParams.get("email") || "";
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  //   ! logic of timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  //   ! logic of otp enter
  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    // ! logic of focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ! code paste logic
  const handlePaste = (e: React.ClipboardEvent<HTMLElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FocusEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please Enter All 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/verify`, {
        email,
        otp: otpString,
      });
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      }),
        setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true)
      fetchChats();
      fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.message || "something went wrong");
    }
    finally{
      setLoading(false)
    }
  };

  const handleResendOtp = async()=>{
    setResendLoading(true)
    setError("")

    try {
      const {data} = await axios.post(`${user_service}/api/v1/login`,{email})

      toast.success(data.message)
      setTimer(60)
    } catch (error:any) {
      setError(error.response?.data?.message );
    }finally{
      setResendLoading(false)
    }
  };
  if(userLoading) return <Loading/>
  if(isAuth) redirect("/chat")
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-8">
          <div className="text-center mb-8 relative">
            <button  className="absolute top-0 left-0 p-2 text-gray-300 hover:text-white " > <ChevronLeft onClick={()=>router.push("/login")} className="w-6 h-6 "/></button>
            <div className="mx-auto w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h1 className="text-4xl text-white mb-3">Verify your Email</h1>
            <p className="text-gray-300 text-lg">We sent a 6-digit code to</p>
            <p className="text-blue-400 font-medium">{email}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Enter your 6 digit otp here
              </label>
              <div className="flex justify-center in-checked: space-x-4">
                {otp.map((digit, index) => (
                  <input
                    ref={(el: HTMLInputElement | null) => {
                      inputRefs.current[index] = el;
                    }}
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index == 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                ))}
              </div>
            </div>
            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg  p-3">
                <p className="text-red-300 text0sm text-center">{error}</p>
              </div>
            )}
            <button
              type="submit"
              className=" bg-blue-600 py-4 px-6 font-semibold w-full rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />{" "}
                  Verifying
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 ">
                  <span> Verify</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Din't receive the code?{" "}
            </p>
            {timer > 0 ? (
              <p className="text-gray-400 text-sm">Resend otp in {timer} seconds</p>
            ) : (
              <button
                className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50 "
                disabled={resendLoading}
                onClick={handleResendOtp}
              >
                {resendLoading ? "Sending" : "Resend Code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VerifyOtp;
