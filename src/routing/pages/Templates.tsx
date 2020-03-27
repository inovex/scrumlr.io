import React, { useState } from 'react';
import { getFirebase, isLoaded, useFirestoreConnect } from 'react-redux-firebase';
import { useSelector } from 'react-redux';
import { ApplicationState, Template } from '../../types/state';
import { TemplateCard } from '../../components/TemplateCard';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { Redirect } from 'react-router-dom';

export interface TemplatesState {
    creating: boolean;
    board?: string;
}

export const Templates: React.FC = () => {
    const [state, setState] = useState<TemplatesState>({
        creating: false
    });

    useFirestoreConnect({
        collection: 'templates',
        orderBy: ['featured', 'asc'],
        limit: 20
    });

    const templates = useSelector((state: ApplicationState) => state.firestore.data.templates);
    if (!isLoaded(templates)) {
        return <>Loading templates ...</>;
    }

    if (Boolean(state.board)) {
        return <Redirect to={`/boards/${state.board}`} />;
    }

    const createBoard = (templateId: string, template: Template) => {
        setState({ ...state, creating: true });

        const firestore = getFirebase().firestore();
        firestore
            .collection('boards')
            .add({
                secure: false,
                owner: getFirebase().auth().currentUser!.uid,
                template: templateId
            })
            .then((ref) => {
                const promises: Promise<any>[] = [];

                promises.push(
                    ref.collection('members').doc(getFirebase().auth().currentUser!.uid).set({
                        admin: true,
                        markedAsDone: false
                    })
                );

                template.columns.forEach((column) => {
                    promises.push(
                        ref.collection('columns').add({
                            name: column.name,
                            visible: column.visible
                        })
                    );
                });

                Promise.all(promises).then(() => {
                    setState({ ...state, creating: false, board: ref.id });
                });
            });
    };

    const entries = Object.entries(templates).map(([id, template]) => ({
        id,
        template,
        component: (
            <li key={id}>
                <TemplateCard id={id} {...template} onStart={() => createBoard(id, template)} disabled={state.creating} />
            </li>
        )
    }));

    return (
        <div>
            <h2>Create new board</h2>
            <aside>
                <h3>Advanced configuration</h3>
                <FormGroup>
                    <FormControlLabel control={<Switch />} label="Secure" />
                </FormGroup>
            </aside>

            <h3>Featured templates</h3>
            <ul>{entries.filter((value) => value.template.featured).map((value) => value.component)}</ul>

            <h3>Other templates</h3>
            <ul>{entries.filter((value) => !value.template.featured).map((value) => value.component)}</ul>

            <p>New templates can be exported from existing boards</p>
        </div>
    );
};

export default Templates;
