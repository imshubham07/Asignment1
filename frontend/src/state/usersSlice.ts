import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export type UserDTO = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: string;
  popularityScore: number;
};

export type GraphResponse = { nodes: UserDTO[]; edges: { id: string; source: string; target: string }[] };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const fetchGraph = createAsyncThunk('users/fetchGraph', async () => {
  const { data } = await axios.get<GraphResponse>(`${API_URL}/api/graph`);
  return data;
});

export const createUser = createAsyncThunk('users/createUser', async (u: { username: string; age: number; hobbies: string[] }) => {
  const { data } = await axios.post<UserDTO>(`${API_URL}/api/users`, u);
  return data;
});

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, changes }: { id: string; changes: Partial<UserDTO> }) => {
  const { data } = await axios.put<UserDTO>(`${API_URL}/api/users/${id}`, changes);
  return data;
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id: string) => {
  await axios.delete(`${API_URL}/api/users/${id}`);
  return id;
});

export const linkUsers = createAsyncThunk('users/linkUsers', async ({ aId, bId }: { aId: string; bId: string }) => {
  const { data } = await axios.post<UserDTO>(`${API_URL}/api/users/${aId}/link`, { targetId: bId });
  return data;
});

export const unlinkUsers = createAsyncThunk('users/unlinkUsers', async ({ aId, bId }: { aId: string; bId: string }) => {
  const { data } = await axios.delete<UserDTO>(`${API_URL}/api/users/${aId}/unlink`, { data: { targetId: bId } });
  return data;
});

type State = {
  nodes: UserDTO[];
  edges: { id: string; source: string; target: string }[];
  hobbies: string[];
  loading: boolean;
  error?: string;
};

const initialState: State = { nodes: [], edges: [], hobbies: [], loading: false };

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setHobbies(state, action: PayloadAction<string[]>) {
      state.hobbies = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGraph.pending, state => { state.loading = true; state.error = undefined; })
      .addCase(fetchGraph.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload.nodes;
        state.edges = action.payload.edges;
        const all = new Set<string>();
        for (const n of action.payload.nodes) for (const h of n.hobbies) all.add(h);
        state.hobbies = Array.from(all).sort();
      })
      .addCase(fetchGraph.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.nodes.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.nodes.findIndex(n => n.id === action.payload.id);
        if (idx >= 0) state.nodes[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.nodes = state.nodes.filter(n => n.id !== action.payload);
        state.edges = state.edges.filter(e => e.source !== action.payload && e.target !== action.payload);
      })
      .addCase(linkUsers.fulfilled, (state, action) => {
        const idx = state.nodes.findIndex(n => n.id === action.payload.id);
        if (idx >= 0) state.nodes[idx] = action.payload;
      })
      .addCase(unlinkUsers.fulfilled, (state, action) => {
        const idx = state.nodes.findIndex(n => n.id === action.payload.id);
        if (idx >= 0) state.nodes[idx] = action.payload;
      });
  }
});

export const { setHobbies } = usersSlice.actions;
export default usersSlice.reducer;


