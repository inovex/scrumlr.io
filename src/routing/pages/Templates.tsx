import React, { useState } from 'react';
import { isLoaded, useFirestoreConnect } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import { ApplicationState, Template } from '../../types/state';
import { TemplateCard } from '../../components/TemplateCard';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router-dom';
import { createBoard } from '../../domain/board';
import WithId, { mapWithId } from '../../util/withId';
import { useTranslation } from 'react-i18next';
import AdvancedBoardSetup from '../../components/AdvancedBoardSetup';
import { getCurrentUser } from '../../domain/auth';

export interface TemplatesState {
    creatingBoard: boolean;
    admissionControl: boolean;
    encryptedData: boolean;
    selectedTemplate?: WithId<Template>;
    createdBoard?: string;
}

export const Templates: React.FC = () => {
    const { t } = useTranslation('templates');
    const [state, setState] = useState<TemplatesState>({
        creatingBoard: false,
        admissionControl: false,
        encryptedData: false
    });
    useFirestoreConnect(() => [
        {
            collection: 'templates',
            where: ['featured', '==', true],
            limit: 20,
            storeAs: 'featuredTemplates'
        },
        {
            collection: 'templates',
            where: ['featured', '==', false],
            limit: 20,
            storeAs: 'allTemplates'
        },
        {
            collection: 'templates',
            where: ['creator', '==', getCurrentUser()!.uid],
            storeAs: 'myTemplates'
        }
    ]);
    const { featuredTemplates, allTemplates, myTemplates } = useSelector((state: ApplicationState) => state.firestore.data);

    if (Boolean(state.createdBoard)) {
        return <Redirect to={`/boards/${state.createdBoard}`} />;
    }

    if (!isLoaded(featuredTemplates) || !isLoaded(allTemplates) || !isLoaded(myTemplates)) {
        return <>Loading templates ...</>;
    }

    const onCreateBoard = (template: WithId<Template>) => {
        setState({ ...state, creatingBoard: true });
        createBoard(template, state.admissionControl, state.encryptedData).then((ref) => {
            setState({ ...state, creatingBoard: false, createdBoard: ref.id });
        });
    };

    const templateToComponent = (template: WithId<Template>) => (
        <li key={template.id}>
            <TemplateCard template={template} onSelect={() => setState({ ...state, selectedTemplate: template })} disabled={state.creatingBoard} />
        </li>
    );
    const featuredEntries = mapWithId(featuredTemplates).map(templateToComponent);
    const allEntries = mapWithId(allTemplates).map(templateToComponent);
    const myEntries = mapWithId(myTemplates).map(templateToComponent);

    return (
        <div>
            <Typography variant="h2">{t('heading')}</Typography>
            <aside>
                <AdvancedBoardSetup
                    admissionControl={state.admissionControl}
                    encryptedData={state.encryptedData}
                    onSetAdmissionControl={(enabled) => setState({ ...state, admissionControl: enabled, encryptedData: !enabled ? false : state.encryptedData })}
                    onSetEncryptedData={(enabled) => setState({ ...state, encryptedData: enabled })}
                />
                <Button disabled={!state.selectedTemplate || state.creatingBoard} onClick={() => onCreateBoard(state.selectedTemplate!)}>
                    {t('createBoard')}
                </Button>
            </aside>

            <Typography variant="h3">{t('featuredTemplates')}</Typography>
            <ul>{featuredEntries}</ul>

            {allEntries.length > 0 && (
                <>
                    <Typography variant="h3">{t('otherTemplates')}</Typography>
                    <ul>{allEntries}</ul>
                </>
            )}

            <Typography variant="h3">{t('myTemplates')}</Typography>
            {myEntries.length == 0 && (
                <>
                    <Typography>No custom created templates yet</Typography>
                    <Button>Create Template</Button>
                </>
            )}
        </div>
    );
};

export default Templates;
