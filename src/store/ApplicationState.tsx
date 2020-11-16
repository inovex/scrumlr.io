import Authentication from 'types/Authentication';
import Board from 'types/Board';

export interface ApplicationState {
    firebase: {
      auth: Authentication;
    };
    firestore: {
      ordered: {
        boards: Board[];
      };
      data: {
        boards: any;
      };
    };
}