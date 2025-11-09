import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

type AgentState = null | "thinking" | "listening" | "talking";

export const VoiceAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>(null);

  const toggleAssistant = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setAgentState("listening");
    } else {
      setAgentState(null);
    }
  };

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
        <div className="relative">
          {/* Glow effect */}
          <div className={`absolute inset-0 transition-all duration-500 ${
            isActive 
              ? 'shadow-[0_0_60px_20px_hsl(var(--glow-primary)/0.3)]' 
              : 'shadow-[0_0_30px_10px_hsl(var(--glow-primary)/0.1)]'
          } rounded-full`} />
          
          {/* Orb placeholder - will be replaced with actual ElevenLabs Orb */}
          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
            isActive 
              ? 'bg-gradient-to-br from-primary/30 to-accent/30 scale-110' 
              : 'bg-gradient-to-br from-primary/10 to-accent/10'
          } backdrop-blur-sm border-2 ${
            isActive ? 'border-primary/50' : 'border-primary/20'
          }`}>
            {agentState === "listening" && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
            )}
            {agentState === "talking" && (
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" />
              </div>
            )}
            {agentState === "thinking" && (
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-4 rounded-full border-t-2 border-primary/50 animate-spin" />
              </div>
            )}
            
            {/* Replace this with: <Orb agentId="your-agent-id" /> */}
            <div className="text-6xl">
              {isActive ? "🎙️" : "💬"}
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="h-8">
          {agentState && (
            <p className="text-lg text-foreground/80 capitalize animate-in fade-in duration-300">
              {agentState === "listening" && "Listening..."}
              {agentState === "thinking" && "Processing..."}
              {agentState === "talking" && "Speaking..."}
            </p>
          )}
        </div>

        {/* Control button */}
        <Button
          onClick={toggleAssistant}
          size="lg"
          className={`gap-2 px-8 py-6 text-lg transition-all duration-300 ${
            isActive 
              ? 'bg-destructive hover:bg-destructive/90' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isActive ? (
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
        {!isActive && (
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
