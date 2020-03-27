import React from 'react';
import { Template } from '../types/state';
import Button from '@material-ui/core/Button';

export interface TemplateCardProps extends Template {
    id: string;
    onStart?: () => void;
    disabled?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ id, name, featured, onStart, disabled }) => {
    return (
        <div>
            <p>{name}</p>
            <p>isFeatured: {featured ? 'yes' : 'no'}</p>
            <Button onClick={onStart} disabled={disabled}>
                Start board
            </Button>
        </div>
    );
};
