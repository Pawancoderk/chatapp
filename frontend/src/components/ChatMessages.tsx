import { Message } from "@/app/chat/page";
import { User } from "@/context/Appcontext";
import React, { useEffect, useMemo, useRef } from "react";
import moment from "moment";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessageProp {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

const ChatMessages = ({
  selectedUser,
  messages,
  loggedInUser,
}: ChatMessageProp) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  // seen feature

  const uniqueMessage = useMemo(() => {
    if (!messages) return [];
    const seen = new Set();
    return messages.filter((message) => {
      if (seen.has(message._id)) return false;

      seen.add(message._id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, uniqueMessage]);
  return (
    <div className="flex-1 overflow-hidden ">
      <div className="h-full overflow-y-auto max-h-[calc(100vh-215px)] p-2 space-y-2 custom-scroll">
        {!selectedUser ? (
          <p className="text-gray-400 text-center mt-20">
            Please select a user to start chatting 📩
          </p>
        ) : (
          <>
            {uniqueMessage.map((e, i) => {
              const isSentByMe = e.sender === loggedInUser?._id;
              const uniqueKey = `${e._id} - ${i} `;

              return (
                <div
                  className={`flex flex-col gap-1 mt-2 ${
                    isSentByMe ? "items-end" : "items-start"
                  }`} key={uniqueKey}
                >
                  <div
                    className={`rounded-lg p-3 max-w-sm${
                      isSentByMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {e.messageType === "image" && e.image && (
                      <div className="relative group">
                        <img
                          src={e.image.url}
                          alt="shared image"
                          className="max-w-full rounded-lg h-auto"
                        />
                      </div>
                    )}
                    {e.text && <p className="">{e.text}</p>}
                  </div>
                  <div
                    className={`flex items-center gap-1  text-xs text-gray-400 ${
                      isSentByMe ? "pr-2 flex-row-reverse " : " pl-2"
                    }`}
                  >
                    <span>{moment(e.createdAt).format("hh:mm A . MMM D")}</span>
                    {isSentByMe && (
                      <div className="flex items-center ml-1">
                        {e.seen ? (
                          <div className="flex items-cente gap-1 text-blue-700 ">
                            <CheckCheck className="h-3 w-3" />
                            {e.seenAt && (
                              <span>{moment(e.seenAt).format("hh:mm A")}</span>
                            )}
                          </div>
                        ) : (
                         <Check className="w-3 h-3 text-gray-500"/>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
