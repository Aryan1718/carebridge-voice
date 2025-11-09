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
          {/* Outer glow rings */}
          <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
            agentState === "talking"
              ? 'animate-pulse shadow-[0_0_60px_rgba(135,206,235,0.6)]'
              : agentState === "listening"
              ? 'shadow-[0_0_40px_rgba(152,186,163,0.5)]'
              : 'shadow-[0_0_20px_rgba(255,253,208,0.3)]'
          }`} />
          
          {/* Main orb container */}
          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
            isConnected 
              ? 'bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-xl scale-110' 
              : 'bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm'
          } border ${
            isConnected ? 'border-primary/40' : 'border-primary/20'
          } shadow-2xl`}>
            
            {/* Listening state - expanding ring */}
            {agentState === "listening" && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-secondary/50 animate-ping" />
                <div className="absolute inset-4 rounded-full border border-secondary/30 animate-pulse" />
              </>
            )}
            
            {/* Talking state - multiple pulsing layers */}
            {agentState === "talking" && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                <div className="absolute inset-3 rounded-full bg-accent/20 animate-pulse" style={{ animationDelay: '0.15s' }} />
                <div className="absolute inset-6 rounded-full bg-secondary/20 animate-pulse" style={{ animationDelay: '0.3s' }} />
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
