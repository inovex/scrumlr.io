import React, { useState } from 'react';
import './UserConsent.scss';
import { setPrivacyPreferences } from '../privacyPreferences';
import Checkbox from '../../../view/basic/components/Checkbox';
import Button from '../../../view/basic/components/Button';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

export interface UserPreferencesProps {
    open: boolean;
    handleClose: () => void;
}

export interface UserConsentState {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
}
const PrivacyPreferencesDialog: React.FC<UserPreferencesProps> = ({ open, handleClose }) => {
    const [state, setState] = useState<UserConsentState>({
        enableAnalytics: true,
        enableErrorReporting: true
    });

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="privacy-preferences__dialog-title" aria-describedby="privacy-preferences__dialog-description">
            <DialogTitle id="privacy-preferences__dialog-title">Privacy preferences</DialogTitle>
            <DialogContent>
                <DialogContentText id="privacy-preferences__dialog-description">You can set your privacy preferences here.</DialogContentText>

                <List>
                    <ListItem>
                        <ListItemIcon>
                            <Checkbox checked disabled inputProps={{ 'aria-labelledby': 'enable-basic-cookies' }} />
                        </ListItemIcon>
                        <ListItemText
                            id="enable-basic-cookies"
                            primary="Necessary cookies (Required)"
                            secondary="These cookies are necessary for the website to function and cannot be switched off in our systems. These cookies do not store any personally identifiable information."
                        />
                    </ListItem>

                    <Divider />

                    <ListItem>
                        <ListItemIcon>
                            <Checkbox
                                checked={state.enableAnalytics}
                                onChange={(e) => setState({ ...state, enableAnalytics: e.target.checked })}
                                inputProps={{ 'aria-labelledby': 'enable-analytics' }}
                            />
                        </ListItemIcon>
                        <ListItemText
                            id="enable-analytics"
                            primary="Enable analtics (Optional)"
                            secondary="These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site."
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <Checkbox
                                checked={state.enableErrorReporting}
                                onChange={(e) => setState({ ...state, enableErrorReporting: e.target.checked })}
                                inputProps={{ 'aria-labelledby': 'enable-error-reporting' }}
                            />
                        </ListItemIcon>
                        <ListItemText
                            id="enable-error-reporting"
                            primary="Enable error reporting (Optional)"
                            secondary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
                        />
                    </ListItem>
                </List>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        handleClose();
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        setPrivacyPreferences(state.enableAnalytics, state.enableErrorReporting);
                        handleClose();
                    }}
                    variant="contained"
                >
                    Update preferences
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrivacyPreferencesDialog;
