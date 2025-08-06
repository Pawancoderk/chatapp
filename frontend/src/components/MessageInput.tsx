import React, { useState } from "react";
import X, { Loader, Loader2, Paperclip, Send, XIcon } from "lucide-react";
interface MessageInputProps {
  selectedUser: string | null;
  message: string;
  setMessage: (message: string) => void;
  handleMessageSend: (e: any, imageFile?: File | null) => void;
  handleTyping: (value: string) => void; // ✅ ADD THIS
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  handleMessageSend,
  handleTyping
}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    try {
      setIsUploading(true);
      await handleMessageSend(e, imageFile);
      setMessage("");
      setImageFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  if (!selectedUser) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t border-gray-700 pt-2 w-full"
    >
      {imageFile && (
        <div className="relative w-fit ">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-24 h-24 object-cover rounded-lg border border-gray-600"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-black rounded-full p-1"
            onClick={() => setImageFile(null)}
          >
            <XIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors">
          <Paperclip size={18} className="text-gray-300" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.type.startsWith("image/")) setImageFile(file);
            }}
          />
        </label>

        <input
          type="text"
          className="flex-1 bg-gray-700 rounded-lg px-4 py-3 text-white outline-0 placeholder-gray-400"
          placeholder={imageFile ? "Add a caption" : "Type a message"}
          value={message}
          // onChange={(e) => setMessage(e.target.value)}
          onChange={(e) => handleTyping(e.target.value)} // ✅ Call full typing logic
        />

        <button
          type="submit"
          disabled={(!imageFile && !message) || isUploading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2  rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
