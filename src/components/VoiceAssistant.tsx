import { useEffect, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Orb, AgentState } from "@/components/ui/orb";
import { Mic, MicOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Organization {
  name: string;
  description: string;
  contact?: string;
  location?: string;
  services?: string;
  hours?: string;
  address?: string;
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
        
        // Look for patterns where organizations are mentioned
        // Multiple patterns to catch different phrasings
        const patterns = [
          /(?:here are (?:a few )?(?:nearby )?)?resources.*?help:\s*([^.?!]+)/gi,
          /(?:organizations|resources).*?(?:help|available|assist):\s*([^.?!]+)/gi,
          /(?:including|such as|like):\s*([^.?!]+)/gi
        ];
        
        const allOrgNames = new Set<string>();
        
        // Try all patterns
        patterns.forEach(pattern => {
          const matches = [...conversationText.matchAll(pattern)];
          matches.forEach(match => {
            if (match[1]) {
              // Split by comma, "and", "or"
              const names = match[1]
                .split(/,|\band\b|\bor\b/gi)
                .map(name => name.trim())
                .filter(name => name.length > 0);
              names.forEach(name => allOrgNames.add(name));
            }
          });
        });
        
        if (allOrgNames.size > 0) {
          const orgNames = Array.from(allOrgNames);
          
          const parsedOrgs = orgNames.map(name => {
            const cleanName = name.replace(/\([^)]*\)/g, '').trim();
            
            // Create detailed information based on organization name
            let description = 'Community support organization';
            let services = 'Food assistance, case management, and resource referrals';
            let contact = 'Contact through CareBridge referral system';
            let address = 'San Francisco, CA';
            let hours = 'Hours vary - contact for details';
            
            // Customize based on known organizations
            if (cleanName.toLowerCase().includes('glide')) {
              description = 'GLIDE Memorial Church provides comprehensive support services';
              services = 'Daily meals, housing support, health services, family programs, and case management';
              address = '330 Ellis St, San Francisco, CA 94102';
              hours = 'Mon-Fri: 7:30 AM - 4:30 PM';
            } else if (cleanName.toLowerCase().includes('anthony')) {
              description = 'St. Anthony Foundation serves the poor and homeless';
              services = 'Free dining room, clothing, medical care, technology lab, and social services';
              address = '121 Golden Gate Ave, San Francisco, CA 94102';
              hours = 'Daily meals served, various program hours';
            } else if (cleanName.toLowerCase().includes('food bank')) {
              description = 'San Francisco-Marin Food Bank fights hunger';
              services = 'Food pantries, groceries, nutrition education, CalFresh enrollment';
              address = 'Multiple distribution sites throughout SF';
              hours = 'Varies by location';
            } else if (cleanName.toLowerCase().includes('cityteam')) {
              description = 'CityTeam provides emergency services and recovery programs';
              services = 'Emergency shelter, meals, addiction recovery, job training';
              address = '164 6th St, San Francisco, CA 94103';
              hours = '24/7 emergency services';
            }
            
            return {
              name: cleanName,
              description,
              services,
              contact,
              location: 'San Francisco, CA',
              address,
              hours
            };
          });
          
          console.log("Parsed organizations:", parsedOrgs);
          setOrganizations(parsedOrgs);
        }
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
                  <CardDescription className="flex items-center gap-1 text-sm">
                    📍 {org.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">About</p>
                    <p className="text-sm text-foreground/80">{org.description}</p>
                  </div>
                  
                  {org.services && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Services</p>
                      <p className="text-sm text-foreground/80">{org.services}</p>
                    </div>
                  )}
                  
                  {org.address && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Address</p>
                      <p className="text-sm text-foreground/80">{org.address}</p>
                    </div>
                  )}
                  
                  {org.hours && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Hours</p>
                      <p className="text-sm text-foreground/80">{org.hours}</p>
                    </div>
                  )}
                  
                  {org.contact && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        📞 {org.contact}
                      </p>
                    </div>
                  )}
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
