import { useEffect, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Orb, AgentState } from "@/components/ui/orb";
import { Mic, MicOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import organizationsData from "@/data/sf_homeless_services.json";

interface Organization {
  name: string;
  keywords: string[];
  contact: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    [key: string]: string | undefined;
  };
}

export const VoiceAssistant = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [conversationText, setConversationText] = useState<string>("");

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      
      // Parse organizations from the complete conversation when it ends
      if (conversationText) {
        console.log("Full conversation text:", conversationText);
        
        // Match organizations mentioned in conversation against our JSON database
        const matchedOrgs: Organization[] = [];
        
        organizationsData.forEach((org) => {
          // Check if organization name is mentioned (case-insensitive, fuzzy match)
          const orgNameLower = org.name.toLowerCase();
          const conversationLower = conversationText.toLowerCase();
          
          // Match full name or significant parts of name
          const nameVariations = [
            orgNameLower,
            ...orgNameLower.split(/\s+/), // individual words
            ...org.keywords.map(k => k.toLowerCase().replace(/-/g, ' '))
          ];
          
          const isMatch = nameVariations.some(variation => {
            if (variation.length > 3) { // Only check meaningful words
              return conversationLower.includes(variation);
            }
            return false;
          });
          
          if (isMatch) {
            matchedOrgs.push(org);
          }
        });
        
        console.log("Matched organizations:", matchedOrgs);
        setOrganizations(matchedOrgs);
      }
    },
    onMessage: (message: any) => {
      console.log("Message received:", message);
      
      // Accumulate all conversation messages
      if (message && typeof message === 'object') {
        const messageText = message.message;
        const source = message.source;
        
        if (messageText && typeof messageText === 'string' && source) {
          const speaker = source === 'ai' ? 'Assistant' : 'User';
          console.log(`Capturing message from ${speaker}:`, messageText.substring(0, 50));
          setConversationText(prev => prev + `\n${speaker}: ${messageText}`);
        }
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
        setOrganizations([]); // Clear previous results
        setConversationText(""); // Clear previous conversation
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

        {/* Conversation Transcript - Only show after conversation ends */}
        {!isConnected && status !== "connecting" && conversationText && (
          <div className="mt-8 w-full max-w-4xl animate-in fade-in duration-500">
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Conversation Transcript</CardTitle>
                <CardDescription>Full record of your conversation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-4 p-4 bg-background/50 rounded-lg">
                  {conversationText.split('\n').filter(line => line.trim()).map((line, idx) => {
                    const isAssistant = line.startsWith('Assistant:');
                    const isUser = line.startsWith('User:');
                    const text = line.replace(/^(Assistant:|User:)\s*/, '');
                    
                    return (
                      <div 
                        key={idx} 
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-lg ${
                            isAssistant 
                              ? 'bg-primary/10 text-foreground' 
                              : 'bg-secondary/10 text-foreground'
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {isAssistant ? 'Assistant' : 'You'}
                          </p>
                          <p className="text-sm">{text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Organization Cards - Only show after conversation ends */}
        {!isConnected && status !== "connecting" && organizations.length > 0 && (
          <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
            <div className="col-span-full mb-4">
              <h2 className="text-2xl font-semibold text-center">Organizations Found</h2>
              <p className="text-center text-muted-foreground mt-2">Here are the organizations from your conversation</p>
            </div>
            {organizations.map((org, idx) => (
              <Card key={idx} className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-primary">{org.name}</CardTitle>
                  <CardDescription className="flex flex-wrap gap-1 mt-2">
                    {org.keywords.slice(0, 4).map((keyword, kidx) => (
                      <span key={kidx} className="text-xs bg-secondary/20 px-2 py-1 rounded-full">
                        {keyword.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {org.contact.address && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">📍 Address</p>
                      <p className="text-sm text-foreground/80">{org.contact.address}</p>
                    </div>
                  )}
                  
                  {org.contact.phone && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">📞 Phone</p>
                      <p className="text-sm text-foreground/80">{org.contact.phone}</p>
                    </div>
                  )}
                  
                  {org.contact.email && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">✉️ Email</p>
                      <p className="text-sm text-foreground/80 break-all">{org.contact.email}</p>
                    </div>
                  )}
                  
                  {org.contact.website && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">🌐 Website</p>
                      <a 
                        href={org.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {org.contact.website}
                      </a>
                    </div>
                  )}
                  
                  {/* Display any additional contact fields */}
                  {Object.entries(org.contact).map(([key, value]) => {
                    if (!['address', 'phone', 'email', 'website'].includes(key) && value) {
                      return (
                        <div key={key}>
                          <p className="text-sm font-semibold text-foreground mb-1 capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-foreground/80">{value}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </CardContent>
              </Card>
            ))}
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
