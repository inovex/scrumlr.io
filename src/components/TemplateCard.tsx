import React from 'react';
import { Template } from '../types/state';
import Button from '@material-ui/core/Button';
import WithId from '../util/withId';

export interface TemplateCardProps {
    template: WithId<Template>;
    onSelect?: () => void;
    disabled?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, disabled }) => {
    return (
        <div>
            <p>{template.name}</p>
            <p>isFeatured: {template.featured ? 'yes' : 'no'}</p>
            <Button onClick={onSelect} disabled={disabled}>
                Select
            </Button>
        </div>
    );
};
