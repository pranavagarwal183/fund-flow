import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { createClient } from "@/integrations/supabase/client";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
};

export function FundBotWidget(): JSX.Element {
  const isMobile = useMobile();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "bot",
      content:
        "Hey there! I'm FundBot, your assistant for Indian mutual funds. Ask me anything, or say 'recommend' and I can suggest funds based on your goals. 🚀",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    // small delay to allow dialog to render
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setInput("");

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { data, error } = await supabase.functions.invoke("fundbot-chat", {
        body: { message: text },
      });

      if (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "bot",
            content: `Sorry, an error occurred: ${error.message}`,
          },
        ]);
      } else {
        const reply = (data && (data as any).reply) || (data && (data as any).error) || "No response.";
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "bot",
            content: String(reply),
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          content: "Failed to connect to FundBot. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 50);
    }
  }, [input, isSending, supabase]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Floating circular button
  const TriggerButton = (
    <Button
      onClick={() => handleOpenChange(true)}
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:opacity-90"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M2 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 01-4.9-1.274L4 21l.958-3.594A9.96 9.96 0 012 12z" />
      </svg>
      <span className="sr-only">Open FundBot</span>
    </Button>
  );

  const ChatContent = (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <p className="text-lg font-semibold">🤖 FundBot</p>
        <p className="text-xs text-muted-foreground">Ask about Indian mutual funds</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as any}>
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[75%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[75%] rounded-2xl bg-muted px-4 py-2 text-sm"
                }
              >
                {m.content}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 border-t p-3">
          <Input
            placeholder="Ask about Indian mutual funds..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isSending}
          />
          <Button onClick={sendMessage} disabled={isSending}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {TriggerButton}
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent side="bottom" className="h-[75vh] p-0">
            {ChatContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      {TriggerButton}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>FundBot</DialogTitle>
          </DialogHeader>
          {ChatContent}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FundBotWidget;


