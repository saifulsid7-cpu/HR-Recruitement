/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JobRequisition } from '../types';
import { JobRequisitionFormModal } from './JobRequisitionFormModal';

interface NewRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRequisition: (req: JobRequisition) => void;
  templateRequisition?: JobRequisition | null;
  departments?: string[];
  existingRequisitionsCount?: number;
}

export const NewRequisitionModal: React.FC<NewRequisitionModalProps> = ({
  isOpen,
  onClose,
  onCreateRequisition,
  templateRequisition,
}) => {
  return (
    <JobRequisitionFormModal
      isOpen={isOpen}
      mode="create"
      initialRequisition={templateRequisition}
      onClose={onClose}
      onSubmit={onCreateRequisition}
    />
  );
};
