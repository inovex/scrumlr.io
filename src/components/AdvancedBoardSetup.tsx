import React from 'react';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { useTranslation } from 'react-i18next';

export interface AdvancedBoardSetupProps {
    admissionControl: boolean;
    encryptedData: boolean;
    onSetAdmissionControl: (enabled: boolean) => void;
    onSetEncryptedData: (enabled: boolean) => void;
}

export const AdvancedBoardSetup: React.FC<AdvancedBoardSetupProps> = ({ admissionControl, encryptedData, onSetAdmissionControl, onSetEncryptedData }) => {
    const { t } = useTranslation('advancedBoardSetup');

    return (
        <>
            <ExpansionPanel>
                <ExpansionPanelSummary>
                    <Typography>{t('heading')}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div>
                        <Typography>{t('helper')}</Typography>
                        <FormGroup>
                            <FormControlLabel
                                onClick={(event) => event.stopPropagation()}
                                onFocus={(event) => event.stopPropagation()}
                                control={
                                    <Switch
                                        checked={admissionControl}
                                        onChange={(event) => {
                                            onSetAdmissionControl(event.target.checked);
                                        }}
                                    />
                                }
                                label={t('admissionControl.heading')}
                            />
                            <Typography color="textSecondary">{t('admissionControl.helper')}</Typography>

                            <FormControlLabel
                                onClick={(event) => event.stopPropagation()}
                                onFocus={(event) => event.stopPropagation()}
                                control={<Switch checked={encryptedData} onChange={(event) => onSetEncryptedData(event.target.checked)} disabled={!admissionControl} />}
                                label={t('encryptData.heading')}
                            />
                            <Typography color="textSecondary">{t('encryptData.helper')}</Typography>
                        </FormGroup>
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </>
    );
};

export default AdvancedBoardSetup;
