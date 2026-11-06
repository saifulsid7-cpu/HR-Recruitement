/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JobRequisition } from '../types';
import { JobRequisitionFormModal } from './JobRequisitionFormModal';

interface EditPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: JobRequisition | null;
  onSave: (updated: JobRequisition) => void;
}

export const EditPositionModal: React.FC<EditPositionModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onSave,
}) => {
  return (
    <JobRequisitionFormModal
      isOpen={isOpen}
      mode="edit"
      initialRequisition={requisition}
      onClose={onClose}
      onSubmit={onSave}
    />
  );
};
