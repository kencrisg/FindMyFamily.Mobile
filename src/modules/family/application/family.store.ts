import { create } from 'zustand';
import { familyRepository } from '../infrastructure/family-api.repository';
import { Family, FamilyDetail, FamilyMemberSummary } from '../domain/entities/family.types';

interface FamilyState {
  families: Family[];
  activeFamily: FamilyDetail | null;
  selectedMember: FamilyMemberSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchFamilies: () => Promise<void>;
  selectFamily: (familyId: string) => Promise<void>;
  createFamily: (name: string) => Promise<boolean>;
  addMember: (phoneNumber: string) => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
  setSelectedMember: (member: FamilyMemberSummary | null) => void;
  clearError: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  families: [],
  activeFamily: null,
  selectedMember: null,
  isLoading: false,
  error: null,

  fetchFamilies: async () => {
    set({ isLoading: true, error: null });
    try {
      const families = await familyRepository.getMyFamilies();
      set({ families });

      // Automatically select first family if available and none selected
      if (families.length > 0) {
        const currentActive = get().activeFamily;
        const targetId = currentActive?.id || families[0].id;
        await get().selectFamily(targetId);
      } else {
        set({ activeFamily: null, isLoading: false });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({
        error: axiosErr.response?.data?.message || 'Error al cargar grupos familiares.',
        isLoading: false,
      });
    }
  },

  selectFamily: async (familyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await familyRepository.getFamilyById(familyId);
      set({ activeFamily: detail, isLoading: false });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({
        error: axiosErr.response?.data?.message || 'Error al cargar detalles de la familia.',
        isLoading: false,
      });
    }
  },

  createFamily: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const newFamily = await familyRepository.createFamily({ name });
      await get().fetchFamilies();
      await get().selectFamily(newFamily.id);
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({
        error: axiosErr.response?.data?.message || 'Error al crear el grupo familiar.',
        isLoading: false,
      });
      return false;
    }
  },

  addMember: async (phoneNumber: string) => {
    const active = get().activeFamily;
    if (!active) return false;

    set({ isLoading: true, error: null });
    try {
      const updated = await familyRepository.addMember(active.id, { phoneNumber });
      set({ activeFamily: updated, isLoading: false });
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({
        error: axiosErr.response?.data?.message || 'No se pudo agregar al familiar.',
        isLoading: false,
      });
      return false;
    }
  },

  removeMember: async (userId: string) => {
    const active = get().activeFamily;
    if (!active) return false;

    set({ isLoading: true, error: null });
    try {
      await familyRepository.removeMember(active.id, userId);
      await get().selectFamily(active.id);
      if (get().selectedMember?.userId === userId) {
        set({ selectedMember: null });
      }
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({
        error: axiosErr.response?.data?.message || 'Error al remover al miembro.',
        isLoading: false,
      });
      return false;
    }
  },

  setSelectedMember: (member: FamilyMemberSummary | null) => {
    set({ selectedMember: member });
  },

  clearError: () => set({ error: null }),
}));
