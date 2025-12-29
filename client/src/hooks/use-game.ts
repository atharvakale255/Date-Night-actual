import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertResponseSchema, type JoinRoomRequest, type CreateRoomRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Helper to manage local session
const STORAGE_KEY = 'couple_game_session';

interface Session {
  playerId: number;
  roomCode: string;
  name: string;
}

export function useSession() {
  const getSession = (): Session | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  };

  const setSession = (session: Session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { getSession, setSession, clearSession };
}

// === HOOKS ===

export function useCreateRoom() {
  const { setSession } = useSession();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateRoomRequest) => {
      const res = await fetch(api.rooms.create.path, {
        method: api.rooms.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create room');
      return api.rooms.create.responses[201].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      setSession({ playerId: data.playerId, roomCode: data.roomCode, name: variables.name });
      setLocation(`/room/${data.roomCode}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not create room. Try again!", variant: "destructive" });
    }
  });
}

export function useJoinRoom() {
  const { setSession } = useSession();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: JoinRoomRequest) => {
      const res = await fetch(api.rooms.join.path, {
        method: api.rooms.join.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error('Room not found');
        throw new Error('Failed to join');
      }
      return api.rooms.join.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      setSession({ playerId: data.playerId, roomCode: variables.code, name: variables.name });
      setLocation(`/room/${variables.code}`);
    },
    onError: (error) => {
      toast({ title: "Oops!", description: error.message, variant: "destructive" });
    }
  });
}

export function useRoomStatus(code: string) {
  return useQuery({
    queryKey: [api.rooms.status.path, code],
    queryFn: async () => {
      const url = buildUrl(api.rooms.status.path, { code });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch status');
      return api.rooms.status.responses[200].parse(await res.json());
    },
    refetchInterval: 2000, // Poll every 2s
    enabled: !!code,
  });
}

export function useNextPhase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ code, phase, round }: { code: string; phase?: string; round?: number }) => {
      const url = buildUrl(api.rooms.nextPhase.path, { code });
      const res = await fetch(url, { 
        method: api.rooms.nextPhase.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, round })
      });
      if (!res.ok) throw new Error('Failed to update phase');
      return api.rooms.nextPhase.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.rooms.status.path, variables.code] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not proceed", variant: "destructive" });
    }
  });
}

export function useSubmitResponse() {
  const queryClient = useQueryClient();
  const { getSession } = useSession();

  return useMutation({
    mutationFn: async (data: { roomId: number; questionId: number; answer: string }) => {
      const session = getSession();
      if (!session) throw new Error("No session");

      const payload = {
        roomId: data.roomId,
        playerId: session.playerId,
        questionId: data.questionId,
        answer: data.answer,
      };

      const validated = insertResponseSchema.parse(payload);
      
      const res = await fetch(api.responses.submit.path, {
        method: api.responses.submit.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) throw new Error('Failed to submit answer');
      return api.responses.submit.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // We don't have code here easily, but standard invalidation works if we knew the code.
      // Since polling is active, this is less critical, but good for snappy UI.
      queryClient.invalidateQueries({ queryKey: [api.rooms.status.path] });
    }
  });
}
