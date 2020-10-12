import Authenticaton from 'types/Authentication';
import Board from 'types/Board';

export interface ApplicationState {
    firebase: {
      auth: Authenticaton;
    };
    firestore: {
      ordered: {
        boards: Board[];
      };
      data: {
        boards: any;
      };
    };
};