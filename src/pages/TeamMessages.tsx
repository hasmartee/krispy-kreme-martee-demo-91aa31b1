import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, AlertTriangle, Package, Wrench, Trash2, FileText, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface TeamMessage {
  id: string;
  store_id: string | null;
  user_id: string;
  message_type: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  stores?: {
    name: string;
  };
}

const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case 'equipment': return Wrench;
    case 'delivery': return Package;
    case 'contamination': return AlertTriangle;
    case 'issue': return AlertTriangle;
    case 'observation': return FileText;
    default: return MessageSquare;
  }
};

const getMessageTypeColor = (type: string) => {
  switch (type) {
    case 'equipment': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'delivery': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'contamination': return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'issue': return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'observation': return 'bg-green-500/10 text-green-600 border-green-500/20';
    default: return 'bg-muted/50 text-muted-foreground border-muted';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'secondary';
  }
};

export default function TeamMessages() {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_messages')
        .select(`
          *,
          stores (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('team_messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message status updated",
      });

      fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return msg.status === 'new';
    if (activeTab === 'in_progress') return msg.status === 'in_progress';
    if (activeTab === 'resolved') return msg.status === 'resolved';
    return true;
  });

  const newCount = messages.filter(m => m.status === 'new').length;
  const inProgressCount = messages.filter(m => m.status === 'in_progress').length;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team Messages</h1>
        <p className="text-muted-foreground">
          Messages and reports from store teams and production
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Messages</TabsTrigger>
          <TabsTrigger value="new">
            New {newCount > 0 && <Badge variant="destructive" className="ml-2">{newCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress {inProgressCount > 0 && <Badge variant="default" className="ml-2">{inProgressCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">Loading messages...</p>
              </CardContent>
            </Card>
          ) : filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">No messages to display</p>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map((message) => {
              const Icon = getMessageTypeIcon(message.message_type);
              const typeColor = getMessageTypeColor(message.message_type);
              
              return (
                <Card key={message.id} className={`border-l-4 ${
                  message.priority === 'high' 
                    ? 'border-l-destructive' 
                    : message.priority === 'medium'
                    ? 'border-l-amber-500'
                    : 'border-l-muted'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${typeColor}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{message.subject}</CardTitle>
                            <Badge variant={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {message.message_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">
                              {message.stores?.name || 'Central Production'}
                            </span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={message.status === 'resolved' ? 'secondary' : 'default'}
                        className="capitalize"
                      >
                        {message.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-4 whitespace-pre-wrap">{message.message}</p>
                    <div className="flex gap-2">
                      {message.status === 'new' && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => updateMessageStatus(message.id, 'in_progress')}
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {message.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => updateMessageStatus(message.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {message.status === 'resolved' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateMessageStatus(message.id, 'new')}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
