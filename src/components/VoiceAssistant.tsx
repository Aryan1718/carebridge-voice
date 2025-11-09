import { useEffect, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Orb, AgentState } from "@/components/ui/orb";
import { Mic, MicOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export const VoiceAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setMessages([]);
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      
      // The message structure is { message: string; source: Role }
      if (message.message && typeof message.message === 'string') {
        const role = message.source === 'user' ? 'user' : 'assistant';
        setMessages(prev => [...prev, { role, text: message.message }]);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
    },
  });

  const { status, isSpeaking } = conversation;
  const isConnected = status === "connected";

  useEffect(() => {
    // Request microphone permission on component mount
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.error("Microphone access denied:", error);
      }
    };
    requestMicPermission();
  }, []);

  const toggleConversation = async () => {
    if (isConnected) {
      await conversation.endSession();
    } else {
      try {
        // For now, using the agent ID directly as it's a public agent
        // The connection type should be specified
        await conversation.startSession({
          agentId: "agent_2501k9jkm33getbbgxtk7pkmpxnk",
        } as any);
      } catch (error) {
        console.error("Failed to start conversation:", error);
      }
    }
  };

  const getAgentState = (): AgentState => {
    if (!isConnected) return null;
    if (isSpeaking) return "talking";
    return "listening";
  };

  const agentState = getAgentState();

  // Colors for different states
  const orbColors: [string, string] = 
    agentState === "talking" 
      ? ["#FF6B6B", "#F6E7D8"] 
      : agentState === "listening"
      ? ["#4ECDC4", "#A0E7E5"]
      : ["#CADCFC", "#A0B9D1"];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-voice relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            CareBridge
          </h1>
          <p className="text-xl text-muted-foreground">
            Connecting you to care, kindness, and community
          </p>
        </div>

        {/* Orb Container */}
        <div className="relative flex items-center justify-center w-64 h-64">
          <div className="relative h-48 w-48 rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]">
            <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)]">
              <Orb colors={orbColors} seed={1000} agentState={agentState} />
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="h-8">
          {agentState && (
            <p className="text-lg text-foreground/80 capitalize animate-in fade-in duration-300">
              {agentState === "listening" && "Listening..."}
              {agentState === "talking" && "Speaking..."}
            </p>
          )}
          {!isConnected && status === "connecting" && (
            <p className="text-lg text-muted-foreground animate-pulse">
              Connecting...
            </p>
          )}
        </div>

        {/* Control button */}
        <Button
          onClick={toggleConversation}
          size="lg"
          disabled={status === "connecting"}
          className={`gap-2 px-8 py-6 text-lg transition-all duration-300 ${
            isConnected 
              ? 'bg-destructive hover:bg-destructive/90' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isConnected ? (
            <>
              <MicOff className="w-5 h-5" />
              End Conversation
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Conversation
            </>
          )}
        </Button>

        {/* Conversation Transcript */}
        {messages.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border max-w-2xl w-full animate-in fade-in duration-500">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Conversation</h3>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary/10 ml-auto max-w-[80%]"
                        : "bg-secondary/10 mr-auto max-w-[80%]"
                    }`}
                  >
                    <p className="text-xs font-medium mb-1 text-muted-foreground capitalize">
                      {msg.role}
                    </p>
                    <p className="text-sm text-foreground">{msg.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Info card */}
        {!isConnected && status !== "connecting" && (
          <div className="mt-8 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border max-w-md animate-in fade-in duration-500">
            <p className="text-sm text-muted-foreground">
              Click the button above to start a conversation with your AI voice assistant. 
              Make sure to allow microphone access when prompted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
