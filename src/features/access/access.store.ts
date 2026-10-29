import { create } from 'zustand';
import { CampusId } from '../../domain/models/campus';
import { validateAccessCodeInput } from '../../domain/services/validation.service';

interface AccessState {
  currentCampusId: CampusId | null;
  currentCampusName: string | null;
  accessCode: string;
  isVerified: boolean;
  validationError: string | null;
  verifyCode: (code: string) => boolean;
  setCampusManually: (campusId: CampusId) => void;
  resetAccess: () => void;
}

export const useAccessStore = create<AccessState>((set) => ({
  currentCampusId: null,
  currentCampusName: null,
  accessCode: '',
  isVerified: false,
  validationError: null,

  verifyCode: (code: string) => {
    const result = validateAccessCodeInput(code);
    if (result.isValid && result.campusId) {
      set({
        currentCampusId: result.campusId,
        currentCampusName: result.campusName || null,
        accessCode: code.trim().toUpperCase(),
        isVerified: true,
        validationError: null,
      });
      return true;
    } else {
      set({
        validationError: result.errorMessage || 'Código no válido',
        isVerified: false,
      });
      return false;
    }
  },

  setCampusManually: (campusId: CampusId) => {
    set({
      currentCampusId: campusId,
      isVerified: true,
      validationError: null,
    });
  },

  resetAccess: () => {
    set({
      currentCampusId: null,
      currentCampusName: null,
      accessCode: '',
      isVerified: false,
      validationError: null,
    });
  },
}));
