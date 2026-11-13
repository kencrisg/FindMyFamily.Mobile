import React, { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react-native';
import { CustomInput } from '../../../../shared/presentation/components/CustomInput';
import { FormModal } from '../../../../shared/presentation/components/FormModal';
import { SegmentedControl } from '../../../../shared/presentation/components/SegmentedControl';
import { validatePhone } from '../../../../shared/domain/validation';
import { useTheme } from '../../../../shared/theme/use-theme';
import { FamilyRole } from '../../domain/entities/family.types';
import { FAMILY_ROLE_OPTIONS } from './family-roles';

interface LinkMemberModalProps {
  visible: boolean;
  familyName: string;
  onSubmit: (phoneNumber: string, role: FamilyRole) => Promise<string | null>;
  onClose: () => void;
}

/**
 * Añade a una familia una cuenta que ya existe (solo super admin). Es el caso de alguien
 * que pertenece a dos familias: por ejemplo, un hijo que está en la de sus padres y en la
 * suya propia.
 */
export const LinkMemberModal: React.FC<LinkMemberModalProps> = ({
  visible,
  familyName,
  onSubmit,
  onClose,
}) => {
  const { colors } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<FamilyRole>('member');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPhoneNumber('');
    setRole('member');
    setError(null);
  }, [visible]);

  const handleSubmit = async () => {
    const validationError = validatePhone(phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const serverError = await onSubmit(phoneNumber.trim(), role);
    setSubmitting(false);

    if (serverError) {
      setError(serverError);
    } else {
      onClose();
    }
  };

  return (
    <FormModal
      visible={visible}
      title="Vincular cuenta existente"
      icon={<Link2 size={24} color={colors.primary} />}
      description={`Añade a ${familyName} a alguien que ya tiene cuenta, buscándolo por su teléfono. Seguirá perteneciendo a sus otras familias.`}
      error={error}
      submitLabel="Vincular a la familia"
      loading={submitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <CustomInput
        label="Teléfono de la cuenta"
        placeholder="Ej: 0981234567"
        value={phoneNumber}
        onChangeText={(value) => {
          setPhoneNumber(value);
          setError(null);
        }}
        keyboardType="phone-pad"
      />
      <SegmentedControl label="Rol en la familia" options={FAMILY_ROLE_OPTIONS} value={role} onChange={setRole} />
    </FormModal>
  );
};
