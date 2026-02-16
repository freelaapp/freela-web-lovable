import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, ChevronLeft, Phone, MoreVertical, Star } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const mockConversations = [
  { id: 1, name: "Carlos Silva", role: "Churrasqueiro", avatar: "CS", lastMsg: "Tudo certo! Levo todo o equipamento.", time: "10:32", unread: 2, online: true },
  { id: 2, name: "Juliana Alves", role: "Bartender", avatar: "JA", lastMsg: "Quantos drinks estão previstos?", time: "Ontem", unread: 0, online: false },
  { id: 3, name: "Pedro Lima", role: "Garçom", avatar: "PL", lastMsg: "Posso chegar 1h antes para montar.", time: "Seg", unread: 0, online: true },
];

const mockMessages = [
  { id: 1, from: "them", text: "Olá! Vi que você precisa de um churrasqueiro para o dia 22. Confirmo interesse!", time: "09:15" },
  { id: 2, from: "me", text: "Oi Carlos! Que bom! Seria para 80 pessoas, tudo bem?", time: "09:18" },
  { id: 3, from: "them", text: "Perfeito! Já fiz vários eventos desse porte. Posso incluir espetinhos e linguiça artesanal no cardápio.", time: "09:22" },
  { id: 4, from: "me", text: "Adorei! Preciso que chegue umas 2h antes. Pode ser?", time: "10:05" },
  { id: 5, from: "them", text: "Tudo certo! Levo todo o equipamento.", time: "10:32" },
];

const Mensagens = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selected = mockConversations.find((c) => c.id === selectedChat);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  // Chat view (mobile shows one at a time)
  if (selectedChat && selected) {
    return (
      <AppLayout showHeader={false} showFooter={false} showBottomNav={false}>
        {/* Chat Header */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-3 h-14 px-4">
            <button onClick={() => setSelectedChat(null)} className="p-1 -ml-1 lg:hidden">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {selected.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{selected.name}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                {selected.online && <span className="w-1.5 h-1.5 bg-success rounded-full" />}
                {selected.online ? "Online" : "Offline"} • {selected.role}
              </p>
            </div>
            <button className="p-2 text-muted-foreground">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[calc(100vh-128px)]">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.from === "me"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-lg border-t border-border p-3">
          <div className="flex gap-2 items-center">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 h-11 rounded-full"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" className="rounded-full w-11 h-11 shrink-0" onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Conversations List
  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-3xl mx-auto pb-8">
        <h1 className="text-2xl font-display font-bold mb-4">Mensagens</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-10 rounded-full h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Conversations */}
        <div className="space-y-1">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedChat(conv.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {conv.avatar}
                </div>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold truncate">{conv.name}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMsg}</p>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-primary rounded-full text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 ml-2">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Mensagens;
