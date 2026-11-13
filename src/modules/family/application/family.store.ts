import { create } from 'zustand';
import { familyRepository } from '../infrastructure/family-api.repository';
import { Family, FamilyDetail, FamilyMemberSummary } from '../domain/entities/family.types';
import { getApiErrorMessage } from '../../../shared/presentation/utils/api-error';

/**
 * Familia que se muestra en el mapa y miembro seleccionado. La gestión de miembros (crear,
 * editar, quitar...) vive en `useFamilyManagement`, que avisa a este store tras cada cambio.
 */
interface FamilyState {
  families: Family[];
  activeFamily: FamilyDetail | null;
  selectedMember: FamilyMemberSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchFamilies: () => Promise<void>;
  selectFamily: (familyId: string) => Promise<void>;
  setSelectedMember: (member: FamilyMemberSummary | null) => void;
  /** Vacía el estado al cerrar sesión, para que la siguiente cuenta no vea la familia anterior. */
  reset: () => void;
  clearError: () => void;
}

const INITIAL_STATE = {
  families: [],
  activeFamily: null,
  selectedMember: null,
  isLoading: false,
  error: null,
};

export const useFamilyStore = create<FamilyState>((set, get) => ({
  ...INITIAL_STATE,

  fetchFamilies: async () => {
    set({ isLoading: true, error: null });
    try {
      const families = await familyRepository.getMyFamilies();
      set({ families });

      if (families.length === 0) {
        set({ activeFamily: null, isLoading: false });
        return;
      }

      // Se conserva la familia activa si sigue existiendo; si no (p. ej. le sacaron de
      // ella), se pasa a la primera.
      const currentId = get().activeFamily?.id;
      const targetId = families.some((f) => f.id === currentId) ? currentId! : families[0].id;
      await get().selectFamily(targetId);
    } catch (err: unknown) {
      set({
        error: getApiErrorMessage(err, 'Error al cargar grupos familiares.'),
        isLoading: false,
      });
    }
  },

  selectFamily: async (familyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await familyRepository.getFamilyById(familyId);
      const selected = get().selectedMember;
      set({
        activeFamily: detail,
        // Si el miembro seleccionado ya no está en la familia, se deselecciona.
        selectedMember:
          selected && detail.members.some((m) => m.userId === selected.userId) ? selected : null,
        isLoading: false,
      });
    } catch (err: unknown) {
      set({
        error: getApiErrorMessage(err, 'Error al cargar detalles de la familia.'),
        isLoading: false,
      });
    }
  },

  setSelectedMember: (member: FamilyMemberSummary | null) => {
    set({ selectedMember: member });
  },

  reset: () => set(INITIAL_STATE),

  clearError: () => set({ error: null }),
}));
