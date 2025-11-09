import { useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

export const VoiceAssistant = () => {
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onMessage: (message) => {
      console.log("Message received:", message);
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
        await conversation.startSession({
          agentId: "agent_2501k9jkm33getbbgxtk7pkmpxnk",
        });
      } catch (error) {
        console.error("Failed to start conversation:", error);
      }
    }
  };

  const getAgentState = () => {
    if (!isConnected) return null;
    if (isSpeaking) return "talking";
    return "listening";
  };

  const agentState = getAgentState();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-voice relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Voice Assistant
          </h1>
          <p className="text-xl text-muted-foreground">
            Your AI-powered conversational companion
          </p>
        </div>

        {/* Orb Container */}
        <div className="relative flex items-center justify-center w-64 h-64">
          {/* Glow effect */}
          <div className={`absolute inset-0 transition-all duration-500 ${
            agentState === "talking"
              ? 'shadow-[0_0_80px_30px_hsl(var(--glow-primary)/0.4)]' 
              : agentState === "listening"
              ? 'shadow-[0_0_60px_20px_hsl(var(--glow-accent)/0.3)]'
              : 'shadow-[0_0_40px_15px_hsl(var(--glow-primary)/0.1)]'
          } rounded-full`} />
          
          {/* Animated Orb Visualization */}
          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
            isConnected 
              ? 'bg-gradient-to-br from-primary/30 to-accent/30 scale-110' 
              : 'bg-gradient-to-br from-primary/10 to-accent/10'
          } backdrop-blur-sm border-2 ${
            isConnected ? 'border-primary/50' : 'border-primary/20'
          }`}>
            {agentState === "listening" && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
            )}
            {agentState === "talking" && (
              <>
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </>
            )}
            
            {/* Orb icon */}
            <div className="text-6xl z-10">
              {isConnected ? (isSpeaking ? "🗣️" : "🎙️") : "💬"}
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
